import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

Your job is to convert university syllabi into exam-oriented learning plans.

⚠️ VIDEO AVAILABILITY RULES (STRICT) ⚠️
Mark hasVideo = true ONLY IF high-quality structured videos exist on:

Allowed platforms ONLY:
1. YouTube
2. CodeAcademy
3. NPTEL / SWAYAM
4. Indian YouTube education channels

Trusted Indian channels:
- Gate Smashers
- Neso Academy
- Knowledge Gate
- Jenny’s Lectures CS/IT
- CodeWithHarry
- Apna College
- Telusko
- Abdul Bari
- NPTEL (official)

Rules:
- Coding / algorithms / programming → youtube OR codeacademy
- Engineering theory → indian-youtube OR nptel
- Advanced / niche / research topics → hasVideo = false
- Introductory concepts → hasVideo = true
- DO NOT assume videos exist for all topics

Practice rules:
- Numericals, derivations, coding → hasPractice = true
- Pure theory → hasPractice = false (unless common numericals exist)

Be conservative and realistic.

Return STRICT JSON only. No explanations.
`;

    /* ===================== USER PROMPT ===================== */
    const userPrompt = `
Generate a structured, exam-oriented learning plan.

IMPORTANT:
- Mark hasVideo = true ONLY if videos exist on allowed platforms
- Prefer Indian YouTube channels & NPTEL
- Accuracy > quantity

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
          Authorization: \`Bearer \${LOVABLE_API_KEY}\`,
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
                                    "indian-youtube",
                                    "nptel",
                                    "codeacademy",
                                    "none",
                                  ],
                                },
                                hasPractice: { type: "boolean" },
                              },
                              required: [
                                "id",
                                "name",
                                "duration",
                                "importance",
                                "hasVideo",
                                "videoPlatform",
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
      throw new Error(\`AI Error \${response.status}: \${errorText}\`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("Invalid AI response");
    }

    const learningPlan = JSON.parse(toolCall.function.arguments);

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
