import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
    try {
        // Get the categoryId parameter from the request URL
        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const organizationId = searchParams.get("organizationId");

        // Build the backend URL with optional categoryId parameter
        const url = new URL(`${backendUrl}/api/inventory`);
        if (categoryId) {
            url.searchParams.set("categoryId", categoryId);
        }
        if (organizationId) {
            url.searchParams.set("organizationId", organizationId);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                Cookie: request.headers.get("cookie") || "",
            },
            credentials: "include",
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
            { error: "Failed to fetch inventory" },
            { status: 500 }
        );
    }
}
