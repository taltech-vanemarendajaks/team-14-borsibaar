import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backendUrl}/api/orders`, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
