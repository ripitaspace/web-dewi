import { NextRequest } from "next/server";
import { handleGetCacheStatus, handlePostRenewCache } from "@/modules/cms";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleGetCacheStatus();
}

export async function POST(request: NextRequest) {
  return handlePostRenewCache(request);
}
