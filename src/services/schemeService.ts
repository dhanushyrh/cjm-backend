import Scheme from "../models/Scheme";

export const createScheme = async (name: string, duration: number, goldGrams: number) => {
  return await Scheme.create({ name, duration, goldGrams });
};

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const getAllSchemes = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<Scheme>> => {
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Scheme.findAndCountAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
  
  const pages = Math.ceil(count / limit);
  
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      limit,
      pages
    }
  };
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