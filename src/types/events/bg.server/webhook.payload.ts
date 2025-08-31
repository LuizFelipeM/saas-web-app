import { BgServerEventDataMap, BgServerEventType } from "./webhook.event";

// Webhook payload type
export interface BgServerWebhookPayload<
  T extends BgServerEventType = BgServerEventType
> {
  id: string;
  timestamp: number;
  event: T;
  data: BgServerEventDataMap[T];
}
