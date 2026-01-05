import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* ===================== CORS ===================== */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/* ===================== YOUTUBE HELPER ===================== */
async function fetchBestYouTubeVideo(query: string) {
  const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
  if (!YOUTUBE_API_KEY || !query) return null;

  const url =
    "https://www.googleapis.com/youtube/v3/search?" +
    new URLSearchParams({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: "1",
      videoEmbeddable: "true",
      relevanceLanguage: "en",
      safeSearch: "strict",
      key: YOUTUBE_API_KEY,
    });

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  const video = data.items?.[0];

  if (!video?.id?.videoId) return null;

  return {
    videoId: video.id.videoId,
    embedUrl: `https://www.youtube.com/embed/${video.id.videoId}`,
  };
}

/* ===================== SERVER ===================== */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subjectName, universityName, syllabus } = await req.json();

    console.log("Generating learning plan for:", subjectName);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    /* ===================== SYSTEM PROMPT ===================== */
    const systemPrompt = `
You are an expert academic curriculum analyzer and exam preparation specialist.

Parse university syllabi and create structured, exam-oriented learning plans.

VIDEO RULES (STRICT):
If hasVideo = true, you MUST also provide:
- videoSearchQuery
- videoPlatform

Allowed videoPlatform values:
- youtube
- nptel
- codeacademy
- none

Rules:
- Provide videoSearchQuery suitable for YouTube/NPTEL search
- Prefer exam-oriented and Indian faculty content
- If no reliable video exists, set hasVideo=false and videoSearchQuery=""

Practice rules:
- Numericals, derivations, coding → hasPractice=true
- Pure theory → hasPractice=false (unless numericals exist)

Return STRICT JSON only.
`;

    /* ===================== USER PROMPT ===================== */
    const userPrompt = `
Parse the syllabus and generate a learning plan.

IMPORTANT:
- Videos must be PER TOPIC
- Use videoSearchQuery (not channels, not URLs)
- Be conservative and realistic

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
                  "Create a structured learning plan from the parsed syllabus",
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

    return new Response(
      JSON.stringify({ success: true, learningPlan }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating learning plan:", error);
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
