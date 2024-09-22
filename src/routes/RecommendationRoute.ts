import { NextFunction, Request, Response, Router } from "express";
import RecommendationController from "../controllers/RecommendationController";

const router = Router();

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new RecommendationController().getRecommendations(req, res, next);
});

export default router;
