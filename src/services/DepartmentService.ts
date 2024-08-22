import { Repository } from "../repository/Repository";

export class DepartmentService<T> extends Repository<T> {
  constructor({ repository }) {
    super(repository);
  }
}
