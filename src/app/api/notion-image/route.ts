import { NextRequest } from "next/server";
import { handleNotionImageProxy } from "@/modules/cms";

export async function GET(request: NextRequest) {
  return handleNotionImageProxy(request);
}
