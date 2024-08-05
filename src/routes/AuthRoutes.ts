import { NextFunction, Request, Response, Router } from "express";
import AuthController from "../controllers/AuthController";

const router = Router();

// router.get("/", (req: Request, res: Response, next: NextFunction) => {
//   new AuthController().getUsers(req, res, next);
// });
// router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
//   new AuthController().getUserById(req, res, next);
// });
router.post("/", (req: Request, res: Response, next: NextFunction) => {
  new AuthController().login(req, res, next);
});

export default router;
