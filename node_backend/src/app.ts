import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import { createDatabaseConnection } from "./database";
import { Container } from "typedi";
import {
  useContainer as routingUseContainer,
  useExpressServer,
} from "routing-controllers";
import { routingControllerOptions } from "./utils/RoutingConfig";
import { useSwagger } from "./utils/Swagger";
import morgan from "morgan";
import cookieParser from 'cookie-parser'
import { logger, stream } from "./utils/Logger";
import { useSentry } from "./utils/Sentry";
import {env} from "./env";
import {useCors} from "./utils/Cors";

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.setDatabase();
    this.setMiddlewares();
  }

  /**
   * set database.
   */
  private async setDatabase(): Promise<void> {
    try {
      await createDatabaseConnection();
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * set middlewares.
   */
  private setMiddlewares(): void {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser(env.app.cookieSecret))
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(morgan("combined", { stream }));
  }

  /**
   * initiate Express.
   * @param port port
   */
  public async createExpressServer(port: number): Promise<void> {
    try {
      useCors(this.app)
      routingUseContainer(Container);
      useExpressServer(this.app, routingControllerOptions);
      useSwagger(this.app);
      useSentry(this.app);

      this.app.listen(port, () => {
        logger.info(`Server is running on http://localhost:${port}`);
      });
    } catch (error) {
      logger.error(error);
    }
  }
}
