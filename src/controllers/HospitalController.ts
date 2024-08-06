import { NextFunction, Request, Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { Hospital, HospitalAttributes } from "../database/models/Hospital";
import logger from "../lib/logger";
import { HospitalService } from "../services/HospitalService";
import BaseController from "./BaseController";

export default class HospitalController extends BaseController {
  private hospital: HospitalService<Hospital>;

  constructor() {
    super();
    this.hospital = new HospitalService({
      repository: Hospital,
      logger,
    });
  }

  public async getHospitals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const hospitals: HospitalAttributes[] =
        await this.hospital.getHospitals();
      res.locals.data = hospitals;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getHospitalById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const hospital: HospitalAttributes = await this.hospital.getHospitalById(
        id
      );
      res.locals.data = hospital;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async createHospital(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // const { name, country, address } = req.body;
      // if (!name && !country) {
      //   throw new ApiError(ReasonPhrases.BAD_REQUEST, StatusCodes.BAD_REQUEST);
      // }
      // const hospital: HospitalAttributes = await this.hospital.createHospital({
      //   name,
      // });
      if (!req.files || req.files.length === 0) {
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }
      console.log(req.body, "body");
      console.log(req.files, "files");
      res.locals.data = {
        success: true,
        message: "Create successfully",
      };
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
}
