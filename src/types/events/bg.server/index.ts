import { UserActivatedEvent } from "./user/activated";
import { UserDeactivatedEvent } from "./user/deactivated";
import {
  BgServerEventClassMap,
  BgServerEventType,
  BgServerWebhookEvent,
} from "./webhook.event";
import { BgServerWebhookPayload } from "./webhook.payload";

export class BgServerWebhook {
  /**
   * Constructs a webhook event from a payload, similar to Stripe's webhooks.constructEvent
   * @param payload The webhook payload
   * @returns The constructed event instance with proper typing
   */
  static constructEvent<T extends BgServerEventType>(
    payload: BgServerWebhookPayload<T>
  ): BgServerEventClassMap[T] {
    switch (payload.type) {
      case BgServerEventType.UserActivated:
        return new UserActivatedEvent(
          payload as BgServerWebhookPayload<BgServerEventType.UserActivated>
        ) as BgServerEventClassMap[T];
      case BgServerEventType.UserDeactivated:
        return new UserDeactivatedEvent(
          payload as BgServerWebhookPayload<BgServerEventType.UserDeactivated>
        ) as BgServerEventClassMap[T];
      default:
        throw new Error(
          `Unknown Background Server event type: ${payload.type}`
        );
    }
  }

  /**
   * Type-safe method to check if an event is of a specific type
   * @param event The webhook event
   * @param type The event type to check
   * @returns True if the event is of the specified type
   */
  static isEventType<T extends BgServerEventType>(
    event: BgServerWebhookEvent,
    type: T
  ): event is BgServerEventClassMap[T] {
    return event.type === type;
  }

  /**
   * Get all supported event types
   * @returns Array of all supported event types
   */
  static getSupportedEventTypes(): BgServerEventType[] {
    return Object.values(BgServerEventType) as BgServerEventType[];
  }
}
