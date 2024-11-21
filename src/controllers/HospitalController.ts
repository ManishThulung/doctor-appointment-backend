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
import { Op } from "sequelize";
import { EncryptDecrypt } from "../utils/EncryptDecrypt";
import { JwtToken } from "../utils/JwtToken";
import { Role } from "../types/enums.types";

export default class HospitalController extends BaseController {
  private hospital: HospitalService<Hospital>;
  private address: AddressService<Address>;
  private hash: EncryptDecrypt;
  private jwt: JwtToken;

  constructor() {
    super();
    this.hospital = new HospitalService({
      repository: Hospital,
      logger,
    });
    this.address = new AddressService({
      repository: Address,
    });
    this.hash = new EncryptDecrypt();
    this.jwt = new JwtToken();
  }

  public async hospitalAdminLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      const hospital = await this.hospital.getOne({
        email,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      console.log(hospital);
      if (!hospital) {
        throw new ApiError("Hospital not found!", StatusCodes.NOT_FOUND);
      }

      const isPasswordCorrect = await this.hash.decryptData(
        password,
        hospital?.password
      );
      if (!isPasswordCorrect) {
        throw new ApiError("Invalid credentials!", StatusCodes.NOT_FOUND);
      }

      const payload = {
        id: hospital.id,
        role: Role.Admin,
        email: hospital.email,
        name: hospital.name,
      };
      const accessToken = await this.jwt.generateToken(payload);
      res.locals.data = {
        success: true,
        accessToken,
        hospital: { ...payload },
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

  // get all the list of hospitals -> SuperAdmin
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
          ["Address", "Doctor"],
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

      const hashedPassword = await this.hash.encryptData(password);

      const fileUrls = req.files?.["gallery"]?.map((file) => {
        return { ...file };
      });

      console.log(fileUrls, "fileUrls");

      const payload = {
        name,
        email,
        password: hashedPassword,
        type,
        pan,
        phone,
        logo: req.files?.["logo"][0],
        gallery: fileUrls,
        certificate: req.files?.["certificate"],
        AddressId: address.id,
      };
      console.log(payload, "payload");
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
      super.send(res, StatusCodes.OK);
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

      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  // super admin only
  public async getTotalNumberOfHospital(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const verifiedHospital = await this.hospital.count({
        isVerified: true,
        isEmailVerified: true,
      });
      const pendingHospital = await this.hospital.count({
        [Op.or]: {
          isVerified: false,
          isEmailVerified: false,
        },
      });

      res.locals.data = {
        success: true,
        verifiedHospital,
        pendingHospital,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  // approve -> super admin
  public async approveHospital(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const hospitalId = req.body.id;
      // const hospitalId = req.user.payload.id;

      const email = new EmailService({ repository: Hospital });

      const verified = await this.hospital.getOne({
        id: hospitalId,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      if (verified) {
        throw new ApiError(
          "Hospital already verified",
          StatusCodes.BAD_REQUEST
        );
      }

      const isEmailverified = await this.hospital.getOne({
        id: hospitalId,
        deletedAt: null,
        isEmailVerified: true,
      });
      if (!isEmailverified) {
        throw new ApiError("Verify your email first", StatusCodes.BAD_REQUEST);
      }

      const verify = await this.hospital.update(
        { id: hospitalId, deletedAt: null },
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
        "Hospital verification approved",
        "Your hospital verification approval process has been completed. You can now log in to the system with your registered credentials."
      );

      res.locals.data = {
        success: true,
        message: "Hospital verification successful",
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
