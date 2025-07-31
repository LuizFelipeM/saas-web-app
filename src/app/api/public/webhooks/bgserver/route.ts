import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event } = body;

    switch (event) {
      case "user.created": {
        break;
      }
    }
  } catch (err) {
    console.error("Error: Could not process webhook.\n", err);

    return NextResponse.json(
      { error: "Error: Cannot process webhook" },
      { status: 400 }
    );
  }
}
