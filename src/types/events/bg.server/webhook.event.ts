import { BgServerEvent } from "./abstract.event";
import { UserActivatedData, UserActivatedEvent } from "./user/activated";
import { UserDeactivatedData, UserDeactivatedEvent } from "./user/deactivated";

// Define all possible event types
export enum BgServerEventType {
  UserActivated = "user.activated",
  UserDeactivated = "user.deactivated",
}

// Union type of all possible webhook events
export type BgServerWebhookEvent = BgServerEventClassMap[BgServerEventType];

// Define the event classes for each event type
export interface BgServerEventClassMap
  extends Record<BgServerEventType, BgServerEvent<BgServerEventType, any>> {
  [BgServerEventType.UserActivated]: UserActivatedEvent;
  [BgServerEventType.UserDeactivated]: UserDeactivatedEvent;
}

// Define the event data types for each event
export interface BgServerEventDataMap {
  [BgServerEventType.UserActivated]: UserActivatedData;
  [BgServerEventType.UserDeactivated]: UserDeactivatedData;
}
