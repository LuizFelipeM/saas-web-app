import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { UserRole } from "@/lib/generated/prisma";
import { Permit } from "permitio";

const permit = new Permit({
  token: process.env.PERMIT_API_KEY!,
  pdp: process.env.PERMIT_PDP_URL!,
});

export async function syncUserRolesToPermit() {
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);

    // Fetch all company users with their roles
    const memberships = await dbManager.client.membership.findMany({
      include: {
        user: {
          select: {
            clerkId: true,
            email: true,
          },
        },
      },
    });

    // Sync each user's roles to Permit
    for (const companyUser of memberships) {
      await permit.api.syncUser({
        key: companyUser.user.clerkId,
        attributes: {
          email: companyUser.user.email,
        },
      });

      // Assign the user to the company with their role
      await permit.api.assignRole({
        user: companyUser.user.clerkId,
        role: companyUser.role.toLowerCase(),
        tenant: companyUser.organizationId,
      });
    }
  } catch (error) {
    console.error("Error syncing roles to Permit:", error);
    throw error;
  }
}

export async function syncSingleUserRole(
  clerkId: string,
  organizationId: string,
  role: UserRole
) {
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);

    // Sync user to Permit
    const user = await dbManager.client.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    await permit.api.syncUser({
      key: clerkId,
      attributes: {
        email: user.email,
      },
    });

    // Assign role in the specific company
    await permit.api.assignRole({
      user: clerkId,
      role: role.toLowerCase(),
      tenant: organizationId,
    });
  } catch (error) {
    console.error("Error syncing single user role to Permit:", error);
    throw error;
  }
}

export async function removeUserRole(clerkId: string, organizationId: string) {
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);

    await permit.api.unassignRole({
      user: clerkId,
      role: "*", // Remove all roles
      tenant: organizationId,
    });
  } catch (error) {
    console.error("Error removing user role from Permit:", error);
    throw error;
  }
}

// Helper function to check permissions
export async function checkPermission(
  clerkId: string,
  organizationId: string,
  action: string
) {
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);

    const result = await permit.check(clerkId, action, {
      type: "company",
      key: organizationId,
    });
    return result;
  } catch (error) {
    console.error("Error checking permission:", error);
    throw error;
  }
}
