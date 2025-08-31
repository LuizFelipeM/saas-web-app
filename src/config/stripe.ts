// Stripe Price IDs for different subscription plans
// Replace these with your actual Stripe price IDs from your Stripe dashboard

export enum Plan {
  STARTER = "starter",
  PROFESSIONAL = "professional",
  ENTERPRISE = "enterprise",
}

export enum PaymentInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export const STRIPE_PRICE_IDS: Record<Plan, Record<PaymentInterval, string>> = {
  [Plan.STARTER]: {
    [PaymentInterval.MONTHLY]: "price_1RLjj6FRr9QRlBRxiDH5jivr", // Replace with actual price ID
    [PaymentInterval.YEARLY]: "price_1S14T5FRr9QRlBRx0M0955fa", // Replace with actual price ID
  },
  [Plan.PROFESSIONAL]: {
    [PaymentInterval.MONTHLY]: "price_1S14TpFRr9QRlBRxp8UfKEEG", // Replace with actual price ID
    [PaymentInterval.YEARLY]: "price_1S14UNFRr9QRlBRxvqfV64Dt", // Replace with actual price ID
  },
  [Plan.ENTERPRISE]: {
    [PaymentInterval.MONTHLY]: "price_enterprise_monthly", // Replace with actual price ID
    [PaymentInterval.YEARLY]: "price_enterprise_yearly", // Replace with actual price ID
  },
} as const;
