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

  async findTopDoctorsByQuery(): Promise<T[]> {
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
      limit: 5, // Adjust limit as needed
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
    return topDoctors;
  }

  private async findMostSimilarUser(targetUserId: string) {
    // Fetch data for the target user (the user we are comparing with)
    const targetUserReviews = await this.review.findAll({
      where: {
        UserId: targetUserId,
      },
      attributes: ["DoctorId", "rating", "polarity"],
      raw: true,
    });

    if (targetUserReviews.length === 0) {
      return;
    }

    // Fetch data for all other users excluding the target user
    const otherUserReviews = await this.review.findAll({
      where: {
        UserId: {
          [Op.ne]: targetUserId, // Exclude the target user
        },
      },
      attributes: ["UserId", "DoctorId", "rating", "polarity"],
      raw: true,
    });

    const userReviewsMap = {};
    otherUserReviews.forEach((review) => {
      if (!userReviewsMap[review.UserId]) {
        userReviewsMap[review.UserId] = [];
      }
      userReviewsMap[review.UserId].push([review.rating, review.polarity]);
    });

    // Extract the rating vector for the target user
    const targetUserVectors = targetUserReviews.map((review) => review.rating); // Can also include polarity if needed

    const similarityScores = [];

    // Compare the target user with each other user
    for (const userId in userReviewsMap) {
      const otherUserVectors = userReviewsMap[userId].map(
        (review) => review[0]
      ); // Rating vector

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(
        targetUserVectors,
        otherUserVectors
      );

      // Store userId and similarity score
      similarityScores.push({ userId, similarity });
    }

    // Sort the similarity scores in descending order and get the top N users
    const topSimilarUsers = similarityScores
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
    return topSimilarUsers;
  }

  async findTopDoctorsBySimilarUsers(targetUserId, topNDoctors = 5) {
    // Get the top 3 similar users based on cosine similarity
    const topSimilarUsers = await this.findMostSimilarUser(targetUserId);

    if (!topSimilarUsers) {
      return;
    }
    // Extract the UserIds of the top similar users
    const similarUserIds = topSimilarUsers.map((user) => user.userId);

    // Fetch reviews for doctors rated by any of the top similar users
    const reviews = await this.review.findAll({
      where: {
        UserId: similarUserIds, // Only fetch reviews from the top similar users
      },
      attributes: ["DoctorId", "rating", "polarity"],
      raw: true,
    });

    // Create a map to store the total ratings, polarity and count for each doctor
    const doctorRatingsMap = {};

    reviews.forEach((review) => {
      const { DoctorId, rating, polarity } = review;

      if (!doctorRatingsMap[DoctorId]) {
        doctorRatingsMap[DoctorId] = {
          totalRating: 0,
          totalPolarity: 0,
          reviewCount: 0,
        };
      }

      doctorRatingsMap[DoctorId].totalRating += rating;
      doctorRatingsMap[DoctorId].totalPolarity += polarity;
      doctorRatingsMap[DoctorId].reviewCount += 1;
    });

    // Calculate average rating and polarity for each doctor
    const doctorRatings = Object.keys(doctorRatingsMap).map((DoctorId) => {
      const { totalRating, totalPolarity, reviewCount } =
        doctorRatingsMap[DoctorId];
      return {
        DoctorId,
        avgRating: totalRating / reviewCount,
        avgPolarity: totalPolarity / reviewCount,
      };
    });

    // Sort doctors by highest rating and highest positive polarity
    const topDoctorIds = doctorRatings
      .sort((a, b) => {
        // Sort primarily by rating, then by polarity if ratings are the same
        if (b.avgRating === a.avgRating) {
          return b.avgPolarity - a.avgPolarity;
        }
        return b.avgRating - a.avgRating;
      })
      .slice(0, topNDoctors) // Get the top N doctors
      .map((doc) => doc.DoctorId); // Extract only DoctorIds

    return topDoctorIds;
  }

  // Helper function for cosine similarity
  private cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    const minLength = Math.min(vectorA.length, vectorB.length); // Use minimum length for safety

    for (let i = 0; i < minLength; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      magnitudeA += vectorA[i] * vectorA[i];
      magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0; // Avoid division by zero

    return dotProduct / (magnitudeA * magnitudeB);
  }
}
