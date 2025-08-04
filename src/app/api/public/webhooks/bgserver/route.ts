import { BgServerWebhook } from "@/types/events/bg.server";
import { BgServerEventType } from "@/types/events/bg.server/webhook.event";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = BgServerWebhook.constructEvent(body);

    switch (event.type) {
      case BgServerEventType.UserActivated: {
        event.data;
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
