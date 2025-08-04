import { BgServerEventDataMap, BgServerEventType } from "./webhook.event";

// Webhook payload type
export interface BgServerWebhookPayload<
  T extends BgServerEventType = BgServerEventType
> {
  id: string;
  type: T;
  data: BgServerEventDataMap[T];
}
