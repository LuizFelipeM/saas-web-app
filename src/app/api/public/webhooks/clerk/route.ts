import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { isClerkError } from "@/lib/utils";
import { verifyWebhook } from "@clerk/backend/webhooks";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const event = await verifyWebhook(req);

    const userService = DIContainer.getInstance(DITypes.UserService);

    switch (event.type) {
      case "user.created": {
        const email = event.data.email_addresses[0].email_address;
        if (!email) {
          throw new Error("Email not found");
        }

        const userClerkId = event.data.id;
        const organizationClerkId =
          event.data.organization_memberships?.[0]?.id;

        try {
          const user = await userService.sync(userClerkId, email);

          const organizationService = DIContainer.getInstance(
            DITypes.OrganizationService
          );

          const organizationName = `${
            event.data.first_name ??
            event.data.email_addresses[0].email_address.split("@")[0]
          }'s Organization`;

          await organizationService.sync(
            user,
            organizationName,
            organizationClerkId
          );
        } catch (error) {
          console.error(
            "Error: Could not sync user and organization.\n",
            error
          );
          throw error;
        }
        break;
      }

      case "user.deleted": {
        const userId = event.data.id;
        if (userId) {
          await userService.delete(userId);
        }
        break;
      }
    }

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Error: Could not process webhook.\n", err);
    if (isClerkError(err)) {
      console.error("Clerk error: ", JSON.stringify(err, null, 2));
    }

    return NextResponse.json(
      { error: "Error: Could not process webhook" },
      { status: 400 }
    );
  }
}
