import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, incrementClicks } from "@/services/linkService";
import { getQRCodeByCode, incrementScans } from "@/services/qrCodeService";

// GET /:code - Redirect to original URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // Try link first, then QR code
    const link = await getLinkByCode(code);
    if (link) {
      await incrementClicks(code);
      return NextResponse.redirect(link.url, { status: 302 });
    }

    const qrCode = await getQRCodeByCode(code);
    if (qrCode) {
      await incrementScans(code);
      return NextResponse.redirect(qrCode.url, { status: 302 });
    }

    return NextResponse.json(
      { error: "Link not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.json(
      { error: "Failed to redirect" },
      { status: 500 }
    );
  }
}
