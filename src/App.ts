import cors from "cors";
import express from "express";
import http from "http";
import helmet from "helmet";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import addErrorHandler, { notFoundRoutes } from "./middleware/error-handler";
import sequelizeConnection from "./database";
import hospitalRoutes from "./routes/HospitalRoutes";

export default class App {
  public express: express.Application;

  public httpServer: http.Server;

  public async init(): Promise<void> {
    const { NODE_ENV } = process.env;
    this.express = express();
    this.httpServer = http.createServer(this.express);

    // add all global middleware like cors
    this.middleware();

    // // register the all routes
    this.routes();

    // add the middleware to handle error, make sure to add if after registering routes method
    this.express.use(notFoundRoutes);
    this.express.use(addErrorHandler);

    // In a development/test environment, Swagger will be enabled.
    if (NODE_ENV && NODE_ENV !== "prod") {
      this.setupSwaggerDocs();
    }

    // Sync the Sequelize models with the database
    await sequelizeConnection.sync({ force: false });

    // Authenticate the database connection
    await sequelizeConnection.authenticate();
  }

  /**
   * here register your all routes
   */
  private routes(): void {
    this.express.get("/", this.basePathRoute);
    this.express.use("/api/hospital", hospitalRoutes);
  }

  /**
   * here you can apply your middlewares
   */
  private middleware(): void {
    // support application/json type post data
    // support application/x-www-form-urlencoded post data
    // Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
    this.express.use(helmet({ contentSecurityPolicy: false }));
    this.express.use(express.json({ limit: "100mb" }));
    this.express.use(express.urlencoded({ limit: "100mb", extended: true }));
    const corsOptions = {
      origin: ["http://localhost:3000/", "http://127.0.0.1:3001"],
    };
    this.express.use(cors(corsOptions));
  }

  private basePathRoute(
    request: express.Request,
    response: express.Response
  ): void {
    response.json({ message: "base path" });
  }

  private setupSwaggerDocs(): void {
    this.express.use(
      "/docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument)
    );
  }
}
