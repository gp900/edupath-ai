import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* ===================== CORS ===================== */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ===================== YOUTUBE HELPER ===================== */

// Validate video details using YouTube Videos API
async function getVideoDetails(videoIds: string[], apiKey: string) {
  if (!videoIds.length) return [];

  const url =
    "https://www.googleapis.com/youtube/v3/videos?" +
    new URLSearchParams({
      part: "status,contentDetails,snippet",
      id: videoIds.join(","),
      key: apiKey,
    });

  const res = await fetch(url);
  if (!res.ok) {
    console.error("YouTube Videos API failed:", await res.text());
    return [];
  }

  const data = await res.json();
  return data.items || [];
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// Check if video has region restrictions that would block embedding
function hasBlockingRegionRestriction(video: any): boolean {
  const regionRestriction = video.contentDetails?.regionRestriction;
  if (!regionRestriction) return false;
  
  // If there's a blocked list with many countries, it might be problematic
  if (regionRestriction.blocked && regionRestriction.blocked.length > 50) {
    return true;
  }
  
  // If there's an allowed list and it's very restrictive
  if (regionRestriction.allowed && regionRestriction.allowed.length < 10) {
    return true;
  }
  
  return false;
}

// Score video based on educational relevance
function scoreVideo(video: any): number {
  let score = 0;
  const title = (video.snippet?.title || "").toLowerCase();
  const description = (video.snippet?.description || "").toLowerCase();
  const channelTitle = (video.snippet?.channelTitle || "").toLowerCase();
  const duration = parseDuration(video.contentDetails?.duration || "");

  // STRICT: Filter out shorts (< 5 minutes = 300 seconds)
  if (duration < 300) {
    return -1000; // Effectively disqualify
  }

  // Prefer videos between 10-40 minutes (600-2400 seconds)
  if (duration >= 600 && duration <= 2400) {
    score += 40;
  } else if (duration >= 300 && duration <= 3600) {
    score += 20;
  }

  // Educational keywords boost
  const eduKeywords = ["lecture", "tutorial", "explained", "exam", "study", "learn", "course", "class", "education", "university", "college", "nptel", "gate", "concept", "theory", "introduction", "basics"];
  for (const keyword of eduKeywords) {
    if (title.includes(keyword)) score += 15;
    if (description.includes(keyword)) score += 5;
  }

  // Trusted educational channels
  const trustedChannels = ["nptel", "mit opencourseware", "khan academy", "unacademy", "physics wallah", "gate academy", "neso academy", "ekeeda", "iit"];
  for (const channel of trustedChannels) {
    if (channelTitle.includes(channel)) {
      score += 30;
      break;
    }
  }

  // Penalize potentially problematic content
  const badKeywords = ["shorts", "meme", "funny", "prank", "reaction", "vlog", "gaming"];
  for (const keyword of badKeywords) {
    if (title.includes(keyword)) score -= 50;
  }

  return score;
}

// Fetch and verify the BEST embeddable YouTube video
async function fetchBestYouTubeVideo(query: string): Promise<{ videoId: string; embedUrl: string; title: string } | null> {
  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY not configured");
    return null;
  }
  if (!query) {
    console.error("No query provided");
    return null;
  }

  console.log(`Searching YouTube for: ${query}`);

  // Step 1: Search for multiple videos with educational modifiers
  const searchUrl =
    "https://www.googleapis.com/youtube/v3/search?" +
    new URLSearchParams({
      part: "snippet",
      q: query + " lecture tutorial explained education",
      type: "video",
      maxResults: "15",
      videoEmbeddable: "true",
      videoDuration: "medium", // 4-20 minutes
      relevanceLanguage: "en",
      safeSearch: "strict",
      key: YOUTUBE_API_KEY,
    });

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    console.error("YouTube search failed:", await searchRes.text());
    return null;
  }

  const searchData = await searchRes.json();
  const searchItems = searchData.items || [];

  console.log(`Found ${searchItems.length} search results`);

  if (!searchItems.length) {
    console.log("No search results found");
    return null;
  }

  // Step 2: Get video IDs and fetch detailed info
  const videoIds = searchItems
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  if (!videoIds.length) {
    console.log("No video IDs extracted");
    return null;
  }

  const videoDetails = await getVideoDetails(videoIds, YOUTUBE_API_KEY);
  console.log(`Got details for ${videoDetails.length} videos`);

  // Step 3: STRICT filtering for embeddable, public, processed videos
  const validVideos = videoDetails.filter((video: any) => {
    const status = video.status;
    const contentDetails = video.contentDetails;
    
    if (!status || !contentDetails) {
      console.log(`Video ${video.id}: Missing status or contentDetails`);
      return false;
    }

    const isEmbeddable = status.embeddable === true;
    const isPublic = status.privacyStatus === "public";
    const isProcessed = status.uploadStatus === "processed";
    const hasRegionBlock = hasBlockingRegionRestriction(video);
    const duration = parseDuration(contentDetails.duration || "");
    const isNotShort = duration >= 300; // At least 5 minutes

    if (!isEmbeddable) {
      console.log(`Video ${video.id}: Not embeddable`);
      return false;
    }
    if (!isPublic) {
      console.log(`Video ${video.id}: Not public (${status.privacyStatus})`);
      return false;
    }
    if (!isProcessed) {
      console.log(`Video ${video.id}: Not processed (${status.uploadStatus})`);
      return false;
    }
    if (hasRegionBlock) {
      console.log(`Video ${video.id}: Has region restrictions`);
      return false;
    }
    if (!isNotShort) {
      console.log(`Video ${video.id}: Too short (${duration}s)`);
      return false;
    }

    return true;
  });

  console.log(`${validVideos.length} videos passed all verification checks`);

  if (!validVideos.length) {
    console.log("No valid embeddable videos found after verification");
    return null;
  }

  // Step 4: Score and sort videos
  const scoredVideos = validVideos
    .map((video: any) => ({
      video,
      score: scoreVideo(video),
    }))
    .filter((item: any) => item.score > -500) // Filter out heavily penalized videos
    .sort((a: any, b: any) => b.score - a.score);

  if (!scoredVideos.length) {
    console.log("No videos passed scoring threshold");
    return null;
  }

  // Step 5: Return the best video
  const bestVideo = scoredVideos[0].video;
  const videoId = bestVideo.id;
  const title = bestVideo.snippet?.title || "";

  console.log(`Selected video: "${title}" (ID: ${videoId}, score: ${scoredVideos[0].score})`);

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    title,
  };
}

/* ===================== SERVER ===================== */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { topicName, subjectName, syllabus, universityName } = body;

    // MODE 1: Single topic video recommendation (Resources tab)
    if (topicName && subjectName && !syllabus) {
      console.log(`Fetching video for topic: ${topicName}, subject: ${subjectName}`);
      
      const searchQuery = `${topicName} ${subjectName}`;
      const video = await fetchBestYouTubeVideo(searchQuery);

      if (video) {
        return new Response(
          JSON.stringify({
            success: true,
            video: {
              videoId: video.videoId,
              embedUrl: video.embedUrl,
              title: video.title,
            },
            recommendations: [
              { 
                title: video.title, 
                searchQuery: searchQuery,
                description: "AI-verified embeddable video",
                embedUrl: video.embedUrl,
                videoId: video.videoId,
              }
            ],
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // No verified video found - return empty
        return new Response(
          JSON.stringify({
            success: true,
            video: null,
            recommendations: [],
            message: "No playable video available for this topic",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // MODE 2: Full learning plan generation (requires syllabus)
    if (!syllabus) {
      throw new Error("Either topicName+subjectName OR syllabus is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    /* ===================== SYSTEM PROMPT ===================== */
    const systemPrompt = `
You are an expert academic curriculum analyzer and exam preparation specialist.

Convert university syllabi into structured, exam-oriented learning plans.

⚠️ VIDEO RULES (STRICT) ⚠️
If hasVideo = true, you MUST also provide:
- videoPlatform
- videoSearchQuery

Allowed platforms:
- youtube
- nptel
- codeacademy

Rules for videoSearchQuery:
- Clear topic name
- Exam-oriented keywords
- Suitable for YouTube/NPTEL search
- Prefer Indian exam-focused content

If no reliable video exists:
- hasVideo = false
- videoPlatform = "none"
- videoSearchQuery = ""

Practice rules:
- Numericals, derivations, coding → hasPractice = true
- Pure theory → hasPractice = false (unless numericals exist)

Return STRICT JSON only.
`;

    /* ===================== USER PROMPT ===================== */
    const userPrompt = `
Generate a structured, exam-oriented learning plan.

IMPORTANT:
- Videos must be PER TOPIC
- Use videoSearchQuery (not channels, not URLs)
- Be conservative and accurate

Subject: ${subjectName}
University: ${universityName || "Not specified"}

SYLLABUS:
${syllabus}
`;

    /* ===================== AI CALL ===================== */
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_learning_plan",
                description:
                  "Create an exam-oriented learning plan from a syllabus",
                parameters: {
                  type: "object",
                  properties: {
                    subjectName: { type: "string" },
                    universityName: { type: "string" },
                    totalEstimatedHours: { type: "number" },
                    units: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          estimatedHours: { type: "number" },
                          topics: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                name: { type: "string" },
                                duration: { type: "string" },
                                importance: {
                                  type: "string",
                                  enum: ["high", "medium", "low"],
                                },
                                hasVideo: { type: "boolean" },
                                videoPlatform: {
                                  type: "string",
                                  enum: [
                                    "youtube",
                                    "nptel",
                                    "codeacademy",
                                    "none",
                                  ],
                                },
                                videoSearchQuery: { type: "string" },
                                hasPractice: { type: "boolean" },
                              },
                              required: [
                                "id",
                                "name",
                                "duration",
                                "importance",
                                "hasVideo",
                                "videoPlatform",
                                "videoSearchQuery",
                                "hasPractice",
                              ],
                              additionalProperties: false,
                            },
                          },
                        },
                        required: ["id", "name", "estimatedHours", "topics"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: [
                    "subjectName",
                    "universityName",
                    "totalEstimatedHours",
                    "units",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "create_learning_plan" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Invalid AI response");

    const learningPlan = JSON.parse(toolCall.function.arguments);

    /* ===================== AUTO-EMBED BEST YOUTUBE VIDEO ===================== */
    for (const unit of learningPlan.units) {
      for (const topic of unit.topics) {
        if (topic.hasVideo && topic.videoPlatform === "youtube") {
          const video = await fetchBestYouTubeVideo(topic.videoSearchQuery);
          topic.videoId = video?.videoId || "";
          topic.embedUrl = video?.embedUrl || "";
        } else {
          topic.videoId = "";
          topic.embedUrl = "";
        }
      }
    }

    /* ===================== RESPONSE ===================== */
    return new Response(
      JSON.stringify({ success: true, learningPlan }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to process request",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
