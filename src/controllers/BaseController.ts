import { Response } from "express";
import { StatusCodes } from "http-status-codes";

export default abstract class BaseController {
  /**
   * Global method to send API response
   * @param res
   * @param statusCode
   */
  public send(res: Response, statusCode: number = StatusCodes.OK): void {
    // const encryptedData = getEncryptedText(res.locals.data);
    res.status(statusCode).send(res.locals.data);
  }
}
