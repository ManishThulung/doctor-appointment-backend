import { NextFunction, Router, Request, Response } from "express";
import HospitalController from "../controllers/HospitalController";
import EnquiryController from "../controllers/EnquiryController";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getEnquiries(req, res, next);
});
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new HospitalController().getEnquiry(req, res, next);
});

export default router;
