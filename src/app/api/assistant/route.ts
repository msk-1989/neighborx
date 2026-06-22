import { NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

// AI Neighborhood Assistant — answers hyperlocal questions using LLM
export async function POST(req: Request) {
  const body = await req.json();
  const question: string = body.question || "";
  const neighborhood = body.neighborhood || {
    state: "Maharashtra",
    district: "Latur",
    city: "Udgir",
    area: "Khair Nagar",
    society: "Royal Residency",
  };

  if (!question.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const system = `You are "NX Assistant", the friendly AI neighborhood assistant for NeighborX — India's hyperlocal community super app.
The user lives in: ${neighborhood.society}, ${neighborhood.area}, ${neighborhood.city}, ${neighborhood.district}, ${neighborhood.state}, India.
Help them with hyperlocal questions like: best doctor/school/restaurant nearby, how to find a plumber, how to report a civic issue, how to sell something, how to verify their address, safety tips, local festivals, etc.
Keep answers concise (under 120 words), warm, practical, and India-specific. Use bullet points or short paragraphs. Mention relevant NeighborX modules when helpful (Feed, Marketplace, Services, Jobs, Emergency SOS, Complaints, Lost & Found, Events, AI Assistant, Chat).`;

  try {
    const zai = await ZAI.create();
    const response = await zai.chat.completions.create({
      messages: [
        { role: "system", content: system },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      max_tokens: 350,
    });
    const content = response.choices[0]?.message?.content || "";
    return NextResponse.json({ answer: content });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return NextResponse.json(
      { answer: `Sorry, I couldn't reach the AI service right now. (${msg})` },
      { status: 200 }
    );
  }
}
