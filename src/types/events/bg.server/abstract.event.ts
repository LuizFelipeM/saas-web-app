import { z } from "zod";

export abstract class BgServerEvent<E extends string, T> {
  public readonly type: E;
  public readonly data: T;
  protected readonly schema: z.ZodType<T>;

  protected constructor(type: E, data: T, schema: z.ZodType<T>) {
    if (!type) throw new Error("Event type is required");
    if (!data) throw new Error("Data is required");
    if (!schema) throw new Error("Schema is required");

    this.schema = schema;
    const result = this.schema.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Invalid data for event type ${type}: ${result.error.message}`
      );
    }

    this.type = type;
    this.data = result.data;
  }
}
