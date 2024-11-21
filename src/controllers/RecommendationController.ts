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
import { DoctorService } from "../services/DoctorService";

export default class RecommendationController extends BaseController {
  private review: ReviewService<Review>;
  private doctor: DoctorService<Doctor>;

  constructor() {
    super();
    this.review = new ReviewService({
      repository: Review,
    });
    this.doctor = new DoctorService({
      repository: Doctor,
    });
  }

  public async getRecommendations(
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const topDoctorsIds = await this.review.findTopDoctorsBySimilarUsers(
        req.user.payload.id
      );

      if (!topDoctorsIds) {
        const topGeneralDoctors = await this.review.findTopDoctorsByQuery();
        res.locals.data = {
          success: true,
          algorithm: false,
          topDoctors: topGeneralDoctors,
        };
        this.send(res);
        return;
      }

      const topDoctors = await this.doctor.findDoctorsByIds(topDoctorsIds);

      res.locals.data = {
        success: true,
        topDoctors,
        algorithm: true,
      };
      this.send(res);
    } catch (err) {
      next(err);
    }
  }
}
