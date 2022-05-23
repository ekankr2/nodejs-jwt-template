import { env } from "../env";

export const routingControllerOptions = {
  routePrefix: env.app.apiPrefix,
  controllers: [`${__dirname}/../controllers/*{.ts,.js}`],
  middlewares: [`${__dirname}/../middlewares/*{.ts,.js}`],
};
