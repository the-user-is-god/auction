// import { NextFunction, Request, Response } from "express";

// export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
//   fn(req, res, next).catch(next);
// };

import { NextFunction, Request, Response, RequestHandler } from "express";

// Explicitly define the handler type to avoid the unsafe 'Function' type
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
