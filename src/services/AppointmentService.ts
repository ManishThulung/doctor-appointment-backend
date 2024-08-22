import { Repository } from "../repository/Repository";

export class AppointmentService<T> extends Repository<T> {
  constructor({ repository }) {
    super(repository);
  }
}
