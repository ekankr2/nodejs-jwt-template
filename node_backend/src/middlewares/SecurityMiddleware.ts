import { Request, Response, NextFunction } from "express";
import { Middleware, ExpressMiddlewareInterface } from "routing-controllers";
import helmet from "helmet";

/**
 * Express security Helmet middleware
 */
@Middleware({ type: "before" })
export class SecurityMiddleware implements ExpressMiddlewareInterface {
  use(req: Request, res: Response, next: NextFunction): any {
    return helmet()(req, res, next);
  }
}
