import { NextRequest, NextResponse } from "next/server";
import { createLink, getAllLinks } from "@/services/linkService";

// GET /api/links - List all links
export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/links - Create new link
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

    const link = await createLink(url, code);
    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error("Error creating link:", error);

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
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
