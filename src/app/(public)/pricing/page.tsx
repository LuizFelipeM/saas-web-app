"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentInterval, Plan } from "@/config/stripe";
import { useToast } from "@/hooks/use-toast";
import { PricingPlan } from "@/types/plan";
import { useAuth, useUser } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const plans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals and small projects",
    price: 9,
    currency: "USD",
    interval: PaymentInterval.MONTHLY,
    plan: Plan.STARTER,
    features: [
      "Up to 1,000 API calls per month",
      "Basic analytics dashboard",
      "Email support",
      "Standard integrations",
      "Community forum access",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    description: "Ideal for growing businesses and teams",
    price: 29,
    currency: "USD",
    interval: PaymentInterval.MONTHLY,
    plan: Plan.PROFESSIONAL,
    features: [
      "Up to 10,000 API calls per month",
      "Advanced analytics & reporting",
      "Priority email support",
      "All standard integrations",
      "Custom webhook support",
      "Team collaboration tools",
      "Advanced security features",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    price: 99,
    currency: "USD",
    interval: PaymentInterval.MONTHLY,
    plan: Plan.ENTERPRISE,
    features: [
      "Unlimited API calls",
      "Custom analytics & insights",
      "24/7 phone & email support",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced security & compliance",
      "Custom SLA guarantees",
      "On-premise deployment options",
    ],
    popular: false,
  },
];

export default function PricingPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async (plan: PricingPlan) => {
    if (!isSignedIn || !user) {
      router.push("/sign-in");
      return;
    }

    if (
      !user.organizationMemberships ||
      user.organizationMemberships.length === 0
    ) {
      toast({
        title: "Organization required",
        description:
          "You need to be part of an organization to subscribe to a plan.",
      });
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const token = await getToken();
      const organizationId = user.organizationMemberships[0].organization.id;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan.plan,
          interval: plan.interval,
          organizationId: organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">
          Select the perfect plan for your needs. All plans include our core
          features.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`flex flex-col relative ${
              plan.popular
                ? "border-primary shadow-lg scale-105"
                : "border-border"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              )}
              <div className="mt-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>

            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-3 h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {plan.id === "enterprise" ? (
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingPlan === plan.id || !isLoaded}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-16">
        <h2 className="text-2xl font-semibold mb-4">Need a custom plan?</h2>
        <p className="text-muted-foreground mb-6">
          We offer custom solutions for organizations with specific
          requirements.
        </p>
        <Button variant="outline" size="lg">
          Contact Us
        </Button>
      </div>
    </div>
  );
}
