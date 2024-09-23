import { NextFunction, Request, Response, Router } from "express";
import AppointmentController from "../controllers/AppointmentController";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().createAppointment(req, res, next);
  }
);

export default router;
