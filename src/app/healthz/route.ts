import { NextResponse } from "next/server";

// GET /healthz - Health check endpoint
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      version: "1.0",
    },
    { status: 200 }
  );
}
