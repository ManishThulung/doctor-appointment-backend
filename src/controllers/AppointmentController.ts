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
import { AppointmentStatus } from "../types/enums.types";

export default class AppointmentController extends BaseController {
  private appointment: AppointmentService<Appointment>;
  private hospital: HospitalService<Hospital>;
  private email: EmailService<Hospital>;

  constructor() {
    super();
    this.appointment = new AppointmentService({
      repository: Appointment,
    });
    this.hospital = new HospitalService({
      repository: Hospital,
      logger,
    });
    this.email = new EmailService({ repository: Hospital });
  }

  public async createAppointment(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
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

      await this.email.emailSender(
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
          DoctorId: req.user.payload.id,
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

  // user
  public async getUserAppointments(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const appointments = await this.appointment.getAllWithAssociation(
        {
          deletedAt: null,
          UserId: req.user.payload.id,
        },
        ["Doctor", "User", "Hospital"]
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

  // user
  public async cancelAppointment(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.body.id;

      const appointment: any = await this.appointment.getOneWithAssociation(
        { id },
        ["Hospital", "Doctor", "User"],
        ["createdAt", "updatedAt", "deletedAt", "HospitalId", "DoctorId", "UserId"]
      );
      if (!appointment) {
        throw new ApiError("Appointment not found", StatusCodes.NOT_FOUND);
      }

      const [startTime] = appointment?.timeSlot.split(" - ");
      const appointmentDateTime = new Date(
        `${appointment?.date} ${startTime}`
      );
      const currentDateTime = new Date();

      const oneHourBeforeAppointment = new Date(
        appointmentDateTime.getTime() - 60 * 60 * 1000
      );
      let isCancellable: boolean;
      // Check if the current time is before one hour before the appointment
      if (currentDateTime < oneHourBeforeAppointment) {
        isCancellable = true;
      } else {
        isCancellable = false;
      }

      if (!isCancellable) {
        throw new ApiError(
          "Cannot cancel the appointment",
          StatusCodes.FORBIDDEN
        );
      }

      const cancel = await this.appointment.update(
        { id },
        { deleteAt: currentDateTime, status: AppointmentStatus.Canceled }
      );

      if (!cancel) {
        throw new ApiError(
          "Cannot cancel the appointment",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      await this.email.emailSender(
        appointment?.User?.email,
        "Appointment cancelled",
        `Your appointment cancellation has been approved`
      );

      await this.email.emailSender(
        appointment?.Doctor?.email,
        "Appointment cancelled",
        `Patient: ${appointment?.User?.email} has cancelled the appointment with you at the given date.
        Pateint Name: ${appointment?.User?.email}
        Appointment Date: ${appointment?.date}
        Time-slot: ${appointment?.timeSlot}
        `,
        [appointment?.Hospital?.email]
      );

      res.locals.data = {
        success: true,
        message: "Your appointment has been canceled",
      };
      super.send(res, StatusCodes.OK);
    } catch (err) {
      next(err);
    }
  }
}
