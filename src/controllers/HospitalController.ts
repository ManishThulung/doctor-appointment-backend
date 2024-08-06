import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import { Address, AddressAttributes } from "../database/models/Address";
import { Hospital, HospitalAttributes } from "../database/models/Hospital";
import logger from "../lib/logger";
import { AddressService } from "../services/AddressService";
import { HospitalService } from "../services/HospitalService";
import BaseController from "./BaseController";

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
    try {
      const {
        name,
        type,
        specialization,
        email,
        password,
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

      const parsedSpecialization =
        typeof specialization === "string"
          ? JSON.parse(specialization)
          : specialization;

      const payload = {
        name,
        email,
        password,
        type,
        specialization: parsedSpecialization,
        logo: req.files?.["logo"][0],
        gallery: req.files?.["gallery"],
        AddressId: address.id,
      };
      const hospital: HospitalAttributes = await this.hospital.createHospital(
        payload
      );
      if (!hospital) {
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
