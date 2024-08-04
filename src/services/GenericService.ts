import { error, Logger } from "winston";
import ApiError from "../abstractions/ApiError";
import { Repository } from "../repository/Repository";

export class GenericService<T> extends Repository<T> {
  private repository: any;
  private logger: Logger;
  constructor({ repository, logger }: { repository: any; logger: Logger }) {
    super(repository);
    this.repository = repository;
    this.logger = logger;
  }

  // public async getAll(): Promise<T[] | null> {
  //   try {
  //     const data = await this.repository.findAll();
  //     return data;
  //   } catch (error) {
  //     this.logger.error(error);
  //     throw error;
  //   }
  // }
  public async getByIdd(id: string): Promise<T> {
    try {
      const data = await this.getById(id);
      if (!data) {
        throw new ApiError("data not found", 404);
      }
      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
