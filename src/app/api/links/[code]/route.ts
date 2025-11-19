import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, deleteLink, updateLink } from "@/services/linkService";

// GET /api/links/:code - Get single link by code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const link = await getLinkByCode(code);

    if (!link) {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(link, { status: 200 });
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link" },
      { status: 500 }
    );
  }
}

// PUT /api/links/:code - Update link
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

    const updatedLink = await updateLink(code, url, newCode);

    return NextResponse.json(updatedLink, { status: 200 });
  } catch (error: any) {
    console.error("Error updating link:", error);

    if (error.message === "Link not found") {
      return NextResponse.json(
        { error: "Link not found" },
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
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE /api/links/:code - Delete link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    await deleteLink(code);

    return NextResponse.json(
      { message: "Link deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting link:", error);

    if (error.message === "Link not found") {
      return NextResponse.json(
        { error: "Link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
