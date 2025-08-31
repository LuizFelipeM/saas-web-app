import { Feature, FeatureType } from "@/types/feature";
import { SubscriptionStatus } from "@/types/subscription-status";
import z from "zod";
import { BgServerEvent } from "../abstract.event";
import { BgServerEventType } from "../webhook.event";
import { BgServerWebhookPayload } from "../webhook.payload";

export interface UserActivatedData {
  subscriptionId: string;
  stripeSubscriptionId: string;
  organizationId: string;
  planId: string;
  features: Record<string, Feature>;
  status: SubscriptionStatus;
  activatedAt: Date;
}

export class UserActivatedEvent extends BgServerEvent<
  BgServerEventType.UserActivated,
  UserActivatedData
> {
  constructor(
    payload: BgServerWebhookPayload<BgServerEventType.UserActivated>
  ) {
    if (payload.event !== BgServerEventType.UserActivated) {
      throw new Error(
        `Invalid event type: expected ${BgServerEventType.UserActivated}, got "${payload.event}"`
      );
    }

    super(
      payload.event,
      payload.data,
      z.object({
        subscriptionId: z.string(),
        stripeSubscriptionId: z.string(),
        organizationId: z.string(),
        planId: z.string(),
        features: z.record(
          z.string(),
          z.object({
            type: z.enum(FeatureType),
            metadata: z
              .object({
                min: z.number().optional(),
                max: z.number().optional(),
              })
              .optional(),
          })
        ),
        status: z.enum(SubscriptionStatus),
        activatedAt: z.string().transform((val) => new Date(val)),
      })
    );
  }
}
