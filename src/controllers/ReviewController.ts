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
import { Appointment } from "../database/models/Appointment";
import { AppointmentService } from "../services/AppointmentService";

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
      const id = req.params.id;
      const review: ReviewAttributes[] =
        await this.review.getAllWithAssociation(
          { DoctorId: id, deletedAt: null },
          ["User"]
          // ["createdAt", "updatedAt", "deletedAt", "UserId", "DoctorId"]
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
    req: any,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.user.payload;
      const { rating, review, doctorId } = req.body;
      const appointment = new AppointmentService({ repository: Appointment });
      const isAllowed = await appointment.getOne({
        UserId: id,
        DoctorId: doctorId,
      });
      if (!isAllowed) {
        throw new ApiError(
          "You are not allowd to proved review",
          StatusCodes.UNAUTHORIZED
        );
      }

      const payload = {
        rating,
        review,
        UserId: id,
        DoctorId: doctorId,
      };
      const newReview: ReviewAttributes =
        await this.review.create<ReviewCreationAttributes>(payload);
      if (!newReview) {
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
