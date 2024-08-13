import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { Address, AddressAttributes } from "../database/models/Address";
import {
  Doctor,
  DoctorAttributes,
  DoctorCreationAttributes,
} from "../database/models/Doctor";
import { AddressService } from "../services/AddressService";
import { DoctorService } from "../services/DoctorService";
import BaseController from "./BaseController";
import { EmailService } from "../services/EmailService";

export default class DoctorController extends BaseController {
  private doctor: DoctorService<Doctor>;

  constructor() {
    super();
    this.doctor = new DoctorService({ repository: Doctor });
  }

  public async getDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctors: DoctorAttributes[] =
        await this.doctor.getAllWithAssociation({ deletedAt: null }, [
          "Department",
        ]);
      res.locals.data = doctors;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getDoctorById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const doctor: DoctorAttributes = await this.doctor.getOneWithAssociation(
        { id: id, deletedAt: null },
        ["Department", "Hospital"],
        ["createdAt", "updatedAt", "deletedAt", "AddressId", "password"]
      );
      if (!doctor) {
        throw new ApiError("Doctor not found!", StatusCodes.NOT_FOUND);
      }
      res.locals.data = doctor;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async createDoctor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const emailService = new EmailService({ repository: Doctor });
      const {
        name,
        email,
        password,
        phone,
        gender,
        address,
        dob,
        department,
        hospitalId,
      } = req.body;

      const isExistDoctor = await this.doctor.getOne({ email: email });
      if (isExistDoctor) {
        throw new ApiError(
          "Doctor already exixt, login instead",
          StatusCodes.CONFLICT
        );
      }

      if (!req.files || req.files.length === 0) {
        console.log(req.files, "req.files");
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }

      const payload: DoctorCreationAttributes = {
        name,
        email,
        password,
        dob,
        phone,
        address,
        gender,
        avatar: req.files?.["avatar"][0],
        certificate: req.files?.["certificate"][0],
        DepartmentId: department,
        HospitalId: hospitalId,
      };
      const doctor: DoctorAttributes =
        await this.doctor.create<DoctorCreationAttributes>(payload);
      if (!doctor) {
        throw new ApiError("Something went wrong", 500, false, "ServerError");
      }
      await emailService.emailSender(
        email,
        "Verify your email",
        `click here to verify your email http://localhost:8000/api/doctor/email/verify?id=${doctor?.id}&email=${doctor.email}`
      );
      res.locals.data = {
        success: true,
        message: "Email has been sent to you, verify it first",
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
      const emailService = new EmailService({ repository: Doctor });
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
}
