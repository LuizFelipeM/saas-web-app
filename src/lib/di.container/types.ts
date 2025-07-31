import { FeatureService } from "@/services/feature/feature.service";
import { OrganizationService } from "@/services/organization.service";
import { UserService } from "@/services/user.service";
import { ClerkClient } from "@clerk/backend";
import { DatabaseManager } from "@saas-packages/database-manager";
import { QueueManager } from "@saas-packages/queue-manager";
import { Redis } from "ioredis";
import { Stripe } from "stripe";
import { PrismaClient } from "../generated/prisma";

export type DatabaseManagerType = DatabaseManager<PrismaClient>;

export const DITypes = {
  DatabaseManager: "DatabaseManager",
  Stripe: "Stripe",
  Redis: "Redis",
  QueueManager: "QueueManager",
  FeatureService: "FeatureService",
  OrganizationService: "OrganizationService",
  UserService: "UserService",
  ClerkClient: "ClerkClient",
} as const;

export type ServiceTypes = {
  [DITypes.DatabaseManager]: DatabaseManagerType;
  [DITypes.Stripe]: Stripe;
  [DITypes.Redis]: Redis;
  [DITypes.QueueManager]: QueueManager;
  [DITypes.FeatureService]: FeatureService;
  [DITypes.OrganizationService]: OrganizationService;
  [DITypes.UserService]: UserService;
  [DITypes.ClerkClient]: ClerkClient;
};
