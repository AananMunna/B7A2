import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { StatusCodes } from "http-status-codes";

export interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers["authorization"];

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, "No token Provided");
    return;
  }

  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    req.user = decode;
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const authorizeRole = (
  ...roles: Array<"contributor" | "maintainer">
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, StatusCodes.FORBIDDEN, "Access denied");
      return;
    }
    next();
  };
};
