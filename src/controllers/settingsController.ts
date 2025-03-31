import { Request, Response } from "express";
import { getSetting, getSettings, setSetting, deleteSetting } from "../services/settingsService";
import Settings from "../models/Settings";

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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing setting ID",
        details: "Setting ID is required"
      });
    }

    // Find setting by ID
    const setting = await Settings.findByPk(id);
    if (!setting) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: "No setting found with the provided ID"
      });
    }

    res.status(200).json({
      message: "Setting fetched successfully",
      data: setting
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

export const createSetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

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

    const setting = await setSetting(key, value);
    
    res.status(201).json({
      message: "Setting created successfully",
      data: setting
    });
  } catch (error: any) {
    console.error("Setting Creation Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to create setting" });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing setting ID",
        details: "Setting ID is required"
      });
    }

    if (value === undefined) {
      return res.status(400).json({ 
        error: "Missing value",
        details: "Setting value is required"
      });
    }

    // Find the setting first
    const setting = await Settings.findByPk(id);
    if (!setting) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: "No setting found with the provided ID"
      });
    }

    // Update the setting
    setting.value = value;
    await setting.save();
    
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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing setting ID",
        details: "Setting ID is required"
      });
    }

    // Find setting by ID
    const setting = await Settings.findByPk(id);
    if (!setting) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: "No setting found with the provided ID"
      });
    }

    // Delete the setting
    await setting.destroy();

    res.status(200).json({ 
      message: "Setting deleted successfully",
      id
    });
  } catch (error: any) {
    console.error("Setting Delete Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to delete setting" });
  }
}; 