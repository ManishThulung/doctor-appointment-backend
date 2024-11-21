import { NextFunction, Request, Response, Router } from "express";
import AuthController from "../controllers/AuthController";
import { authenticate } from "../middleware/auth-middleware";

const router = Router();

router.get(
  "/me",
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    new AuthController().getProfile(req, res, next);
  }
);

router.post(
  "/user/login",
  (req: Request, res: Response, next: NextFunction) => {
    new AuthController().loginUser(req, res, next);
  }
);

router.post(
  "/user/register",
  (req: Request, res: Response, next: NextFunction) => {
    new AuthController().registerUser(req, res, next);
  }
);

router.get(
  "/email/verify",
  (req: Request, res: Response, next: NextFunction) => {
    new AuthController().verifyEmail(req, res, next);
  }
);

router.get(
  "/google/oauth",
  (req: Request, res: Response, next: NextFunction) => {
    new AuthController().oauthSendToken(req, res, next);
  }
);

export default router;
