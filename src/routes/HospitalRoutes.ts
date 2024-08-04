import { NextFunction, Request, Response, Router } from "express";
import HospitalController from "../controllers/HospitalController";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getHospitals(req, res, next);
});
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getHospitalById(req, res, next);
});
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().createHospital(req, res, next);
});

export default router;
