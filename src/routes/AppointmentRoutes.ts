import { NextFunction, Request, Response, Router } from "express";
import AppointmentController from "../controllers/AppointmentController";
import { authenticate, authorize } from "../middleware/auth-middleware";
import { Role } from "../types/enums.types";

const router = Router();

router.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().createAppointment(req, res, next);
  }
);

router.get(
  "/",
  authenticate,
  authorize([Role.Admin]),
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().getAppointments(req, res, next);
  }
);

router.get(
  "/doctor",
  authenticate,
  authorize([Role.Doctor]),
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().getAppointmentsOfDoctor(req, res, next);
  }
);

router.get(
  "/me",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().getUserAppointments(req, res, next);
  }
);

router.post(
  "/me/cancel",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new AppointmentController().cancelAppointment(req, res, next);
  }
);

export default router;
