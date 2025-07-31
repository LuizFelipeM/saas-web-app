import { type DatabaseManagerType, DITypes } from "@/lib/di.container/types";
import { Prisma } from "@/lib/generated/prisma";
import { inject, injectable } from "tsyringe";
import * as z from "zod";

@injectable()
export class FeatureService {
  private readonly organizationDelegate: Prisma.OrganizationDelegate;

  private readonly usageSchema = z.record(z.string(), z.number());
  private readonly featuresSchema = z.record(
    z.string(),
    z.object({
      type: z.enum(["DEFAULT", "USAGE", "METERED"]),
      metadata: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
    })
  );

  constructor(
    @inject(DITypes.DatabaseManager)
    private readonly dbManager: DatabaseManagerType
  ) {
    this.organizationDelegate = this.dbManager.client.organization;
  }

  async isAllowed(
    organizationId: string,
    featureKey: string
  ): Promise<boolean> {
    const organization = await this.organizationDelegate.findUnique({
      where: { id: organizationId },
      select: { features: true, usages: true },
    });

    if (!organization || !organization.features || !organization.usages) {
      return false;
    }

    const features = this.featuresSchema.parse(organization.features);
    const feature = features[featureKey];
    if (!feature) return false;

    const usages = this.usageSchema.parse(organization.usages);
    const usage = usages[featureKey];

    switch (feature.type) {
      case "METERED":
        return this.isMeteredFeatureAllowed(feature, usage);
      case "USAGE":
        return this.isUsageFeatureAllowed(feature, usage);
      case "DEFAULT":
        return this.isDefaultFeatureAllowed(feature);
      default:
        return false;
    }
  }

  /**
   * Check if a metered feature (pay as you go) is allowed
   * @param feature - The feature to check
   * @param usage - The usage of the feature
   * @returns true if the feature is allowed, false otherwise
   */
  private isMeteredFeatureAllowed(
    feature: z.infer<typeof this.featuresSchema>[string],
    usage: number
  ) {
    if (!usage) return false;

    return true;
  }

  /**
   * Check if a usage feature (limited to a certain number of usages) is allowed
   * @param feature - The feature to check
   * @param usage - The usage of the feature
   * @returns true if the feature is allowed, false otherwise
   */
  private isUsageFeatureAllowed(
    feature: z.infer<typeof this.featuresSchema>[string],
    usage: number
  ) {
    if (!usage) return false;

    if (feature.metadata?.max && feature.metadata?.max < 1) {
      return false;
    }

    if (feature.metadata?.min && feature.metadata?.min > 1) {
      return false;
    }
    return true;
  }

  /**
   * Check if a default feature (always allowed) is allowed
   * @param feature - The feature to check
   * @returns true if the feature is allowed, false otherwise
   */
  private isDefaultFeatureAllowed(
    feature: z.infer<typeof this.featuresSchema>[string]
  ) {
    return true;
  }
}
