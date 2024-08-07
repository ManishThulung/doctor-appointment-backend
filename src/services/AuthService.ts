import ApiError from "../abstractions/ApiError";
import { UserCreationAttributes } from "../database/models/User";
import logger from "../lib/logger";
import { Repository } from "../repository/Repository";

export class AuthService<T> extends Repository<T> {
  private authService: T;
  constructor({ repository, logger }) {
    super(repository);
    this.authService = repository;
  }

  async registerUser(payload: UserCreationAttributes): Promise<T> {
    try {
      const user = await this.create<UserCreationAttributes>(payload);
      return user;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
