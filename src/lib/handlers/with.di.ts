import "reflect-metadata";

export const withDI = (
  handler: (req: Request) => Response | Promise<Response>
) => {
  return async (req: Request): Promise<Response> => {
    return await handler(req);
  };
};
