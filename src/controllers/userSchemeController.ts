import { Request, Response } from "express";
import * as userSchemeService from "../services/userSchemeService";
import { UserSchemeStatus } from "../models/UserScheme";

const VALID_STATUSES = ["ACTIVE", "COMPLETED", "WITHDRAWN"] as const;

export const createUserScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, schemeId } = req.body;
    const result = await userSchemeService.createUserScheme(userId, schemeId);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getUserSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const schemes = await userSchemeService.getUserSchemes(userId);
    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getActiveUserScheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, schemeId } = req.params;
    const scheme = await userSchemeService.getActiveUserScheme(userId, schemeId);
    if (!scheme) {
      res.status(404).json({
        success: false,
        error: "Active scheme not found"
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: scheme
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateUserSchemeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({
        success: false,
        error: "Invalid status value"
      });
      return;
    }
    const updatedScheme = await userSchemeService.updateUserSchemeStatus(userSchemeId, status);
    res.status(200).json({
      success: true,
      data: updatedScheme
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updateUserSchemePoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userSchemeId } = req.params;
    const { points } = req.body;
    if (typeof points !== 'number') {
      res.status(400).json({
        success: false,
        error: "Points must be a number"
      });
      return;
    }
    const updatedScheme = await userSchemeService.updateUserSchemePoints(userSchemeId, points);
    res.status(200).json({
      success: true,
      data: updatedScheme
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getExpiredSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const schemes = await userSchemeService.getExpiredSchemes();
    res.status(200).json({
      success: true,
      data: schemes
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 