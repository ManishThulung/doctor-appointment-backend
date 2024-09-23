import { NextFunction, Request, Response, Router } from "express";
import ReviewController from "../controllers/ReviewController";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new ReviewController().getReviews(req, res, next);
});
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new ReviewController().getReviewById(req, res, next);
});
router.get("/doctor/:id", (req: Request, res: Response, next: NextFunction) => {
  new ReviewController().getReviewByDoctorId(req, res, next);
});

router.post(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new ReviewController().createReview(req, res, next);
  }
);

export default router;
