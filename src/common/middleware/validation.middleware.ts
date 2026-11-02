import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

type RequestPart = "body" | "query" | "params";

export const validate =
  (part: RequestPart, schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => {
          const path = issue.path.length ? issue.path.join(".") : part;
          return `${path}: ${issue.message}`;
        })
        .join(", ");

      return res.status(400).json({
        status: "fail",
        message,
      });
    }
    if (part === "body") {
      req.body = result.data;
    } else {
      // Clear out unvalidated/raw strings from query or params
      for (const key in req[part]) {
        delete (req[part] as any)[key];
      }
      // Shallow copy parsed, typed Zod properties into the original object
      Object.assign(req[part], result.data);
    }

    next();
  };
