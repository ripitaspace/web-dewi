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
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("[CMS Image Proxy] Error proxying image:", error);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}
