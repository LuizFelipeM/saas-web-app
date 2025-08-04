import z from "zod";
import { BgServerEvent } from "../abstract.event";
import { BgServerEventType } from "../webhook.event";
import { BgServerWebhookPayload } from "../webhook.payload";

export interface UserActivatedData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class UserActivatedEvent extends BgServerEvent<
  BgServerEventType.UserActivated,
  UserActivatedData
> {
  constructor(
    payload: BgServerWebhookPayload<BgServerEventType.UserActivated>
  ) {
    if (payload.type !== BgServerEventType.UserActivated) {
      throw new Error(
        `Invalid event type: expected ${BgServerEventType.UserActivated}, got "${payload.type}"`
      );
    }

    super(
      payload.type,
      payload.data,
      z.object({
        id: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        imageUrl: z.string(),
        createdAt: z.string().transform((val) => new Date(val)),
        updatedAt: z
          .string()
          .optional()
          .transform((val) => (val ? new Date(val) : undefined)),
      })
    );
  }
}
