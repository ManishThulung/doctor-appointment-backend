import * as http from "http";
import { AddressInfo } from "net";
import App from "./App";
import logger from "./lib/logger";
import { PatientReminder } from "./automation/PatientReminder";

const app: App = new App();
let server: http.Server;

function serverError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }
  // handle specific error codes
  throw error;
}

function serverListening(): void {
  const addressInfo: AddressInfo = <AddressInfo>server.address();
  logger.info(
    `Listening on ${addressInfo.address}:${process.env.PORT || 8000}`
  );
}

const patientReminder = new PatientReminder();
app
  .init()
  .then(() => {
    patientReminder.init();
    app.express.set("port", process.env.PORT || 8000);

    server = app.httpServer;
    server.on("error", serverError);
    server.on("listening", serverListening);
    server.listen(process.env.PORT || 8000);
  })
  .catch((err: Error) => {
    logger.info("app.init error");
    logger.error(err.name);
    logger.error(err.message);
    logger.error(err.stack);
  });

process.on("unhandledRejection", (reason: Error) => {
  logger.error("Unhandled Promise Rejection: reason:", reason.message);
  logger.error(reason.stack);
  // application specific logging, throwing an error, or other logic
});
