import { PaymentInterval, Plan } from "@/config/stripe";

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: PaymentInterval;
  plan: Plan;
  features: string[];
  popular: boolean;
}
