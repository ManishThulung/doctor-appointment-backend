import { NextFunction, Request, Response, Router } from "express";
import UserController from "../controllers/UserController";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  new UserController().getUsers(req, res, next);
});
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  new UserController().getUserById(req, res, next);
});
// router.post("/", (req: Request, res: Response, next: NextFunction) => {
//   new UserController().createUser(req, res, next);
// });

export default router;
