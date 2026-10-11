
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const BASE_URL = process.env.BASE_URL;

    if (!BASE_URL) {
      console.error("URL is not configured");

      return NextResponse.json(
        { message: "end point not match" },
        { status: 500 }
      );
    }

    const response = await axios.post(
      `${BASE_URL}/predict`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Backend request failed:",
        error.response?.status,
        error.response?.data ?? error.message
      );

      return NextResponse.json(
        {
          message: "ERROR IN API",
          detail: error.response?.data ?? error.message,
        },
        {
          status: error.response?.status ?? 502,
        }
      );
    }

    console.error("Predict route error:", error);

    return NextResponse.json(
      { message: 
        "SERVER ERROR" },
      { status: 500 }
    );
  }
}
