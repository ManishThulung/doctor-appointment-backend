import ApiError from "../abstractions/ApiError";
import { UserCreationAttributes } from "../database/models/User";
import logger from "../lib/logger";
import { Repository } from "../repository/Repository";

export class UserService<T> extends Repository<T> {
  private userService: T;
  constructor({ repository, logger }) {
    super(repository);
    this.userService = repository;
  }
  async getUsers(): Promise<T[]> {
    try {
      const users = await this.getAll({ deletedAt: null });
      return users;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<T> {
    try {
      const user = await this.getOne({
        id: id,
        deletedAt: null,
      });
      if (!user) {
        throw new ApiError("data not found", 404);
      }
      return user;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  async createUser(payload: UserCreationAttributes): Promise<T> {
    try {
      const user = await this.create<UserCreationAttributes>(payload);
      return user;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
