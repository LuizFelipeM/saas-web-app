import z from "zod";
import { BgServerEvent } from "../abstract.event";
import { BgServerEventType } from "../webhook.event";
import { BgServerWebhookPayload } from "../webhook.payload";

export interface UserDeactivatedData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  deactivatedAt: Date;
  deactivatedBy?: string;
  reason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class UserDeactivatedEvent extends BgServerEvent<
  BgServerEventType.UserDeactivated,
  UserDeactivatedData
> {
  constructor(
    payload: BgServerWebhookPayload<BgServerEventType.UserDeactivated>
  ) {
    if (payload.event !== BgServerEventType.UserDeactivated) {
      throw new Error(
        `Invalid event type: expected ${BgServerEventType.UserDeactivated}, got "${payload.event}"`
      );
    }

    super(
      payload.event,
      payload.data,
      z.object({
        id: z.string(),
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        imageUrl: z.string().url(),
        deactivatedAt: z.string().transform((val) => new Date(val)),
        deactivatedBy: z.string().optional(),
        reason: z.string().optional(),
        createdAt: z.string().transform((val) => new Date(val)),
        updatedAt: z
          .string()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
      })
    );
  }
}
