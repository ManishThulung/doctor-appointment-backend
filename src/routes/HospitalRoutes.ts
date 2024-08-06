import { NextFunction, Request, Response, Router } from "express";
import HospitalController from "../controllers/HospitalController";
import { upload } from "../utils/upload";

const router = Router();

const uploadDocuments = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "gallery", maxCount: 9 },
]);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getHospitals(req, res, next);
});
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

export default router;
