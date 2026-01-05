import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const systemPrompt = `You are an expert academic curriculum analyzer and exam preparation specialist. Your task is to parse university syllabi and create structured, exam-oriented learning plans.

When analyzing a syllabus, you must:
1. Identify all units/modules and their topics
2. Assign exam importance (high/medium/low) based on typical exam patterns
3. Estimate realistic study time for each topic
4. Identify which topics typically have video resources available
5. Mark topics that need practice problems

Return a JSON object with this exact structure:
{
  "subjectName": "string",
  "universityName": "string",
  "totalEstimatedHours": number,
  "units": [
    {
      "id": "string",
      "name": "string (e.g., 'Unit I: Introduction to...')",
      "estimatedHours": number,
      "topics": [
        {
          "id": "string (e.g., '1-1')",
          "name": "string (topic name)",
          "duration": "string (e.g., '1.5 hrs')",
          "importance": "high" | "medium" | "low",
          "hasVideo": boolean,
          "hasPractice": boolean
        }
      ]
    }
  ]
}

Guidelines for importance levels:
- HIGH: Topics frequently asked in exams, core concepts, numerical problems
- MEDIUM: Important supporting topics, theory-heavy sections
- LOW: Basic introductory concepts, rarely asked directly

Be thorough but realistic with time estimates based on topic complexity.`;

    const userPrompt = `Parse the following university syllabus and generate a comprehensive exam-oriented learning plan:

Subject: ${subjectName}
University: ${universityName || "Not specified"}

SYLLABUS:
${syllabus}

Generate a complete structured learning plan with units, topics, exam importance ratings, and time estimates.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              description: "Create a structured learning plan from the parsed syllabus",
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
                                enum: ["high", "medium", "low"]
                              },
                              hasVideo: { type: "boolean" },
                              hasPractice: { type: "boolean" }
                            },
                            required: ["id", "name", "duration", "importance", "hasVideo", "hasPractice"],
                            additionalProperties: false
                          }
                        }
                      },
                      required: ["id", "name", "estimatedHours", "topics"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["subjectName", "universityName", "totalEstimatedHours", "units"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_learning_plan" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "create_learning_plan") {
      throw new Error("Invalid response from AI");
    }

    const learningPlan = JSON.parse(toolCall.function.arguments);
    console.log("Learning plan generated with", learningPlan.units?.length, "units");

    return new Response(
      JSON.stringify({ success: true, learningPlan }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating learning plan:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate learning plan" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
