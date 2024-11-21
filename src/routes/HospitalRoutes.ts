import { NextFunction, Request, Response, Router } from "express";
import HospitalController from "../controllers/HospitalController";
import { upload } from "../utils/upload";
import { authenticate, authorize } from "../middleware/auth-middleware";
import { Role } from "../types/enums.types";

const router = Router();

const uploadDocuments = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "gallery", maxCount: 9 },
  { name: "certificate", maxCount: 9 },
]);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getHospitals(req, res, next);
});
router.get(
  "/admin",
  authenticate,
  authorize([Role.SuperAdmin]),
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().getHospitalsAdmin(req, res, next);
  }
);
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getHospitalById(req, res, next);
});

router.post(
  "/",
  uploadDocuments,
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().createHospital(req, res, next);
  }
);

router.get(
  "/email/verify",
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().verifyEmail(req, res, next);
  }
);

router.put(
  "/verify",
  authenticate,
  authorize([Role.SuperAdmin]),
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().verifyHospital(req, res, next);
  }
);

router.get(
  "/count/hospital",
  authenticate,
  authorize([Role.SuperAdmin]),
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().getTotalNumberOfHospital(req, res, next);
  }
);

router.post(
  "/login/admin",
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().hospitalAdminLogin(req, res, next);
  }
);
router.patch(
  "/approve",
  authenticate,
  authorize([Role.SuperAdmin]),
  (req: Request, res: Response, next: NextFunction) => {
    new HospitalController().approveHospital(req, res, next);
  }
);

export default router;
