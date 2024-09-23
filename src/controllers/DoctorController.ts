import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import {
  Appointment,
  AppointmentCreationAttributes,
} from "../database/models/Appointment";
import {
  Doctor,
  DoctorAttributes,
  DoctorCreationAttributes,
} from "../database/models/Doctor";
import { AppointmentService } from "../services/AppointmentService";
import { DoctorService } from "../services/DoctorService";
import { EmailService } from "../services/EmailService";
import { EncryptDecrypt } from "../utils/EncryptDecrypt";
import BaseController from "./BaseController";
import { Op } from "sequelize";

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
        await this.doctor.getAllWithAssociation(
          { deletedAt: null, isVerified: true, isEmailVerified: true },
          ["Department"]
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
      const doctors: DoctorAttributes[] = await this.doctor.getAll({
        HospitalId: req.user.payload.id,
        deletedAt: null,
      });
      // const doctors: DoctorAttributes[] =
      //   await this.doctor.getAllWithAssociation(
      //     {
      //       HospitalId: req.user.payload.id,
      //       deletedAt: null,
      //     },
      //     ["Department"]
      //   );
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
        { id: id, deletedAt: null, isVerified: true, isEmailVerified: true },
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
        console.log(req.files, "req.files");
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

  // public async createReview(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const emailService = new EmailService({ repository: Doctor });
  //     const appointment = new AppointmentService({ repository: Appointment });
  //     const { id } = req.query;

  //     const { date, timeSlot, doctorId, patientId, hospitalId, patientEmail } =
  //       req.body;

  //     const isExistDoctor = await this.doctor.getOne({ id });
  //     if (!isExistDoctor) {
  //       throw new ApiError("Doctor not found", StatusCodes.NOT_FOUND);
  //     }

  //     const isTimeSlotBooked = await appointment.getOne({
  //       date,
  //       timeSlot,
  //       DoctorId: doctorId,
  //     });

  //     if (isTimeSlotBooked) {
  //       throw new ApiError(
  //         "This time slot is not available",
  //         StatusCodes.CONFLICT
  //       );
  //     }

  //     const payload: AppointmentCreationAttributes = {
  //       date,
  //       timeSlot,
  //       DoctorId: doctorId,
  //       PatientId: patientId,
  //       HospitalId: hospitalId,
  //     };

  //     const newAppointment: any =
  //       await appointment.create<AppointmentCreationAttributes>(payload);
  //     if (!newAppointment) {
  //       throw new ApiError("Something went wrong", 500, false, "ServerError");
  //     }

  //     await emailService.emailSender(
  //       isExistDoctor.email,
  //       "New Appointment booking request",
  //       `Click here to accept the new booking http://localhost:8000/api/doctor/email/verify?id=${patientId}&email=${patientEmail}`
  //     );

  //     res.locals.data = {
  //       success: true,
  //       message:
  //         "Your appointment has been created, please check your email for the confirmations",
  //     };
  //     super.send(res, StatusCodes.CREATED);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  

  // get all the counts of docter of a hospital -> admin
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
}
