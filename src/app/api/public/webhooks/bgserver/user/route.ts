import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { JsonValue } from "@/lib/generated/prisma/runtime/library";
import { BgServerWebhook } from "@/types/events/bg.server";
import { UserActivatedEvent } from "@/types/events/bg.server/user/activated";
import { UserDeactivatedEvent } from "@/types/events/bg.server/user/deactivated";
import { BgServerEventType } from "@/types/events/bg.server/webhook.event";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const validEventTypes = [
      BgServerEventType.UserActivated,
      BgServerEventType.UserDeactivated,
    ];

    const body = await req.json();
    const event = BgServerWebhook.constructEvent(body);
    if (!validEventTypes.includes(event.type))
      throw new Error("Invalid event type");

    switch (event.type) {
      case BgServerEventType.UserActivated: {
        handleUserActivated(event);
        break;
      }
      case BgServerEventType.UserDeactivated: {
        handleUserDeactivated(event);
        break;
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Error: Could not process webhook.\n", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 400 }
    );
  }
}

async function handleUserActivated(event: UserActivatedEvent) {
  const organizationService = DIContainer.getInstance(
    DITypes.OrganizationService
  );
  const organization = await organizationService.getById(
    event.data.organizationId
  );

  if (!organization) {
    throw new Error("Organization not found");
  }

  organization.features = event.data.features as unknown as JsonValue;

  await organizationService.update(organization);
}

function handleUserDeactivated(event: UserDeactivatedEvent) {
  console.log("User deactivated", event.data);
}
