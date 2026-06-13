import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { AppError } from "../utils/AppError.js";

type Target = "body" | "query" | "params";

export function validate(schema: Joi.ObjectSchema, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { value, error } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      return next(
        new AppError(
          400,
          "Validation failed",
          error.details.map((detail) => ({ field: detail.path.join("."), message: detail.message }))
        )
      );
    }

    req[target] = value;
    return next();
  };
}
