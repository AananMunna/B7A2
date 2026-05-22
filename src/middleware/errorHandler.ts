import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Error:", err.message);

  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal server error",
    err.message,
  );
};
