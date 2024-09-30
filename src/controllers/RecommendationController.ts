import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import natural from "natural";
import ApiError from "../abstractions/ApiError";
import { Review, ReviewAttributes } from "../database/models/Review";
import { ReviewService } from "../services/ReviewService";
import { wordDict } from "../utils/LexicalConstant";
import BaseController from "./BaseController";
import similarity from "compute-cosine-similarity";
import { Doctor } from "../database/models/Doctor";

export default class RecommendationController extends BaseController {
  private review: ReviewService<Review>;

  constructor() {
    super();
    this.review = new ReviewService({
      repository: Review,
    });
  }

  public async getRecommendations(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      //////////////////////////////////////////
      ////similarity////////////////
      ///////////////////////
      const vector = this.review.getAllWithAssociation(
        { UserId: req.user.payload.id, deletedAt: null },
        ["Doctor"]
      );

      const similarityMatrix = this.cosineSimilarityMatrix(vector);

      const topDoctors = await this.review.findTopDoctors(similarityMatrix);

      res.locals.data = {
        success: true,
        topDoctors,
      };
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  private cosineSimilarityMatrix(vectors?: any) {
    const similarityMatrix = [];

    for (let i = 0; i < vectors.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < vectors.length; j++) {
        similarityMatrix[i][j] = this.cosineSimilarity(vectors[i], vectors[j]);
      }
    }

    return similarityMatrix;
  }

  private cosineSimilarity(vecA, vecB) {
    const dotProd = this.dotProduct(vecA, vecB);
    const magA = this.magnitude(vecA);
    const magB = this.magnitude(vecB);

    if (magA === 0 || magB === 0) {
      return 0; // to avoid division by zero if any vector is all zeros
    }

    return dotProd / (magA * magB);
  }

  private dotProduct(vecA, vecB) {
    return vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  }

  // Function to calculate the magnitude (Euclidean norm) of a vector
  private magnitude(vec) {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  }
}
