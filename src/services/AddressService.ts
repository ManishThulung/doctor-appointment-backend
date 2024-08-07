import { AddressCreationAttributes } from "../database/models/Address";
import logger from "../lib/logger";
import { Repository } from "../repository/Repository";

export class AddressService<T> extends Repository<T> {
  constructor({ repository }) {
    super(repository);
  }

  async createAddress(payload: AddressCreationAttributes): Promise<T> {
    try {
      const address = await this.create<AddressCreationAttributes>(payload);
      return address;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
