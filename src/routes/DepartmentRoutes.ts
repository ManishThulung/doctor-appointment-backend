import { NextFunction, Request, Response, Router } from "express";
import { upload } from "../utils/upload";
import DepartmentController from "../controllers/DepartmentController";
import { authenticate, authorize } from "../middleware/auth-middleware";
import { Role } from "../types/enums.types";

const router = Router();

const uploadDocuments = upload.fields([{ name: "image", maxCount: 1 }]);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new DepartmentController().getDepartments(req, res, next);
});
// router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
//   new DoctorController().getDoctorById(req, res, next);
// });

router.post(
  "/",
  authenticate,
  authorize([Role.SuperAdmin]),
  uploadDocuments,
  (req: Request, res: Response, next: NextFunction) => {
    new DepartmentController().createDepartment(req, res, next);
  }
);

export default router;
