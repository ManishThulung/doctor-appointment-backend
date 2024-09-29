import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import natural from "natural";
import ApiError from "../abstractions/ApiError";
import { Review, ReviewAttributes } from "../database/models/Review";
import { ReviewService } from "../services/ReviewService";
import { wordDict } from "../utils/LexicalConstant";
import BaseController from "./BaseController";
import similarity from "compute-cosine-similarity";

export default class RecommendationController extends BaseController {
  private review: ReviewService<Review>;

  constructor() {
    super();
    this.review = new ReviewService({
      repository: Review,
    });
  }

  public async getRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      //////////////////////////////////////////
      ////similarity////////////////
      ///////////////////////
      var y = [
        { "1": [30, 12, 0, 3] },
        { "2": [2, 2, 2, 2] },
        { "3": [0, 0, 0, 4.5] },
      ];

      var x = [2, 2, 2, 2];
      let results: any = [];
      for (var i = 0; i < y.length; i++) {
        for (var key in y[i]) {
          if (y[i].hasOwnProperty(key)) {
            results.push(similarity(x, y[i][key]));
          }
        }
      }

      const topDoctors = await this.review.findTopDoctors();

      res.locals.data = {
        success: true,
        topDoctors,
      };
      this.send(res);
    } catch (err) {
      next(err);
    }
  }
}
