import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import ApiError from "../abstractions/ApiError";
import {
  Doctor,
  DoctorAttributes,
  DoctorCreationAttributes,
} from "../database/models/Doctor";
import { DoctorService } from "../services/DoctorService";
import { EmailService } from "../services/EmailService";
import { Role } from "../types/enums.types";
import { EncryptDecrypt } from "../utils/EncryptDecrypt";
import { JwtToken } from "../utils/JwtToken";
import BaseController from "./BaseController";

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
      const searchTerm = Array.isArray(req.query.search)
        ? (req.query.search[0] as string)
        : (req.query.search as string) || "";

      const doctors: DoctorAttributes[] = await this.doctor.serachDoctor(
        searchTerm
      );

      res.locals.data = doctors;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getDoctorsByHospitalId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const doctors: DoctorAttributes[] =
        await this.doctor.getAllWithAssociation(
          {
            HospitalId: id,
            deletedAt: null,
            isVerified: true,
            isEmailVerified: true,
          },
          ["Department"]
        );
      res.locals.data = doctors;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  // admin
  public async getDoctorsByHospitalIdAdmin(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctors: DoctorAttributes[] =
        await this.doctor.getAllWithAssociation(
          {
            HospitalId: req.user.payload.id,
            deletedAt: null,
          },
          ["Department"]
        );
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
      // const doctor: DoctorAttributes = await this.doctor.getOneWithAssociation(
      //   { id: id, deletedAt: null, isVerified: true, isEmailVerified: true },
      //   ["Department", "Hospital", "Review"],
      //   ["createdAt", "updatedAt", "deletedAt", "AddressId", "password"]
      // );
      const doctor: DoctorAttributes = await this.doctor.findOneWithRating(id);
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
      const hash = new EncryptDecrypt();
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
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }

      const hashedPassword = await hash.encryptData(password);

      const payload: DoctorCreationAttributes = {
        name,
        email,
        password: hashedPassword,
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

  public async doctorLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const hash = new EncryptDecrypt();
    const jwt = new JwtToken();
    try {
      const { email, password } = req.body;
      const doctor = await this.doctor.getOne({
        email,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      if (!doctor) {
        throw new ApiError("Doctor not found!", StatusCodes.NOT_FOUND);
      }

      const isPasswordCorrect = await hash.decryptData(
        password,
        doctor?.password
      );
      if (!isPasswordCorrect) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }

      const payload = {
        id: doctor.id,
        role: Role.Doctor,
        email: doctor.email,
        name: doctor.name,
      };
      const accessToken = await jwt.generateToken(payload);
      res.locals.data = {
        success: true,
        accessToken,
        doctor: { ...payload },
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

  // uthenticated
  public async getDoctorsCount(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const verifiedDoctor = await this.doctor.count({
        HospitalId: req.user.payload.id,
        isVerified: true,
        isEmailVerified: true,
      });

      const pendingDoctor = await this.doctor.count({
        [Op.or]: {
          isVerified: false,
          isEmailVerified: false,
        },
        HospitalId: req.user.payload.id,
      });

      res.locals.data = {
        success: true,
        verifiedDoctor,
        pendingDoctor,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  // approve -> admin
  public async approveDoctor(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctordId = req.body.id;
      const hospitalId = req.user.payload.id;

      const email = new EmailService({ repository: Doctor });

      const verified = await this.doctor.getOne({
        id: doctordId,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      if (verified) {
        throw new ApiError("Docter already verified", StatusCodes.BAD_REQUEST);
      }

      const isEmailverified = await this.doctor.getOne({
        id: doctordId,
        deletedAt: null,
        isEmailVerified: true,
      });
      if (!isEmailverified) {
        throw new ApiError("Verify your email first", StatusCodes.BAD_REQUEST);
      }

      const verify = await this.doctor.update(
        { id: doctordId, HospitalId: hospitalId, deletedAt: null },
        { isVerified: true }
      );
      if (!verify) {
        throw new ApiError(
          "Something went wrong",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      await email.emailSender(
        isEmailverified.email,
        "Doctor verification approved",
        "Your doctor verification approval process has been completed. You can now log in to the system with your registered credentials."
      );

      res.locals.data = {
        success: true,
        message: "Doctor verification successful",
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  // public
  public async getDoctorsCountOfHospital(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const verifiedDoctor = await this.doctor.count({
        HospitalId: req.params.id,
        isVerified: true,
        isEmailVerified: true,
      });

      res.locals.data = {
        success: true,
        verifiedDoctor,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
