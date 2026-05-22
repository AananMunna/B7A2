import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "./auth.service";
import { sendSuccess, sendError } from "../../utils/response";
import { StatusCodes } from "http-status-codes";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "name, email, password are required",
      );
      return;
    }
    if (role && !["contributor", "maintainer"].includes(role)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "role must be contributor or maintainer",
      );
      return;
    }

    const user = await registerUser({ name, email, password, role });
    sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_EXISTS") {
      sendError(res, StatusCodes.BAD_REQUEST, "Email already exists");
      return;
    }
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "email and password are required",
      );
      return;
    }
    const data = await loginUser({ email, password });
    sendSuccess(res, StatusCodes.OK, "Login successful", data);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CREDENTIALS") {
      sendError(res, StatusCodes.UNAUTHORIZED, "Invalid email or password");
      return;
    }
    next(err);
  }
};
