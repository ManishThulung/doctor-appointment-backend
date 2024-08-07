import ApiError from "../abstractions/ApiError";
import { HospitalCreationAttributes } from "../database/models/Hospital";
import { Logger } from "../lib/logger";
import { Repository } from "../repository/Repository";

export class HospitalService<T> extends Repository<T> {
  private hospitalService: T;
  private logger: Logger;
  constructor({ repository, logger }) {
    super(repository);
    this.hospitalService = repository;
    this.logger = logger;
  }
  async getHospitals(): Promise<T[]> {
    try {
      const hospitals = await this.getAll({ deletedAt: null });
      return hospitals;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async getHospitalById(id: string): Promise<T> {
    try {
      const hospital = await this.getOne({
        id: id,
        deletedAt: null,
      });
      if (!hospital) {
        throw new ApiError("data not found", 404);
      }
      return hospital;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async createHospital(payload: HospitalCreationAttributes): Promise<T> {
    try {
      const hospital = await this.create<HospitalCreationAttributes>(payload);
      return hospital;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
