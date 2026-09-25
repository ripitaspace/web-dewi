import { NextRequest, NextResponse } from "next/server";

export async function handleNotionImageProxy(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing image URL parameter", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch upstream image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        // Keep this shorter than Notion's signed URL lifetime. The CMS cache
        // refreshes the source URL every 45 minutes.
        "Cache-Control": "public, max-age=300, s-maxage=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("[CMS Image Proxy] Error proxying image:", error);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}
