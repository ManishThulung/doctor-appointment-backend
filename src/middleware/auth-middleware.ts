import jwt from "jsonwebtoken";
import { NextFunction, Response } from "express";
import ApiError from "../abstractions/ApiError";
import { StatusCodes } from "http-status-codes";

export function authenticate(req: any, res: Response, next: NextFunction) {
  const { token, isLogged } = req.cookies;

  if (!token || !JSON?.parse(isLogged)) {
    throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
  }
}

export function authorize(roles: string[]) {
  return function (req: any, res: Response, next: NextFunction) {
    if (!roles.includes(req.user?.payload?.role)) {
      throw new ApiError("Unauthorized", StatusCodes.UNAUTHORIZED);
    }
    next();
  };
}
