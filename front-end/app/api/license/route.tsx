
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const BASE_URL = process.env.BASE_URL;

    if (!BASE_URL) {
      return NextResponse.json(
        { message: "Backend URL is not configured" },
        { status: 500 }
      );
    }

    const response = await axios.get(BASE_URL, {
      timeout: 10000,
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "License API request failed:",
        error.response?.data ?? error.message
      );

      return NextResponse.json(
        { message: "Failed to connect to the API" },
        { status: error.response?.status ?? 502 }
      );
    }

    console.error("License route error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
