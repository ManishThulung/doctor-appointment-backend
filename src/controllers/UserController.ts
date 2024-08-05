import { NextFunction, Request, Response } from "express";
import { User, UserAttributes } from "../database/models/User";
import logger from "../lib/logger";
import { UserService } from "../services/UserService";
import BaseController from "./BaseController";

export default class UserController extends BaseController {
  private user: UserService<User>;

  constructor() {
    super();
    this.user = new UserService({
      repository: User,
      logger,
    });
  }

  public async getUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const users: UserAttributes[] = await this.user.getUsers();
      res.locals.data = users;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const user: UserAttributes = await this.user.getUserById(id);
      res.locals.data = user;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  // public async createUser(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     // const { name, email, password } = req.body;
  //     // if (!name && !country) {
  //     //   throw new ApiError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
  //     // }
  //     await this.user.createUser(req.body);
  //     res.locals.data = {
  //       success: true,
  //       message: "Create successfully",
  //     };
  //     super.send(res, StatusCodes.CREATED);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  // /**
  //  *
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  // public async updateEnquiry(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const id = req.params.id;
  //     const { body } = req;
  //     const enquiry: EnquiryAttributes = await this.user.update(id, body);
  //     res.locals.data = {
  //       enquiry,
  //     };
  //     // call base class method
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}
