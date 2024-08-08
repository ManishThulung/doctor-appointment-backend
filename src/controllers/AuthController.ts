import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { User } from "../database/models/User";
import logger from "../lib/logger";
import { AuthService } from "../services/AuthService";
import BaseController from "./BaseController";
import { EncryptDecrypt } from "../utils/EncryptDecrypt";
import { JwtToken } from "../utils/JwtToken";

export default class AuthController extends BaseController {
  private authUser: AuthService<User>;
  private hash: EncryptDecrypt;
  private jwt: JwtToken;

  constructor() {
    super();
    this.authUser = new AuthService({
      repository: User,
      logger,
    });
    this.hash = new EncryptDecrypt();
    this.jwt = new JwtToken();
  }

  // public async getUsers(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const users: UserAttributes[] = await this.authUser.getUsers();
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
  //     const user: UserAttributes = await this.authUser.getUserById(id);
  //     res.locals.data = user;
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  public async loginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.authUser.getOne({ email, deletedAt: null });
      if (!user) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }

      const isPasswordCorrect = await this.hash.decryptData(
        password,
        user?.password
      );
      if (!isPasswordCorrect) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }

      const payload = {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      };
      const accessToken = await this.jwt.generateToken(payload);
      res.locals.data = {
        accessToken,
        user: { ...payload },
        message: "Login successful",
      };
      res.cookie("token", accessToken, { maxAge: 900000, httpOnly: true });
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  public async registerUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, name } = req.body;
      const existUser = await this.authUser.getOne({ email, deletedAt: null });
      if (existUser) {
        throw new ApiError(
          "User already exist! login instaead.",
          StatusCodes.CONFLICT
        );
      }

      const hashedPassword = await this.hash.encryptData(password);

      const payload = {
        email,
        name,
        password: hashedPassword,
      };

      await this.authUser.registerUser(payload);
      res.locals.data = {
        success: true,
        message: "Email has been sent. Verify it first",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
}
