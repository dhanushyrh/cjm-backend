import Scheme from "../models/Scheme";

export const createScheme = async (name: string, duration: number, goldGrams: number) => {
  return await Scheme.create({ name, duration, goldGrams });
};

export const getAllSchemes = async () => {
  return await Scheme.findAll();
};

export const getSchemeById = async (id: string) => {
  return await Scheme.findByPk(id);
};

export const updateScheme = async (id: string, updates: Partial<Scheme>) => {
    const scheme = await Scheme.findByPk(id);
    if (!scheme) throw new Error("Scheme not found");

    return await scheme.update(updates);
};

export const deleteScheme = async (id: string) => {
    const scheme = await Scheme.findByPk(id);
    if (!scheme) throw new Error("Scheme not found");

    await scheme.destroy(); 
};