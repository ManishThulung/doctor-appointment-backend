import { QueryTypes } from "sequelize";
import { Doctor } from "../database/models/Doctor";
import { Repository } from "../repository/Repository";

export class DoctorService<T> extends Repository<T> {
  private doctor: any;
  constructor({ repository }) {
    super(repository);
    this.doctor = repository;
  }

  // milena
  async serachDoctor(searchTerm: string): Promise<T> {
    try {
      const doctors = await this.doctor.query(
        `SELECT id, name, email, password, phone, address, gender, dob, avatar, "isVerified", "isEmailVerified", "joinedAt", "deletedAt", certificate, "createdAt", "updatedAt",            "DepartmentId", "HospitalId"
         FROM public."Doctor"
         WHERE name ILIKE :searchTerm`,
        {
          replacements: { searchTerm: `%${searchTerm}%` },
          type: QueryTypes.SELECT,
        }
      );
      return doctors;
    } catch (error) {
      throw error;
    }
  }
}
