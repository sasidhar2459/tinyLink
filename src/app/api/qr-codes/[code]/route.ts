import { NextRequest, NextResponse } from "next/server";
import { getQRCodeByCode, deleteQRCode, updateQRCode } from "@/services/qrCodeService";

// GET /api/qr-codes/:code - Get single QR code by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const qrCode = await getQRCodeByCode(code);

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(qrCode, { status: 200 });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR code" },
      { status: 500 }
    );
  }
}

// PUT /api/qr-codes/:code - Update QR code
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { url, newCode } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const updatedQRCode = await updateQRCode(code, url, newCode);

    return NextResponse.json(updatedQRCode, { status: 200 });
  } catch (error: any) {
    console.error("Error updating QR code:", error);

    if (error.message === "QR Code not found") {
      return NextResponse.json(
        { error: "QR Code not found" },
        { status: 404 }
      );
    }

    if (error.message.includes("Invalid") || error.message.includes("already exists")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}

// DELETE /api/qr-codes/:code - Delete QR code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    await deleteQRCode(code);

    return NextResponse.json(
      { message: "QR Code deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting QR code:", error);

    if (error.message === "QR Code not found") {
      return NextResponse.json(
        { error: "QR Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
