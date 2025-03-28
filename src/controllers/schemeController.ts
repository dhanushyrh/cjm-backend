import { Request, Response } from "express";
import { createScheme, getAllSchemes, getSchemeById, updateScheme, deleteScheme } from "../services/schemeService";

export const addScheme = async (req: Request, res: Response) => {
  try {
    const { name, duration, goldGrams } = req.body;

    // Validate required fields
    if (!name || !duration || !goldGrams) {
      return res.status(400).json({ 
        error: "Missing required fields",
        details: {
          name: !name ? "Scheme name is required" : undefined,
          duration: !duration ? "Duration is required" : undefined,
          goldGrams: !goldGrams ? "Gold grams is required" : undefined
        }
      });
    }

    // Validate numeric fields
    if (duration <= 0 || goldGrams <= 0) {
      return res.status(400).json({ 
        error: "Invalid values",
        details: "Duration and gold grams must be greater than 0"
      });
    }

    const newScheme = await createScheme(name, duration, goldGrams);
    
    res.status(201).json({
      message: "Scheme created successfully",
      scheme: newScheme
    });
  } catch (error: any) {
    console.error("Scheme Creation Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    res.status(500).json({ error: "Failed to create scheme" });
  }
};

export const fetchSchemes = async (_req: Request, res: Response) => {
  try {
    const schemes = await getAllSchemes();
    
    res.status(200).json({
      message: "Schemes fetched successfully",
      data: schemes
    });
  } catch (error: any) {
    console.error("Scheme Fetch Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch schemes" });
  }
};

export const fetchSchemeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        error: "Missing scheme ID",
        details: "Scheme ID is required"
      });
    }

    const scheme = await getSchemeById(id);
    if (!scheme) {
      return res.status(404).json({ 
        error: "Scheme not found",
        details: "No scheme found with the provided ID"
      });
    }

    res.status(200).json({
      message: "Scheme fetched successfully",
      scheme
    });
  } catch (error: any) {
    console.error("Scheme Fetch By ID Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to fetch scheme" });
  }
};

export const modifyScheme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing scheme ID",
        details: "Scheme ID is required"
      });
    }

    // Validate numeric fields if provided
    if (updates.duration && updates.duration <= 0) {
      return res.status(400).json({ 
        error: "Invalid duration",
        details: "Duration must be greater than 0"
      });
    }

    if (updates.goldGrams && updates.goldGrams <= 0) {
      return res.status(400).json({ 
        error: "Invalid gold grams",
        details: "Gold grams must be greater than 0"
      });
    }

    const updatedScheme = await updateScheme(id, updates);
    if (!updatedScheme) {
      return res.status(404).json({ 
        error: "Scheme not found",
        details: "No scheme found with the provided ID"
      });
    }

    res.status(200).json({
      message: "Scheme updated successfully",
      scheme: updatedScheme
    });
  } catch (error: any) {
    console.error("Scheme Update Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: error.errors.map((err: any) => err.message)
      });
    }

    res.status(500).json({ error: "Failed to update scheme" });
  }
};

// Check for active user 
export const removeScheme = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: "Missing scheme ID",
        details: "Scheme ID is required"
      });
    }

    const deleted : any = await deleteScheme(id);
    if (!deleted) {
      return res.status(404).json({ 
        error: "Scheme not found",
        details: "No scheme found with the provided ID"
      });
    }

    res.status(200).json({ 
      message: "Scheme deleted successfully",
      schemeId: id
    });
  } catch (error: any) {
    console.error("Scheme Delete Error:", {
      message: error.message,
      stack: error.stack,
      details: error.errors || error
    });

    res.status(500).json({ error: "Failed to delete scheme" });
  }
};
