import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../abstractions/ApiError";

import {
  Department,
  DepartmentAttributes,
  DepartmentCreationAttributes,
} from "../database/models/Department";
import { DepartmentService } from "../services/DepartmentService";
import BaseController from "./BaseController";

export default class DepartmentController extends BaseController {
  private department: DepartmentService<Department>;
  constructor() {
    super();
    this.department = new DepartmentService({ repository: Department });
  }

  public async getDepartments(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const departments: DepartmentAttributes[] = await this.department.getAll({
        deletedAt: null,
      });
      res.locals.data = departments;
      this.send(res);
    } catch (err) {
      next(err);
    }
  }

  // public async getDoctorById(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const id = req.params.id;
  //     const doctor: DepartmentAttributes =
  //       await this.department.getOneWithAssociation(
  //         { id: id, deletedAt: null },
  //         ["Address"],
  //         ["createdAt", "updatedAt", "deletedAt", "AddressId", "password"]
  //       );
  //     if (!doctor) {
  //       throw new ApiError("Doctor not found!", StatusCodes.NOT_FOUND);
  //     }
  //     res.locals.data = doctor;
  //     this.send(res);
  //   } catch (err) {
  //     next(err);
  //   }
  // }

  public async createDepartment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, description } = req.body;

      if (!req.files || req.files.length === 0) {
        throw new ApiError(
          "Upload fail",
          StatusCodes.BAD_REQUEST,
          false,
          "UploadError"
        );
      }

      const payload: DepartmentCreationAttributes = {
        name,
        description,
        image: req.files?.["image"][0],
      };
      const department: DepartmentAttributes =
        await this.department.create<DepartmentCreationAttributes>(payload);
      if (!department) {
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
