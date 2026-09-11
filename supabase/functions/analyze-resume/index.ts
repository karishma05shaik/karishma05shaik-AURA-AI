import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function extractTextFromData(data: any): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (data.text) return data.text;
  const parts: string[] = [];
  if (data.name) parts.push(`Name: ${data.name}`);
  if (data.email) parts.push(`Email: ${data.email}`);
  if (data.phone) parts.push(`Phone: ${data.phone}`);
  if (data.summary) parts.push(`Summary: ${data.summary}`);
  if (data.experience && Array.isArray(data.experience)) {
    parts.push("Experience:");
    for (const exp of data.experience) {
      parts.push(`- ${exp.role || exp.title || ""} at ${exp.company || exp.companyName || ""}: ${exp.description || exp.summary || ""}`);
    }
  }
  if (data.education && Array.isArray(data.education)) {
    parts.push("Education:");
    for (const edu of data.education) {
      parts.push(`- ${edu.degree || ""} from ${edu.institution || edu.school || ""}`);
    }
  }
  if (data.skills && Array.isArray(data.skills)) {
    parts.push(`Skills: ${data.skills.join(", ")}`);
  }
  if (data.projects && Array.isArray(data.projects)) {
    parts.push("Projects:");
    for (const proj of data.projects) {
      parts.push(`- ${proj.name || proj.title || ""}: ${proj.description || ""}`);
    }
  }
  return parts.join("\n");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { resumeText, jobRole, fileName } = await req.json();

    if (!resumeText || !jobRole) {
      return new Response(
        JSON.stringify({ error: "Resume text and job role are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured. Please add OPENAI_API_KEY to edge function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are AURA AI, an expert ATS resume analyzer and career advisor. Analyze the following resume against the job role "${jobRole}".

Resume content:
${resumeText}

Provide a detailed analysis in JSON format with these fields:
{
  "score": <integer 1-10>,
  "verdict": "<one sentence summary - if score >= 8 say something like 'You created a superb resume that suits your job role!'>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "missingElements": ["<what's missing 1>", "<what's missing 2>", ...],
  "recommendations": ["<actionable recommendation 1>", "<recommendation 2>", ...],
  "atsCompatibility": {
    "score": <integer 1-10>,
    "notes": "<brief ATS compatibility notes>"
  },
  "keywordMatch": {
    "found": ["<keyword 1>", ...],
    "missing": ["<missing keyword 1>", ...]
  }
}

Be specific, actionable, and encouraging. Return ONLY valid JSON, no markdown.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are AURA AI, an expert ATS resume analyzer. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openaiResponse.status} - ${errText}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content || "";

    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = {
          score: 0,
          verdict: "Unable to parse analysis",
          strengths: [],
          weaknesses: [],
          missingElements: [],
          recommendations: [],
          atsCompatibility: { score: 0, notes: "" },
          keywordMatch: { found: [], missing: [] },
        };
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis: analysisResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
