import { Request, Response, NextFunction } from "express";
import {
  Middleware,
  ExpressErrorMiddlewareInterface,
} from "routing-controllers";
import { logger } from "../utils/Logger";

/**
 * Error middleware
 */
@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, req: Request, res: Response, next: NextFunction): void {
    logger.error(error);
    next(error);
  }
}
