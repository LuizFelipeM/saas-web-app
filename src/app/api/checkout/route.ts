import { PaymentInterval, Plan, STRIPE_PRICE_IDS } from "@/config/stripe";
import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import z from "zod";

const getPriceIdMap = (plan: Plan, interval: PaymentInterval): string =>
  STRIPE_PRICE_IDS[plan][interval];

export async function POST(req: Request) {
  try {
    // TODO: Add logging
    // TODO: Add addon management
    const { plan, interval, organizationId } = z
      .object({
        plan: z.enum(Plan),
        interval: z.enum(PaymentInterval),
        organizationId: z.string().startsWith("org_"),
      })
      .parse(await req.json());

    if (!plan) {
      return NextResponse.json(
        { error: "Missing price identifier" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing organization identifier" },
        { status: 400 }
      );
    }

    const { userId } = await auth();
    const userService = DIContainer.getInstance(DITypes.UserService);
    const user = await userService.getByClerkId(userId!);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.stripeId) {
      console.error(`User ${userId} has no stripe customer id`);
      return NextResponse.json(
        { error: "User has no customer account" },
        { status: 400 }
      );
    }

    const stripe = DIContainer.getInstance(DITypes.Stripe);
    const organizationService = DIContainer.getInstance(
      DITypes.OrganizationService
    );

    const organization = await organizationService.getByClerkId(organizationId);
    if (!organization) {
      console.error("Organization not found", organizationId);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    let session: Stripe.Response<Stripe.Checkout.Session>;
    try {
      const priceId = getPriceIdMap(plan, interval);
      session = await stripe.checkout.sessions.create({
        customer: user.stripeId!,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: {
          plan,
          interval,
          priceId,
          organizationId: organization.id,
          userId,
        },
        subscription_data: {
          metadata: {
            plan,
            interval,
            priceId,
            organizationId: organization.id,
            userId,
          },
        },
      });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      return NextResponse.json(
        {
          error:
            "Failed to create checkout session. Please refresh and try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
