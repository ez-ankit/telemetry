import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({ success: true, data: { id: crypto.randomUUID(), ...body } }, { status: 201 });
}
