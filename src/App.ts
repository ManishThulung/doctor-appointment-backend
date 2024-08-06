import cors from "cors";
import express from "express";
import http from "http";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import addErrorHandler, { notFoundRoutes } from "./middleware/error-handler";
import sequelizeConnection from "./database";
import hospitalRoutes from "./routes/HospitalRoutes";
import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/AuthRoutes";
import fileRoutes from "./routes/FileRoutes";

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

    try {
      // Sync the Sequelize models with the database
      await sequelizeConnection.sync({ force: false });
    } catch (error) {
      console.log(error, "db error");
    }

    // Authenticate the database connection
    await sequelizeConnection.authenticate();
  }

  /**
   * here register your all routes
   */
  private routes(): void {
    this.express.get("/", this.basePathRoute);
    this.express.use("/api", fileRoutes);
    this.express.use("/api/hospital", hospitalRoutes);
    this.express.use("/api/user", userRoutes);
    this.express.use("/api/auth", authRoutes);
    // this.express.use("/api/hospital", authRoutes);
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
    this.express.use(cookieParser());
    const corsOptions = {
      origin: ["http://localhost:3000", "http://127.0.0.1:3001"],
      credentials: true,
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
