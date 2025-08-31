export enum FeatureType {
  DEFAULT = "DEFAULT",
  USAGE = "USAGE",
  METERED = "METERED",
}

export interface Feature {
  type: FeatureType;
  metadata?: FeatureMetadata;
}

export interface FeatureMetadata {
  min?: number;
  max?: number;
}

export interface FeatureUsage {
  value: number;
  timestamp: Date;
}
