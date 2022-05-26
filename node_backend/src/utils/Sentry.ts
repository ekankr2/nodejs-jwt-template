import express from "express";
import * as Sentry from "@sentry/node";
import { env } from "../env";

/**
 * user Sentry
 * @param app Express Application
 */
export function useSentry(app: express.Application) {
  Sentry.init({ dsn: env.sentry.dsn });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());
}
