import { Router } from "express";
import SystemStatusController from "./controllers/SystemStatusController";
import { RouteDefinition } from "./types/RouteDefinition";
import logger from "./lib/logger";
import EnquiryController from "./controllers/EnquiryController";
import HospitalController from "./controllers/HospitalController";

function registerControllerRoutes(routes: RouteDefinition[]): Router {
  const controllerRouter = Router();
  routes.forEach((route) => {
    console.log(route,"route")
    switch (route.method) {
      case "get":
        controllerRouter.get(route.path, route.handler);
        break;
      case "post":
        controllerRouter.post(route.path, route.handler);
        break;
      case "put":
        controllerRouter.put(route.path, route.handler);
        break;
      case "patch":
        controllerRouter.put(route.path, route.handler);
        break;
      case "delete":
        controllerRouter.delete(route.path, route.handler);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${route.method}`);
    }
  });
  return controllerRouter;
}

/**
 * Here, you can register routes by instantiating the controller.
 *
 */
export default function registerRoutes(): Router {
  try {
    const router = Router();

    // Define an array of controller objects
    const controllers = [new SystemStatusController(), new EnquiryController(), new HospitalController()];
    console.log(controllers, "controllers")

    // Dynamically register routes for each controller
    controllers.forEach((controller) => {
      console.log(controller.routes,"controller routers")
      // make sure each controller has basePath attribute and routes() method
      router.use(
        `/v1/${controller.basePath}`,
        registerControllerRoutes(controller.routes())
      );
    });

    return router;
  } catch (error) {
    logger.error("Unable to register the routes:", error);
  }
}
