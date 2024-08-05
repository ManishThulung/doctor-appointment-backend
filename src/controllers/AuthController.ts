import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { User } from "../database/models/User";
import logger from "../lib/logger";
import { AuthService } from "../services/AuthService";
import BaseController from "./BaseController";

export default class AuthController extends BaseController {
  private auth: AuthService<User>;

  constructor() {
    super();
    this.auth = new AuthService({
      repository: User,
      logger,
    });
  }

  // public async getUsers(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const users: UserAttributes[] = await this.auth.getUsers();
  //     res.locals.data = users;
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // public async getUserById(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const id = req.params.id;
  //     const user: UserAttributes = await this.auth.getUserById(id);
  //     res.locals.data = user;
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  public async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      // if (!name && !country) {
      //   throw new ApiError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
      // }
      const existUser = await this.auth.getOne({ email, deletedAt: null });
      if (!existUser) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }
      const user = await this.auth.login({ email, password });

      const isPasswordCorrect = false;
      if (!isPasswordCorrect) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }

      const accessToken = "sdf"; // user.generateAccessToken();
      res.locals.data = {
        accessToken,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
