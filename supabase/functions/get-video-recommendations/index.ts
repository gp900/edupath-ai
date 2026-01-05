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
    const { topicName, subjectName } = await req.json();
    
    console.log("Getting video recommendations for:", topicName, "in", subjectName);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an educational content expert. Given a topic and subject, suggest 3-4 specific YouTube video search queries that would find the best educational content for studying this topic.

Return a JSON array of objects with this structure:
[
  {
    "title": "Short descriptive title for the video type",
    "searchQuery": "optimized YouTube search query",
    "description": "Brief description of what this video type covers"
  }
]

Guidelines:
- Make search queries specific and educational
- Include terms like "lecture", "tutorial", "explained", "examples"
- Target university-level content when appropriate
- Include both conceptual explanations and practical examples`;

    const userPrompt = `Topic: ${topicName}
Subject: ${subjectName}

Generate YouTube video search recommendations for studying this topic.`;

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
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const content = data.choices?.[0]?.message?.content;
    let recommendations = [];
    
    try {
      const parsed = JSON.parse(content);
      recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.videos || [];
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback recommendations
      recommendations = [
        {
          title: "Lecture",
          searchQuery: `${topicName} ${subjectName} lecture explained`,
          description: "University-level lecture on this topic"
        },
        {
          title: "Tutorial",
          searchQuery: `${topicName} tutorial for beginners`,
          description: "Step-by-step tutorial"
        },
        {
          title: "Examples",
          searchQuery: `${topicName} solved examples problems`,
          description: "Practice problems with solutions"
        }
      ];
    }

    return new Response(
      JSON.stringify({ success: true, recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error getting video recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get recommendations" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
