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
  if (!res.ok) return [];

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

// Score video based on educational relevance
function scoreVideo(video: any): number {
  let score = 0;
  const title = (video.snippet?.title || "").toLowerCase();
  const description = (video.snippet?.description || "").toLowerCase();
  const duration = parseDuration(video.contentDetails?.duration || "");

  // Prefer videos between 10-40 minutes (600-2400 seconds)
  if (duration >= 600 && duration <= 2400) {
    score += 30;
  } else if (duration >= 300 && duration <= 3600) {
    score += 15;
  }

  // Educational keywords boost
  const eduKeywords = ["lecture", "tutorial", "explained", "exam", "study", "learn", "course", "class", "education", "university", "college", "nptel", "gate", "concept"];
  for (const keyword of eduKeywords) {
    if (title.includes(keyword)) score += 10;
    if (description.includes(keyword)) score += 3;
  }

  // Penalize shorts and very short videos
  if (duration < 120) score -= 50;

  return score;
}

async function fetchBestYouTubeVideo(query: string) {
  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY || !query) return null;

  // Step 1: Search for multiple videos
  const searchUrl =
    "https://www.googleapis.com/youtube/v3/search?" +
    new URLSearchParams({
      part: "snippet",
      q: query + " lecture tutorial explained",
      type: "video",
      maxResults: "10",
      videoEmbeddable: "true",
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

  if (!searchItems.length) return null;

  // Step 2: Get video IDs and fetch detailed info
  const videoIds = searchItems
    .map((item: any) => item.id?.videoId)
    .filter(Boolean);

  if (!videoIds.length) return null;

  const videoDetails = await getVideoDetails(videoIds, YOUTUBE_API_KEY);

  // Step 3: Filter for embeddable, public, processed videos
  const validVideos = videoDetails.filter((video: any) => {
    const status = video.status;
    if (!status) return false;

    const isEmbeddable = status.embeddable === true;
    const isPublic = status.privacyStatus === "public";
    const isProcessed = status.uploadStatus === "processed";

    return isEmbeddable && isPublic && isProcessed;
  });

  if (!validVideos.length) {
    console.log("No valid embeddable videos found for query:", query);
    return null;
  }

  // Step 4: Score and sort videos
  const scoredVideos = validVideos
    .map((video: any) => ({
      video,
      score: scoreVideo(video),
    }))
    .sort((a: any, b: any) => b.score - a.score);

  // Step 5: Return the best video
  const bestVideo = scoredVideos[0].video;
  const videoId = bestVideo.id;

  console.log(`Selected video: ${bestVideo.snippet?.title} (score: ${scoredVideos[0].score})`);

  return {
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

/* ===================== SERVER ===================== */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjectName, universityName, syllabus } = await req.json();

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
          const video = await fetchBestYouTubeVideo(
            topic.videoSearchQuery
          );
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
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate learning plan",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
