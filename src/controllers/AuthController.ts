import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { User } from "../database/models/User";
import logger from "../lib/logger";
import { AuthService } from "../services/AuthService";
import BaseController from "./BaseController";
import { EncryptDecrypt } from "../utils/EncryptDecrypt";
import { JwtToken } from "../utils/JwtToken";
import { EmailService } from "../services/EmailService";
import axios from "axios";
import { oauth2Client } from "../utils/outhClient";
import { Role } from "../types/enums.types";

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
        throw new ApiError("User not found!", StatusCodes.NOT_FOUND);
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
        success: true,
        accessToken,
        user: { ...payload },
        message: "Login successful",
      };
      res.cookie("token", accessToken, {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        expires: new Date(Date.now() + 86400 * 100000), // 1 day
      });
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
      const emailService = new EmailService({ repository: User });

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

      const user = await this.authUser.registerUser(payload);
      await emailService.emailSender(
        email,
        "Verify your email",
        `click here to verify your email http://localhost:8000/api/auth/email/verify?id=${user?.id}&email=${email}`
      );
      res.locals.data = {
        success: true,
        message: "Email has been sent. Verify it first",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }

  public async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const emailService = new EmailService({ repository: User });
      const { id, email } = req.query;
      let verifyEmail: any;
      if (typeof id === "string" && typeof email === "string") {
        verifyEmail = await emailService.verifyEmail(id, email);
      }
      if (!verifyEmail) {
        throw new ApiError("Something went wrong, please try again", 500);
      }
      res.locals.data = {
        success: true,
        message: "Email verification successful, Please proceed to login",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }

  public async getProfile(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id, email } = req.user?.payload;
      const me = await this.authUser.getOne({ id, email });
      if (!me) {
        throw new ApiError(
          "Something went wrong!",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
      res.locals.data = {
        success: true,
        data: me,
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }

  public async oauthSendToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // const code = req.query.code;

      // const url = "https://oauth2.googleapis.com/token";

      // const options: any = {
      //   code,
      //   client_id: process.env.CLIENT_ID,
      //   client_secret: process.env.CLIENT_SECRET,
      //   redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
      //   grant_type: "authorization_code",
      // };

      // const queryString = new URLSearchParams(options);

      // const { id_token, access_token } = (
      //   await axios.post(url, queryString.toString(), {
      //     headers: {
      //       "Content-Type": "application/x-www-form-urlencoded",
      //     },
      //   })
      // ).data;

      // const googleUser = (
      //   await axios.get(
      //     `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      //     {
      //       headers: {
      //         Authorization: `Bearer ${id_token}`,
      //       },
      //     }
      //   )
      // ).data;
      // console.log(googleUser, "googleUser")
      // console.log(id_token, access_token, "id_token, access_token")

      // res.cookie("username", googleUser.given_name);
      // res.send(googleUser)

      const code = req.query.code;

      const googleRes = await oauth2Client?.getToken(code.toString());

      oauth2Client?.setCredentials(googleRes.tokens);

      const user: any = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
      );

      const existUser = await this.authUser.getOne({
        email: user?.data?.email,
        deletedAt: null,
      });

      let newUser: User;
      if (!existUser) {
        const hashedPassword = await this.hash.encryptData(code.toString());

        const payload = {
          email: user.data.email,
          name: user.data.name,
          password: hashedPassword,
        };

        newUser = await this.authUser.registerUser(payload);
      }

      const payload = {
        id: existUser?.id ?? newUser?.id,
        role: Role.User,
        email: user.data.email,
        name: user.data.name,
      };
      const accessToken = await this.jwt.generateToken(payload);
      res.locals.data = {
        success: true,
        accessToken,
        user: { ...payload },
        message: "Login successful",
      };
      res.cookie("token", accessToken, {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        expires: new Date(Date.now() + 86400 * 100000), // 1 day
      });
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
