import { NextFunction, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import {
  Appointment,
  AppointmentCreationAttributes,
} from "../database/models/Appointment";
import { Doctor } from "../database/models/Doctor";
import { Hospital } from "../database/models/Hospital";
import logger from "../lib/logger";
import { AppointmentService } from "../services/AppointmentService";
import { DoctorService } from "../services/DoctorService";
import { EmailService } from "../services/EmailService";
import { HospitalService } from "../services/HospitalService";
import BaseController from "./BaseController";

export default class AppointmentController extends BaseController {
  private appointment: AppointmentService<Appointment>;
  private hospital: HospitalService<Hospital>;

  constructor() {
    super();
    this.appointment = new AppointmentService({
      repository: Appointment,
    });
    this.hospital = new HospitalService({
      repository: Hospital,
      logger,
    });
  }

  public async createAppointment(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const emailService = new EmailService({ repository: Hospital });
      const doctor: DoctorService<Doctor> = new DoctorService({
        repository: Doctor,
      });

      const { date, timeSlot, doctorId, hospitalId } = req.body;
      const { id, email } = req.user.payload;

      const isExistDoctor = await doctor.getOne({
        id: doctorId,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      if (!isExistDoctor) {
        throw new ApiError("Doctor not found", StatusCodes.NOT_FOUND);
      }

      const isExistHospital = await this.hospital.getOne({
        id: hospitalId,
        deletedAt: null,
        isVerified: true,
        isEmailVerified: true,
      });
      if (!isExistDoctor) {
        throw new ApiError("Doctor not found", StatusCodes.NOT_FOUND);
      }

      const isTimeSlotBooked: any = await this.appointment.getOne({
        date,
        timeSlot,
      });

      console.log(isTimeSlotBooked, "isTimeSlotBooked");

      if (isTimeSlotBooked?.DoctorId === doctorId) {
        throw new ApiError(
          "This time slot is not available",
          StatusCodes.CONFLICT
        );
      }

      const payload: AppointmentCreationAttributes = {
        date,
        timeSlot,
        DoctorId: doctorId,
        UserId: id,
        HospitalId: hospitalId,
      };

      const newAppointment: any =
        await this.appointment.create<AppointmentCreationAttributes>(payload);
      if (!newAppointment) {
        throw new ApiError("Something went wrong", 500, false, "ServerError");
      }

      await emailService.emailSender(
        isExistDoctor.email,
        "New Appointment booking request",
        `Click here to accept the new appointment ${process.env.BASE_URI}/doctor/appointment/verify?doctorId=${doctorId}&patientId=${id}&patientEmail=${email}`,
        [isExistHospital.email]
      );

      res.locals.data = {
        success: true,
        message: "Your appointment has been booked",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }

  // admin
  public async getAppointments(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointments = await this.appointment.getAllWithAssociation(
        {
          deletedAt: null,
        },
        ["Doctor", "User"]
      );
      if (!appointments) {
        throw new ApiError("Appointments not found", StatusCodes.NOT_FOUND);
      }

      res.locals.data = {
        success: true,
        appointments,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }

  // doctor
  public async getAppointmentsOfDoctor(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointments = await this.appointment.getAllWithAssociation(
        {
          deletedAt: null,
          DoctorId: req.user.payload.id
        },
        ["Doctor", "User"]
      );
      if (!appointments) {
        throw new ApiError("Appointments not found", StatusCodes.NOT_FOUND);
      }

      res.locals.data = {
        success: true,
        appointments,
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
