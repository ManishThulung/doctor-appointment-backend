import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";
import {
  Review,
  ReviewAttributes,
  ReviewCreationAttributes,
} from "../database/models/Review";
import { ReviewService } from "../services/ReviewService";
import BaseController from "./BaseController";

export default class ReviewController extends BaseController {
  private review: ReviewService<Review>;

  constructor() {
    super();
    this.review = new ReviewService({ repository: Review });
  }

  public async getReviews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const reviews: ReviewAttributes[] = await this.review.getAll({
        deletedAt: null,
      });
      res.locals.data = reviews;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getReviewById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id;
      const review: ReviewAttributes = await this.review.getOneWithAssociation(
        { id: id, deletedAt: null },
        ["User", "Doctor"],
        ["createdAt", "updatedAt", "deletedAt", "UserId", "DoctorId"]
      );
      if (!review) {
        throw new ApiError("Review not found!", StatusCodes.NOT_FOUND);
      }
      res.locals.data = review;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async getReviewByDoctorId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doctorId = req.params.id;
      const review: ReviewAttributes = await this.review.getOneWithAssociation(
        { id: doctorId, deletedAt: null },
        ["User", "Doctor"],
        ["createdAt", "updatedAt", "deletedAt", "UserId", "DoctorId"]
      );
      if (!review) {
        throw new ApiError("Review not found!", StatusCodes.NOT_FOUND);
      }
      res.locals.data = review;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  public async createReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const review: ReviewAttributes =
        await this.review.create<ReviewCreationAttributes>(req.body);
      if (!review) {
        throw new ApiError("Something went wrong", 500, false, "ServerError");
      }
      res.locals.data = {
        success: true,
        message: "Create successfully",
      };
      super.send(res, StatusCodes.CREATED);
    } catch (err) {
      next(err);
    }
  }
}
