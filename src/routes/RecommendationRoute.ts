import { NextFunction, Request, Response, Router } from "express";
import RecommendationController from "../controllers/RecommendationController";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new RecommendationController().getRecommendations(req, res, next);
  }
);

export default router;
