import {
  Enquiry,
  EnquiryAttributes,
  EnquiryCreationAttributes,
} from "../database/models/Enquiry";
import logger from "../lib/logger";
import ApiError from "../abstractions/ApiError";
import { StatusCodes } from "http-status-codes";
import {
  Hospital,
  HospitalAttributes,
  HospitalCreationAttributes,
} from "../database/models/Hospital";

export class HospitalService {
  async getAll(): Promise<HospitalAttributes[]> {
    try {
      const hospitals = await Hospital.findAll();
      return hospitals;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getById(id: string): Promise<HospitalAttributes> {
    try {
      const hospitals = await Hospital.findOne({
        where: {
          id: id,
        },
      });
      return hospitals;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async create(
    payload: HospitalCreationAttributes
  ): Promise<HospitalAttributes> {
    try {
      const enquiry = await Hospital.create(payload);
      return enquiry;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
