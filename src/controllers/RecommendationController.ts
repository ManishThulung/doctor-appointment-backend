import { NextFunction, Request, Response } from "express";
import BaseController from "./BaseController";
import similarity from "compute-cosine-similarity";
import natural from "natural";
import { Review, ReviewAttributes } from "../database/models/Review";
import { ReviewService } from "../services/ReviewService";
import { wordDict } from "../utils/LexicalConstant";
import ApiError from "../abstractions/ApiError";
import { StatusCodes } from "http-status-codes";

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
      const Analyzer = natural.SentimentAnalyzer;
      const stemmer = natural.PorterStemmer;
      const analyzer = new Analyzer("English", stemmer, "afinn");

      const interpretSentiment = (score: number) => {
        if (score > 0.5) return "Strongly Positive";
        if (score > 0) return "Positive";
        if (score === 0) return "Neutral";
        if (score > -0.5) return "Negative";
        return "Strongly Negative";
      };

      const lexData = this.convertToStandard(req.body.review);
      console.log("Lexed Data: ", lexData);

      const result = analyzer.getSentiment(lexData.split(" "));
      const humanReadable = interpretSentiment(result);

      //////////////////////////////////////////
      ////similarity////////////////
      ///////////////////////

      // const cosineSimilarity = (vectorA, vectorB) => {
      //   const dotProduct = vectorA.reduce(
      //     (sum, value, index) => sum + value * vectorB[index],
      //     0
      //   );
      //   const magnitudeA = Math.sqrt(
      //     vectorA.reduce((sum, value) => sum + value * value, 0)
      //   );
      //   const magnitudeB = Math.sqrt(
      //     vectorB.reduce((sum, value) => sum + value * value, 0)
      //   );

      //   if (magnitudeA === 0 || magnitudeB === 0) {
      //     return 0; // Avoid division by zero
      //   }

      //   return dotProduct / (magnitudeA * magnitudeB);
      // };

      // // Example usage:
      // const vectorA = [2, 2, 2,2];
      // const vectorB = [30, 12, 0, 3];

      // const similaritya = cosineSimilarity(vectorA, vectorB);
      // console.log("Cosine similarity:", similaritya);

      const review: ReviewAttributes[] =
        await this.review.getAllWithAssociation(
          { deletedAt: null },
          ["User", "Doctor"]
          // ["createdAt", "updatedAt", "deletedAt", "UserId", "DoctorId"]
        );
    //  const review= await this.review.getAll({
    //     deletedAt: null,
    //   });
      if (!review) {
        throw new ApiError("Review not found!", StatusCodes.NOT_FOUND);
      }

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

      res.locals.data = {
        success: true,
        result,
        humanReadable,
        results,
        review,
      };
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  // convert the review into standart english form
  // eg: i don't like it => i do not like it
  private convertToStandard(text: string) {
    const data = text.split(" ");
    data.forEach((word, index) => {
      Object.keys(wordDict).forEach((key) => {
        if (key === word.toLowerCase()) {
          data[index] = wordDict[key];
        }
      });
    });

    return data.join(" ");
  }
}
