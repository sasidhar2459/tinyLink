import { NextRequest, NextResponse } from "next/server";
import { createQRCode, getAllQRCodes } from "@/services/qrCodeService";

// POST /api/qr-codes - Create new QR code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, code } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const qrCode = await createQRCode(url, code);
    return NextResponse.json(qrCode, { status: 201 });
  } catch (error: any) {
    console.error("Error creating QR code:", error);

    // Database connection errors
    if (error.code === 'P1001' || error.message?.includes("Can't reach database")) {
      return NextResponse.json(
        { error: "Database connection unavailable. Please try again later." },
        { status: 503 }
      );
    }

    if (error.message === "Code already exists") {
      return NextResponse.json(
        { error: "Code already exists" },
        { status: 409 }
      );
    }

    if (error.message.includes("Invalid")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}

// GET /api/qr-codes - Get all QR codes
export async function GET(request: NextRequest) {
  try {
    const qrCodes = await getAllQRCodes();
    return NextResponse.json(qrCodes, { status: 200 });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}
