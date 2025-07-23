import { DITypes } from "@/lib/di.container.types";
import { Prisma, PrismaClient } from "@/lib/prisma";
import { Feature } from "@/types/feature";
import { Price } from "@/types/price";
import Stripe from "stripe";
import { inject, injectable } from "tsyringe";

@injectable()
export class PlanService {
  constructor(
    @inject(DITypes.Prisma)
    private readonly prisma: PrismaClient
  ) {}

  async createOrUpdate(product: Stripe.Product, prices: Price[]) {
    const { features: featuresString, ...metadata } =
      product.metadata as Stripe.Metadata & {
        features: string; // JSON string
      };

    const features: Record<string, Feature> = JSON.parse(featuresString);

    if (metadata?.type !== "plan") {
      throw new Error("Product is not a plan, missing metadata.type");
    }

    if (!features) {
      throw new Error(
        "Product doesn't have features, missing metadata.features"
      );
    }

    const planData: Prisma.PlanCreateInput = {
      name: product.name,
      description: product.description ?? null,
      stripeProductId: product.id,
      metadata,
      features: features as unknown as Prisma.JsonObject,
      prices: prices as unknown as Prisma.JsonObject,
      isActive: true,
    };

    return this.prisma.plan.upsert({
      where: { stripeProductId: product.id },
      create: planData,
      update: planData,
    });
  }

  async updatePrices(stripeProductId: string, prices: Price[]) {
    return this.prisma.plan.update({
      where: { stripeProductId },
      data: {
        prices: prices as unknown as Prisma.JsonObject,
      },
    });
  }

  async getFeatures(planId: string) {
    const plan = await this.prisma.plan.findUnique({
      select: { features: true },
      where: { id: planId },
    });
    return plan?.features;
  }

  async getById(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId },
    });
  }

  async getActivePlanById(planId: string) {
    return this.prisma.plan.findUnique({
      where: { id: planId, isActive: true },
    });
  }

  async planExists(stripeProductId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { stripeProductId },
      select: { id: true },
    });
    return !!plan;
  }
}
