import { DIContainer } from "@/lib/di.container";
import { DITypes } from "@/lib/di.container/types";
import { Price } from "@/types/price";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);
    // Get the plan by stripe product ID
    const plan = await dbManager.client.plan.findUnique({
      where: { stripeProductId: id },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const stripe = DIContainer.getInstance(DITypes.Stripe);

    // Fetch all active prices for the product
    const pricesList = await stripe.prices.list({
      product: id,
      active: true,
    });

    const formattedPrices = pricesList.data.map<Price>((price) => ({
      id: price.id,
      active: price.active,
      currency: price.currency,
      unit_amount: price.unit_amount,
      type: price.type,
      recurring: price.recurring,
      metadata: price.metadata,
    }));

    const planService = DIContainer.getInstance(DITypes.PlanService);
    const updatedPlan = await planService.updatePrices(id, formattedPrices);

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan prices:", error);
    return NextResponse.json(
      { error: "Failed to update plan prices" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const dbManager = DIContainer.getInstance(DITypes.DatabaseManager);

    // Deactivate the plan instead of deleting it
    await dbManager.client.plan.update({
      where: { stripeProductId: id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating plan:", error);
    return NextResponse.json(
      { error: "Failed to deactivate plan" },
      { status: 500 }
    );
  }
}
