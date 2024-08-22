import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { Address, AddressAttributes } from "../database/models/Address";
import { Hospital, HospitalAttributes } from "../database/models/Hospital";
import logger from "../lib/logger";
import { AddressService } from "../services/AddressService";
import { HospitalService } from "../services/HospitalService";
import BaseController from "./BaseController";
import { EmailService } from "../services/EmailService";

export default class HospitalController extends BaseController {
  private hospital: HospitalService<Hospital>;
  private address: AddressService<Address>;

  constructor() {
    super();
    this.hospital = new HospitalService({
      repository: Hospital,
      logger,
    });
    this.address = new AddressService({
      repository: Address,
    });
  }

  public async getHospitals(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const hospitals: HospitalAttributes[] =
        await this.hospital.getAllWithAssociation(
          { deletedAt: null, isEmailVerified: true, isVerified: true },
          ["Address"]
        );
      res.locals.data = hospitals;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getHospitalsAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const hospitals: HospitalAttributes[] =
        await this.hospital.getAllWithAssociation({ deletedAt: null }, [
          "Address",
        ]);
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
      const hospital: HospitalAttributes =
        await this.hospital.getOneWithAssociation(
          { id: id, deletedAt: null },
          ["Address"],
          ["createdAt", "updatedAt", "deletedAt", "AddressId", "password"]
        );
      if (!hospital) {
        throw new ApiError("Hospital not found!", StatusCodes.NOT_FOUND);
      }
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
    const emailService = new EmailService({ repository: Hospital });
    try {
      const {
        name,
        type,
        email,
        password,
        pan,
        phone,
        country,
        province,
        district,
        municipality,
        wardName,
        wardNo,
        departments,
      } = req.body;

      if (!req.files || req.files.length === 0) {
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }

      const addressPayload = {
        country,
        province,
        district,
        municipality,
        wardName,
        wardNo,
      };

      const address: AddressAttributes = await this.address.createAddress(
        addressPayload
      );
      if (!address) {
        throw new ApiError("Unable to create address", 500);
      }

      const payload = {
        name,
        email,
        password,
        type,
        pan,
        phone,
        logo: req.files?.["logo"][0],
        gallery: req.files?.["gallery"],
        certificate: req.files?.["certificate"],
        AddressId: address.id,
      };
      const hospital: HospitalAttributes = await this.hospital.createHospital(
        payload
      );
      if (!hospital) {
        throw new ApiError("Something went wrong", 500, false, "ServerError");
      }
      await emailService.emailSender(
        email,
        "Verify your email",
        `click here to verify your email http://localhost:8000/api/hospital/email/verify?id=${hospital?.id}&email=${hospital.email}`
      );
      res.locals.data = {
        success: true,
        message: "Email has been sent to your email, verify it first",
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
      const emailService = new EmailService({ repository: Hospital });
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

  public async verifyHospital(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const emailService = new EmailService({ repository: Hospital });
      const { id, email } = req.query;
      const isEmailExist = this.hospital.getOne({ email, id });
      if (!isEmailExist) {
        throw new ApiError("Email does not exist", 404);
      }
      const verifyEmail = await this.hospital.update(
        { email, id },
        { isVerified: true }
      );
      if (!verifyEmail) {
        throw new ApiError("Something went worng", 500);
      }
      if (typeof id === "string" && typeof email === "string") {
        await emailService.emailSender(
          email,
          "Congratulations!",
          `Your hospital has been registered successfully. You can login with your email and registered password.`
        );
      }
      res.locals.data = {
        success: true,
        message: "Hospital verified and an email has been sent",
      };

      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
}
