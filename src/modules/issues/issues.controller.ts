import { Request, Response, NextFunction } from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getMetrics,
} from "./issues.service";
import { sendSuccess, sendError } from "../../utils/response";
import { StatusCodes } from "http-status-codes";

// --------- CREATE ---------
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, description, type } = req.body;

    if (!title || !description || !type) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "title, description, type are required",
      );
      return;
    }

    if (!["bug", "feature_request"].includes(type)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "type must be bug or feature_request",
      );
      return;
    }

    if (title.length > 150) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "title must be under 150 characters",
      );
      return;
    }

    if (description.length < 20) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "description must be at least 20 characters",
      );
      return;
    }

    const issue = await createIssue({
      title,
      description,
      type,
      reporter_id: req.user!.id,
    });

    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
  } catch (err) {
    next(err);
  }
};

// --------- GET ALL ---------
export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sort, type, status } = req.query;

    const issues = await getAllIssues(
      sort as string,
      type as string,
      status as string,
    );

    sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issues);
  } catch (err) {
    next(err);
  }
};

// --------- GET SINGLE ---------
export const getSingle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params["id"] as string);

    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, "Invalid issue id");
      return;
    }

    const issue = await getIssueById(id);

    if (!issue) {
      sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
      return;
    }

    sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issue);
  } catch (err) {
    next(err);
  }
};

// --------- UPDATE ---------
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params["id"] as string);

    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, "Invalid issue id");
      return;
    }

    const existing = await getIssueById(id);

    if (!existing) {
      sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
      return;
    }

    const user = req.user!;

    if (user.role === "contributor") {
      if (existing.reporter?.id !== user.id) {
        sendError(
          res,
          StatusCodes.FORBIDDEN,
          "You can only update your own issues",
        );
        return;
      }
      if (existing.status !== "open") {
        sendError(
          res,
          StatusCodes.CONFLICT,
          "You can only update issues with open status",
        );
        return;
      }
    }

    const { title, description, type, status } = req.body;

    if (title && title.length > 150) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "title must be under 150 characters",
      );
      return;
    }

    if (description && description.length < 20) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "description must be at least 20 characters",
      );
      return;
    }

    if (type && !["bug", "feature_request"].includes(type)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "type must be bug or feature_request",
      );
      return;
    }

    if (status && user.role === "contributor") {
      sendError(
        res,
        StatusCodes.FORBIDDEN,
        "Contributors cannot change issue status",
      );
      return;
    }

    if (status && !["open", "in_progress", "resolved"].includes(status)) {
      sendError(
        res,
        StatusCodes.BAD_REQUEST,
        "status must be open, in_progress or resolved",
      );
      return;
    }

    const updated = await updateIssue(id, { title, description, type, status });

    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updated);
  } catch (err) {
    next(err);
  }
};

// --------- DELETE ---------
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseInt(req.params["id"] as string);

    if (isNaN(id)) {
      sendError(res, StatusCodes.BAD_REQUEST, "Invalid issue id");
      return;
    }

    const existing = await getIssueById(id);

    if (!existing) {
      sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
      return;
    }

    await deleteIssue(id);

    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully", null);
  } catch (err) {
    next(err);
  }
};

export const metrics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getMetrics();
    sendSuccess(res, StatusCodes.OK, "System metrics", data);
  } catch (err) {
    next(err);
  }
};
