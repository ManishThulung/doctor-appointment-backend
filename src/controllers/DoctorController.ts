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

export default class DoctorController extends BaseController {
  private doctor: DoctorService<Doctor>;
  private address: AddressService<Address>;

  constructor() {
    super();
    this.doctor = new DoctorService({ repository: Doctor });
    this.address = new AddressService({
      repository: Address,
    });
  }

  public async getDoctors(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctors: DoctorAttributes[] =
        await this.doctor.getAllWithAssociation({ deletedAt: null }, [
          "Address",
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
        ["Address"],
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
      const {
        name,
        email,
        password,
        specialization,
        dob,
        country,
        province,
        district,
        municipality,
        wardName,
        wardNo,
        toleNo,
      } = req.body;

      if (!req.files || req.files.length === 0) {
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }

      const parsedSpecialization =
        typeof specialization === "string"
          ? JSON.parse(specialization)
          : specialization;

      const addressPayload = {
        country,
        province,
        district,
        municipality,
        wardName,
        wardNo,
        toleNo,
      };

      const address: AddressAttributes = await this.address.createAddress(
        addressPayload
      );
      if (!address) {
        throw new ApiError("Unable to create address", 500);
      }

      const payload: DoctorCreationAttributes = {
        name,
        email,
        password,
        specialization: parsedSpecialization,
        dob,
        avatar: req.files?.["avatar"][0],
        certificates: req.files?.["certificates"],
        AddressId: address.id,
      };
      const doctor: DoctorAttributes =
        await this.doctor.create<DoctorCreationAttributes>(payload);
      if (!doctor) {
        throw new ApiError("Something went wrong", 500, false, "ServerError");
      }
      res.locals.data = {
        success: true,
        message: "Create successfully",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
}
