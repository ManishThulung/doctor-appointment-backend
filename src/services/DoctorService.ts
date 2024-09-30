import { col, fn, literal, Op } from "sequelize";
import { Department } from "../database/models/Department";
import { Review } from "../database/models/Review";
import { Repository } from "../repository/Repository";

export class DoctorService<T> extends Repository<T> {
  private doctor: any;
  constructor({ repository }) {
    super(repository);
    this.doctor = repository;
  }

  async findAllWithRating(): Promise<T[]> {
    const doctorsWithRatings = await this.doctor.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "address",
        "gender",
        "dob",
        "avatar",
        "joinedAt",
        "HospitalId",
        [fn("AVG", col("Review.rating")), "averageRating"], // Calculate the average rating
      ],
      include: [
        {
          model: Review,
          attributes: [], // We only need the rating for aggregation, so no need to fetch full review data
          where: {
            deletedAt: null, // Optional: Exclude deleted reviews
          },
          required: false, // This ensures doctors with no reviews are still included
        },
        {
          model: Department,
          attributes: ["id", "name", "description"],
          where: {
            deletedAt: null,
          },
        },
      ],
      where: {
        isVerified: true,
        isEmailVerified: true,
        deletedAt: null,
      },
      group: ["Doctor.id", "Department.id"], // Group by doctor to ensure aggregation
    });

    return doctorsWithRatings;
  }

  async findOneWithRating(id: string): Promise<T> {
    const doctorsWithRatings = await this.doctor.findOne({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "address",
        "gender",
        "dob",
        "avatar",
        "certificate",
        "joinedAt",
        "HospitalId",
        [fn("AVG", col("Review.rating")), "averageRating"],
      ],
      include: [
        {
          model: Review,
          attributes: [],
          where: {
            deletedAt: null,
          },
          required: false,
        },
        {
          model: Department,
          attributes: ["id", "name", "description"],
          where: {
            deletedAt: null,
          },
        },
      ],
      where: {
        id,
        isVerified: true,
        isEmailVerified: true,
        deletedAt: null,
      },
      group: ["Doctor.id", "Department.id"], // Group by doctor to ensure aggregation
    });

    return doctorsWithRatings;
  }

  async serachDoctor(searchTerm: string) {
    const doctors = await this.doctor.findAll({
      where: {
        [Op.and]: [
          { isEmailVerified: true }, // Check if the doctor's email is verified
          { isVerified: true }, // Check if the doctor is verified
          ...(searchTerm
            ? [
                // Only apply the search condition if searchTerm is provided
                {
                  [Op.or]: [
                    { name: { [Op.iLike]: `%${searchTerm}%` } }, // Match doctor name (case-insensitive)
                    literal(`"Department"."name" ILIKE '%${searchTerm}%'`), // Match department name (case-insensitive)
                  ],
                },
              ]
            : []), // If no searchTerm is provided, skip the search condition
        ],
      },
      include: [
        {
          model: Department,
          attributes: ["id", "name"],
          required: false, // Allows doctors without departments to be included
        },
      ],
    });
    return doctors;
  }

  async findDoctorsByIds(ids: string[]): Promise<T[]> {
    const topDoctors = await this.doctor.findAll({
      where: {
        id: {
          [Op.in]: ids, // Ensure we only fetch doctors with these ids
        },
      },
      attributes: [
        "id",
        "name",
        "phone",
        "email",
        "avatar",
        "address",
        [fn("AVG", col("Review.rating")), "average_rating"], // Calculate the average rating
      ],
      include: [
        {
          model: Review, // Assuming this.review refers to the Review model
          attributes: [], // Do not include individual review details, just use for aggregation
        },
        {
          model: Department, // Assuming this.department refers to the Department model
          as: "Department", // Alias for the Department table
          attributes: ["id", "name"], // Fetch department id and name
        },
      ],
      group: ["Doctor.id", "Department.id"], // Group by doctor to get the average rating per doctor
    });
    return topDoctors;
  }
}
