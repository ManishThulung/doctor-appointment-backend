import { col, fn, literal, Op } from "sequelize";
import { Department } from "../database/models/Department";
import { Doctor } from "../database/models/Doctor";
import { Repository } from "../repository/Repository";

export class ReviewService<T> extends Repository<T> {
  private review: any;
  constructor({ repository }) {
    super(repository);
    this.review = repository;
  }

  async findAverage(): Promise<T> {
    try {
      const averageRating = await this.review.findAll({
        attributes: [
          "DoctorId",
          [fn("AVG", col("rating")), "averageRating"], // Calculate the average rating
        ],
        where: {
          deletedAt: null,
        },
        group: ["DoctorId"],
        having: literal("AVG(rating) > 3"),
      });
      return averageRating;
    } catch (error) {
      throw error;
    }
  }

  async findTopDoctors(similarityMatrix: any): Promise<any> {
    console.log(similarityMatrix, "similarityMatrix");
    const topDoctors = await this.review.findAll({
      attributes: [
        "DoctorId",
        [fn("AVG", col("rating")), "average_rating"],
        [fn("AVG", col("polarity")), "average_polarity"],
      ],
      where: {
        deletedAt: {
          [Op.is]: null, // Exclude soft-deleted reviews
        },
      },
      group: [
        "DoctorId",
        "Doctor.id",
        "Doctor.name",
        "Doctor->Department.id",
        "Doctor->Department.name",
      ],
      having: {
        [Op.and]: [
          literal("AVG(rating) > 3"), // Ensure average rating is greater than 3
          literal("AVG(polarity) >= 0"), // Ensure average polarity is non-negative
        ],
      },
      order: [
        [fn("AVG", col("rating")), "DESC"], // Order by average rating
        [fn("AVG", col("polarity")), "DESC"], // Then order by average polarity
      ],
      limit: 20, // Adjust limit as needed
      include: [
        {
          model: Doctor,
          attributes: ["name", "id", "address", "phone", "email", "avatar"], // Include the doctor's name or other relevant fields
          include: [
            {
              model: Department,
              attributes: ["id", "name"], // Include Department.id and Department.name
            },
          ],
        },
      ],
    });

    function getfilteredData(arr, count) {
      // Create a copy of the array to shuffle
      let shuffled = [...arr];

      // Fisher-Yates Shuffle Algorithm
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index between 0 and i
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
      }

      // Return the first 'count' elements of the shuffled array
      return shuffled.slice(0, count);
    }

    const elements = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Get 5 random elements
    const randomElements = getfilteredData(topDoctors, 5);
    return randomElements;
  }
}
