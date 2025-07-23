"use client";

import BillingToggle from "@/components/pricing/BillingToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Feature } from "@/types/feature";
import { Price } from "@/types/price";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  stripeProductId: string;
  features: Record<string, Feature>;
  prices: Price[];
};

export default function PricingPage() {
  const router = useRouter();

  const { toast } = useToast();
  const { getToken } = useAuth();
  const { user, isSignedIn, isLoaded } = useUser();
  const { redirectToSignIn } = useClerk();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      try {
        const plansResponse = await fetch("/api/public/plans", {
          method: "GET",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!plansResponse.ok) {
          throw new Error("Failed to fetch plans");
        }

        const plansData = await plansResponse.json();
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast({
          title: "Erro ao buscar planos",
          description: "Por favor, tente novamente mais tarde.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const findPriceForInterval = (
    planPrices: Price[],
    yearly: boolean
  ): Price | undefined => {
    const interval = yearly ? "year" : "month";
    return planPrices?.find(
      (p) =>
        p.active && p.type === "recurring" && p.recurring?.interval === interval
    );
  };

  // Helper function to get the price amount
  const getPriceAmount = (plan: Plan): number | string => {
    const priceObject = findPriceForInterval(plan.prices, isYearly);
    if (!priceObject?.unit_amount) return "N/A";
    return priceObject.unit_amount / 100;
  };

  // Helper function to get the currency
  const getCurrency = (plan: Plan): string => {
    const priceObject = findPriceForInterval(plan.prices, isYearly);
    if (priceObject?.currency) {
      return priceObject.currency.toUpperCase();
    }
    // Fallback - Review in detail
    const fallbackPriceObject = findPriceForInterval(plan.prices, !isYearly);
    if (fallbackPriceObject?.currency) {
      return fallbackPriceObject.currency.toUpperCase();
    }
    return ""; // Default or error currency
  };

  // Helper function to get the Stripe Price ID for checkout
  const getStripePriceId = (plan: Plan): string | undefined => {
    const priceObject = findPriceForInterval(plan.prices, isYearly);
    return priceObject?.id;
  };

  const handleCheckout = async (plan: Plan) => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      redirectToSignIn({ redirectUrl: window.location.href });
      return;
    }

    setIsLoading(true);
    const priceId = getStripePriceId(plan);
    if (!priceId) {
      console.error(
        "Price not found in plan:",
        plan.name,
        " Yearly:",
        isYearly
      );
      toast({
        title: "Erro ao buscar plano",
        description: "Por favor, tente novamente mais tarde.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      const token = await getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({
          planId: plan.id,
          priceId,
          organizationId: user.organizationMemberships[0].organization.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Erro ao iniciar checkout",
        description:
          "Houve um problema ao iniciar o processo de checkout. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !plans.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Carregando planos e preços...</div>
      </div>
    );
  }

  if (!plans.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-red-600">
          Nenhum plano disponível no momento. Por favor, tente novamente mais
          tarde.
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number | string, currencyCode: string) => {
    if (typeof amount === "string") return amount; // for "N/A"
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(amount);
    } catch (error) {
      // Fallback for invalid currency code, though ideally currency codes from Stripe are valid
      console.error("Error formatting currency:", error);
      return `${currencyCode} ${amount.toFixed(2)}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          {/* Display a general description or a specific one if available */}
          Escolha o plano perfeito para suas necessidades
        </p>
      </div>

      <BillingToggle
        isYearly={isYearly}
        onChange={(value) => setIsYearly(value)}
        yearlySavingsPercent={20}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              )}
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatCurrency(getPriceAmount(plan), getCurrency(plan))}
                </span>
                <span className="text-muted-foreground">
                  /{isYearly ? "ano" : "mês"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {Object.entries(plan.features || {}).map(([key, feature]) => (
                  <li key={key} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    {key}
                    {feature.type === "USAGE" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Usage-based)
                      </span>
                    )}
                    {feature.type === "METERED" && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Metered)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleCheckout(plan)}
                disabled={!getStripePriceId(plan) || !isLoaded || isLoading}
              >
                {!isLoaded || isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : getStripePriceId(plan) ? (
                  "Escolher plano"
                ) : (
                  "Indisponível"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
