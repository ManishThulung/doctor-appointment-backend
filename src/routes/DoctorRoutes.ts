import { NextFunction, Request, Response, Router } from "express";
import DoctorController from "../controllers/DoctorController";
import { upload } from "../utils/upload";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

const uploadDocuments = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "certificate", maxCount: 9 },
]);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new DoctorController().getDoctors(req, res, next);
});
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new DoctorController().getDoctorById(req, res, next);
});

router.get(
  "/hospital/:id",
  (req: Request, res: Response, next: NextFunction) => {
    new DoctorController().getDoctorsByHospitalId(req, res, next);
  }
);

router.get(
  "/email/verify",
  (req: Request, res: Response, next: NextFunction) => {
    new DoctorController().verifyEmail(req, res, next);
  }
);

router.post(
  "/",
  uploadDocuments,
  (req: Request, res: Response, next: NextFunction) => {
    new DoctorController().createDoctor(req, res, next);
  }
);

router.post(
  "/appointment",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new DoctorController().createAppointment(req, res, next);
  }
);

export default router;
