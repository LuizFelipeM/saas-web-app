import { type DatabaseManagerType, DITypes } from "@/lib/di.container/types";
import { Prisma, User } from "@/lib/generated/prisma";
import { Queues } from "@/lib/queues";
import { QueueEvents } from "@/lib/queues/events";
import { QueueManager } from "@saas-packages/queue-manager";
import Stripe from "stripe";
import { inject, injectable } from "tsyringe";

@injectable()
export class UserService {
  private readonly userDelegate: Prisma.UserDelegate;

  constructor(
    @inject(DITypes.Stripe)
    private readonly stripe: Stripe,
    @inject(DITypes.DatabaseManager)
    private readonly dbManager: DatabaseManagerType,
    @inject(DITypes.QueueManager)
    private readonly queueManager: QueueManager
  ) {
    this.userDelegate = this.dbManager.client.user;
  }

  async getById(id: string): Promise<User | null> {
    return await this.userDelegate.findUnique({
      where: { id },
    });
  }

  async getByClerkId(clerkId: string): Promise<User | null> {
    return await this.userDelegate.findUnique({
      where: { clerkId },
    });
  }

  async sync(clerkUserId: string, email: string): Promise<User> {
    let user: User | null = await this.userDelegate.findFirst({
      where: {
        OR: [{ clerkId: clerkUserId }, { email }],
      },
    });

    if (user && user.clerkId !== clerkUserId) {
      console.error(
        `[USER SYNC] An account ${user.id} (${user.clerkId}) with this ${email} email already exists, skipping sync for ${clerkUserId}`
      );
      throw new Error("An account with this email already exists");
    }

    let stripeId: string | undefined = user?.stripeId ?? undefined;
    if (!stripeId) {
      try {
        stripeId = (
          await this.stripe.customers.create({
            email,
          })
        ).id;
      } catch (error) {
        console.error(error);
      }
    }

    user = await this.userDelegate.upsert({
      where: { clerkId: clerkUserId },
      update: { email, stripeId },
      create: { email, clerkId: clerkUserId, stripeId },
    });

    await this.queueManager.addJob(Queues.USER_SYNC, {
      type: QueueEvents.USER_SYNC.SYNC,
      user,
    });
    return user;
  }

  async delete(clerkUserId: string): Promise<void> {
    const user = await this.userDelegate.delete({
      where: { clerkId: clerkUserId },
    });

    await this.queueManager.addJob(Queues.USER_SYNC, {
      type: QueueEvents.USER_SYNC.DELETE,
      user,
    });
  }
}
