import { Request, Response } from "express";
import {
  getSetting,
  getSettings,
  setSetting,
  deleteSetting,
  getContactInfo,
  upsertContactInfo,
} from "../services/settingsService";
import Settings from "../models/Settings";

export const fetchContactInfo = async (_req: Request, res: Response) => {
  try {
    const data = await getContactInfo();
    res.status(200).json({
      message: "Contact info fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Contact Fetch Error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
};

const isHttpUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const updateContactInfo = async (req: Request, res: Response) => {
  try {
    const { address, phone, email, termsUrl, privacyUrl } = req.body ?? {};

    if (
      address === undefined &&
      phone === undefined &&
      email === undefined &&
      termsUrl === undefined &&
      privacyUrl === undefined
    ) {
      return res.status(400).json({
        error: "Missing fields",
        details: "Provide at least one contact field",
      });
    }

    if (email !== undefined && email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({
        error: "Invalid email",
        details: "Provide a valid email address",
      });
    }

    if (termsUrl !== undefined && String(termsUrl).trim() !== "" && !isHttpUrl(String(termsUrl).trim())) {
      return res.status(400).json({
        error: "Invalid terms URL",
        details: "Terms URL must start with http:// or https://",
      });
    }

    if (privacyUrl !== undefined && String(privacyUrl).trim() !== "" && !isHttpUrl(String(privacyUrl).trim())) {
      return res.status(400).json({
        error: "Invalid privacy URL",
        details: "Privacy policy URL must start with http:// or https://",
      });
    }

    const data = await upsertContactInfo({
      address: address !== undefined ? String(address) : undefined,
      phone: phone !== undefined ? String(phone) : undefined,
      email: email !== undefined ? String(email) : undefined,
      termsUrl: termsUrl !== undefined ? String(termsUrl) : undefined,
      privacyUrl: privacyUrl !== undefined ? String(privacyUrl) : undefined,
    });

    res.status(200).json({
      message: "Contact info updated successfully",
      data,
    });
  } catch (error: any) {
    console.error("Contact Update Error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to update contact info" });
  }
};

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

// Add a new controller method to get a setting by key
export const fetchSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!key) {
      return res.status(400).json({ 
        error: "Missing setting key",
        details: "Setting key is required"
      });
    }

    const settingValue = await getSetting(key);
    
    if (settingValue === undefined) {
      return res.status(404).json({ 
        error: "Setting not found",
        details: `No setting found with key: ${key}`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        key,
        value: settingValue
      }
    });
  } catch (error: any) {
    console.error("Setting Fetch By Key Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ 
      success: false,
      error: "Failed to fetch setting" 
    });
  }
}; 