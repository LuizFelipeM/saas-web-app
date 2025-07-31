import { QueueManager } from "@saas-packages/queue-manager";

export enum Queues {
  STRIPE_WEBHOOKS = "stripe-webhooks",
  USER_SYNC = "user-sync",
  ORGANIZATION_SYNC = "organization-sync",
}

export function createQueues(queueManager: QueueManager) {
  for (const queue of Object.values(Queues)) {
    queueManager.createQueue(queue);
  }
}
