import { Request, Response } from "express";
import { getSetting, getSettings, setSetting, deleteSetting } from "../services/settingsService";

export const fetchSettings = async (_req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    
    res.status(200).json({
      message: "Settings fetched successfully",
      data: settings
    });
  } catch (error: any) {
    console.error("Settings Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const fetchSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ 
        error: "Missing setting key",
        details: "Setting key is required"
      });
    }

    const value = await getSetting(key);
    if (value === undefined) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: "No setting found with the provided key"
      });
    }

    res.status(200).json({
      message: "Setting fetched successfully",
      data: { key, value }
    });
  } catch (error: any) {
    console.error("Setting Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch setting" });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value, description, isSystem } = req.body;

    if (!key) {
      return res.status(400).json({ 
        error: "Missing setting key",
        details: "Setting key is required"
      });
    }

    if (value === undefined) {
      return res.status(400).json({ 
        error: "Missing value",
        details: "Setting value is required"
      });
    }

    const setting = await setSetting(key, value, description, isSystem);
    
    res.status(200).json({
      message: "Setting updated successfully",
      data: setting
    });
  } catch (error: any) {
    console.error("Setting Update Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to update setting" });
  }
};

export const removeSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ 
        error: "Missing setting key",
        details: "Setting key is required"
      });
    }

    const deleted = await deleteSetting(key);
    if (!deleted) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: "No setting found with the provided key"
      });
    }

    res.status(200).json({ 
      message: "Setting deleted successfully",
      key
    });
  } catch (error: any) {
    console.error("Setting Delete Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.message === "Cannot delete system settings") {
      return res.status(403).json({ 
        error: "Cannot delete system settings",
        details: "System settings are protected and cannot be deleted"
      });
    }

    res.status(500).json({ error: "Failed to delete setting" });
  }
}; 