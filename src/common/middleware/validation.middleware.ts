import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body); // filters out the extra fields too
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        return res.status(400).json({
          status: "fail",
          message: errorMessage || "Validation failed",
        });
      }

      // // Handle non-zod errors
      // return res.status(500).json({
      //   status: "error",
      //   message: "Internal Server Error",
      // });
      next(error);
    }
  };
