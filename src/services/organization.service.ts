import { type DatabaseManagerType, DITypes } from "@/lib/di.container/types";
import { Organization, Prisma, User, UserRole } from "@/lib/generated/prisma";
import { Queues } from "@/lib/queues";
import { QueueEvents } from "@/lib/queues/events";
import type { ClerkClient } from "@clerk/backend";
import { QueueManager } from "@saas-packages/queue-manager";
import { inject, injectable } from "tsyringe";

@injectable()
export class OrganizationService {
  private readonly organizationDelegate: Prisma.OrganizationDelegate;
  private readonly membershipDelegate: Prisma.MembershipDelegate;

  constructor(
    @inject(DITypes.DatabaseManager)
    private readonly dbManager: DatabaseManagerType,
    @inject(DITypes.QueueManager)
    private readonly queueManager: QueueManager,
    @inject(DITypes.ClerkClient)
    private readonly clerkClient: ClerkClient
  ) {
    this.organizationDelegate = this.dbManager.client.organization;
    this.membershipDelegate = this.dbManager.client.membership;
  }

  async getById(id: string): Promise<Organization | null> {
    return await this.organizationDelegate.findUnique({
      where: { id },
    });
  }

  async getByClerkId(clerkId: string): Promise<Organization | null> {
    return await this.organizationDelegate.findUnique({
      where: { clerkId },
    });
  }

  async sync(
    user: User,
    organizationName: string,
    organizationClerkId?: string,
    role: UserRole = UserRole.VIEWER
  ): Promise<void> {
    if (organizationClerkId) {
      const organization = await this.getByClerkId(organizationClerkId);

      if (organization) await this.addUser(organization.id, user, role);
      else await this.create(organizationName, user);
    } else {
      await this.create(organizationName, user);
    }
  }

  async create(name: string, user: User): Promise<Organization> {
    const clerkOrganization =
      await this.clerkClient.organizations.createOrganization({
        name,
        createdBy: user.clerkId,
      });

    const organization = await this.organizationDelegate.create({
      data: {
        clerkId: clerkOrganization.id,
        name: clerkOrganization.name,
        slug: clerkOrganization.slug,
        memberships: {
          create: {
            userId: user.id,
            role: UserRole.OWNER,
          },
        },
      },
    });

    await this.queueManager.addJob(Queues.ORGANIZATION_SYNC, {
      type: QueueEvents.ORGANIZATION_SYNC.SYNC,
      organization: {
        id: organization.id,
        clerkId: organization.clerkId,
        memberships: [
          {
            userId: user.id,
            role: UserRole.OWNER,
          },
        ],
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      },
    });
    return organization;
  }

  async addUser(
    organizationId: string,
    user: User,
    role: UserRole
  ): Promise<void> {
    await this.clerkClient.organizations.createOrganizationMembership({
      organizationId,
      userId: user.clerkId,
      role,
    });

    const { organization } = await this.membershipDelegate.create({
      data: { organizationId, userId: user.id, role },
      select: {
        organization: {
          select: {
            createdAt: true,
            memberships: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    });

    await this.queueManager.addJob(Queues.ORGANIZATION_SYNC, {
      type: QueueEvents.ORGANIZATION_SYNC.SYNC,
      organization: {
        id: organizationId,
        clerkId: organizationId,
        memberships: organization.memberships.map((membership) => ({
          userId: membership.userId,
          role: membership.role,
        })),
        createdAt: organization.createdAt,
      },
    });
  }
}
