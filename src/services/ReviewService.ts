import { Repository } from "../repository/Repository";

export class ReviewService<T> extends Repository<T> {
  constructor({ repository }) {
    super(repository);
  }

  // async createDoctor(payload: DoctorCreationAttributes): Promise<T> {
  //   try {
  //     const Doctor = await this.create<DoctorCreationAttributes>(payload);
  //     return Doctor;
  //   } catch (error) {
  //     logger.error(error);
  //     throw error;
  //   }
  // }
}
