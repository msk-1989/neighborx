import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// AI Complaint Classifier — uses Vision model to auto-categorize a civic issue photo
export async function POST(req: Request) {
  const body = await req.json();
  const imageUrl: string | undefined = body.imageUrl;

  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }

  try {
    const zai = await ZAI.create();
    const prompt = `You are an AI civic-complaint classifier for an Indian neighborhood app (NeighborX).
Analyze this image of a civic issue. Respond ONLY with strict JSON (no markdown) of the form:
{"category": "<one of ROAD, GARBAGE, WATER, ELECTRICITY, STREETLIGHT, DRAINAGE, OTHER>", "confidence": <0-1 number>, "summary": "<one short sentence describing the issue>", "urgency": "<LOW|MEDIUM|HIGH>"}`;
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = response.choices[0]?.message?.content || "";
    // parse JSON robustly
    const match = content.match(/\{[\s\S]*\}/);
    const parsed = match ? JSON.parse(match[0]) : { category: "OTHER", confidence: 0.5, summary: content, urgency: "MEDIUM" };
    return NextResponse.json(parsed);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      { error: msg, category: "OTHER", confidence: 0.4, summary: "Could not classify", urgency: "MEDIUM" },
      { status: 200 }
    );
  }
}
