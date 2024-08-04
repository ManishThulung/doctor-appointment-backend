import { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import {
  Hospital,
  HospitalAttributes
} from "../database/models/Hospital";
import logger from "../lib/logger";
import { GenericService } from "../services/GenericService";
import { HospitalService } from "../services/HospitalService";
import { RouteDefinition } from "../types/RouteDefinition";
import BaseController from "./BaseController";

export default class HospitalController extends BaseController {
  private hospital: HospitalService;
  private service: any;
  public basePath: string = "hospitals";

  constructor() {
    super();
    this.hospital = new HospitalService();
    this.service = new GenericService<HospitalAttributes>({
      repository: Hospital,
      logger,
    });
  }

  /**
   * The routes method returns an array of route definitions for CRUD operations
   * (GET, POST, PUT, DELETE) on enquiries,
   * with corresponding handlers bound to the controller instance.
   */
  public routes(): RouteDefinition[] {
    return [
      // { path: "/", method: "get", handler: this.getEnquiries.bind(this) },
      {
        path: "/:id",
        method: "get",
        handler: this.getEnquiry.bind(this),
      },
      {
        path: "/",
        method: "post",
        handler: this.createEnquiry.bind(this),
      },
      // {
      //   path: "/:id",
      //   method: "put",
      //   handler: this.updateEnquiry.bind(this),
      // },
      // { path: "*", method: "get", handler: this.invalid.bind(this) },
      // { path: "*", method: "post", handler: this.invalid.bind(this) },
    ];
  }

  public async getEnquiries(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const enquiries: HospitalAttributes[] = await this.service.getAll();
      res.locals.data = enquiries;
      // call base class method
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  // /**
  //  *
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  public async getEnquiry(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const enquiry: HospitalAttributes = await this.service.getByIdd(id);
      console.log(enquiry, "enquiry");
      // const enquiry: HospitalAttributes = await this.hospital.getById(id);
      res.locals.data = enquiry;
      // call base class method
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

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
  //     const enquiry: EnquiryAttributes = await this.hospital.update(id, body);
  //     res.locals.data = {
  //       enquiry,
  //     };
  //     // call base class method
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  /**
   *
   * @param req
   * @param res
   * @param next
   */
  public async createEnquiry(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, country, address } = req.body;
      if (!name && !country) {
        throw new ApiError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
      }
      const enquiry: HospitalAttributes = await this.hospital.create({
        name,
        country,
        address,
      });
      res.locals.data = {
        enquiry,
      };
      // call base class method
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }

  // /**
  //  *
  //  * @param req
  //  * @param res
  //  * @param next
  //  */
  public async invalid(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      throw new ApiError("routes not found", 404);
    } catch (err) {
      next(err);
    }
  }
}
