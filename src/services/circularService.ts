import { Op, WhereOptions } from "sequelize";
import Circular from "../models/Circular";
import CircularView from "../models/CircularView";
import User from "../models/User";
import { 
  getPagination, 
  getPaginationData, 
  PaginationResult 
} from "../utils/paginationHelper";

// Interface representing data for creating or updating a circular
export interface CircularData {
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  is_active?: boolean;
  start_date: Date;
  end_date?: Date;
  priority?: number;
}

// Interface representing a circular response with optional viewed status
export interface CircularResponse {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link?: string;
  is_active: boolean;
  start_date: Date;
  end_date?: Date;
  priority: number;
  created_at: Date;
  updated_at: Date;
  viewed?: boolean;
  view_count?: number;
}

/**
 * Creates a new circular
 * @param circularData Data for the new circular
 * @returns The created circular
 */
export const createCircular = async (circularData: CircularData): Promise<Circular> => {
  return await Circular.create({
    ...circularData,
    is_active: circularData.is_active !== undefined ? circularData.is_active : true,
    priority: circularData.priority !== undefined ? circularData.priority : 0,
    is_deleted: false
  });
};

/**
 * Updates an existing circular
 * @param id ID of the circular to update
 * @param circularData Updated circular data
 * @returns The updated circular or null if not found
 */
export const updateCircular = async (id: string, circularData: Partial<CircularData>): Promise<Circular | null> => {
  const circular = await Circular.findByPk(id);
  
  if (!circular) {
    return null;
  }
  
  await circular.update(circularData);
  return circular;
};

/**
 * Soft deletes a circular
 * @param id ID of the circular to delete
 * @returns Success status
 */
export const deleteCircular = async (id: string): Promise<boolean> => {
  const circular = await Circular.findByPk(id);
  
  if (!circular) {
    return false;
  }
  
  await circular.update({ is_deleted: true });
  return true;
};

/**
 * Gets a circular by ID
 * @param id ID of the circular to retrieve
 * @returns The circular or null if not found
 */
export const getCircular = async (id: string): Promise<Circular | null> => {
  return await Circular.findOne({
    where: { 
      id,
      is_deleted: false
    }
  });
};

/**
 * Gets all circulars with pagination
 * @param page Page number
 * @param limit Items per page
 * @returns Circulars with pagination information
 */
export const getAllCirculars = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<Circular>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  
  const whereOptions: WhereOptions<any> = {
    is_deleted: false
  };
  
  const { count, rows } = await Circular.findAndCountAll({
    where: whereOptions,
    order: [['priority', 'DESC'], ['created_at', 'DESC']],
    offset,
    limit: limitValue
  });
  
  return getPaginationData(rows, count, page, limit);
};

/**
 * Gets all active circulars within the current date range
 * @param page Page number
 * @param limit Items per page
 * @returns Active circulars with pagination information
 */
export const getActiveCirculars = async (
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<Circular>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  
  const today = new Date();
  
  const whereOptions: WhereOptions<any> = {
    is_active: true,
    is_deleted: false,
    start_date: { [Op.lte]: today },
    [Op.or]: [
      { end_date: null },
      { end_date: { [Op.gte]: today } }
    ]
  };
  
  const { count, rows } = await Circular.findAndCountAll({
    where: whereOptions,
    order: [['priority', 'DESC'], ['created_at', 'DESC']],
    offset,
    limit: limitValue
  });
  
  return getPaginationData(rows, count, page, limit);
};

/**
 * Gets circulars for a specific user with their viewed status
 * @param userId ID of the user
 * @param page Page number
 * @param limit Items per page
 * @returns Circulars with viewed status and pagination information
 */
export const getUserCirculars = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<CircularResponse>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  
  const today = new Date();
  
  const whereOptions: WhereOptions<any> = {
    is_active: true,
    is_deleted: false,
    start_date: { [Op.lte]: today },
    [Op.or]: [
      { end_date: null },
      { end_date: { [Op.gte]: today } }
    ]
  };
  
  const { count, rows } = await Circular.findAndCountAll({
    where: whereOptions,
    order: [['priority', 'DESC'], ['created_at', 'DESC']],
    offset,
    limit: limitValue,
    include: [
      {
        model: CircularView,
        as: 'circularViews',
        required: false,
        where: { userId },
        attributes: ['id', 'viewedAt']
      }
    ]
  });
  
  // Transform results to include viewed status
  const transformedData: CircularResponse[] = rows.map(circular => {
    const plainCircular = circular.get({ plain: true });
    const circularWithViews = plainCircular as any; // Cast to any to access the views property
    const viewed = circularWithViews.circularViews && circularWithViews.circularViews.length > 0;
    
    // Convert to CircularResponse format
    return {
      id: plainCircular.id,
      title: plainCircular.title,
      description: plainCircular.description,
      image_url: plainCircular.image_url,
      link: plainCircular.link,
      is_active: plainCircular.is_active,
      start_date: plainCircular.start_date,
      end_date: plainCircular.end_date,
      priority: plainCircular.priority,
      created_at: plainCircular.created_at,
      updated_at: plainCircular.updated_at,
      viewed
    };
  });
  
  return getPaginationData(transformedData, count, page, limit);
};

/**
 * Mark a circular as viewed by a user
 * @param circularId ID of the circular
 * @param userId ID of the user
 * @returns The created view or null if already viewed
 */
export const markCircularAsViewed = async (
  circularId: string,
  userId: string
): Promise<CircularView | null> => {
  // Check if the circular exists and is active
  const circular = await Circular.findOne({
    where: {
      id: circularId,
      is_active: true,
      is_deleted: false
    }
  });
  
  if (!circular) {
    return null;
  }
  
  // Check if the user has already viewed this circular
  const existingView = await CircularView.findOne({
    where: {
      circularId,
      userId
    }
  });
  
  if (existingView) {
    return null; // Already viewed
  }
  
  // Create new view record
  return await CircularView.create({
    circularId,
    userId,
    viewed_at: new Date()
  });
};

/**
 * Get the view count for a circular
 * @param circularId ID of the circular
 * @returns The number of views
 */
export const getCircularViewCount = async (circularId: string): Promise<number> => {
  return await CircularView.count({
    where: { circularId }
  });
};

/**
 * Get detailed information about users who viewed a circular
 * @param circularId ID of the circular
 * @param page Page number
 * @param limit Items per page
 * @returns User view details with pagination
 */
export const getCircularViewDetails = async (
  circularId: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginationResult<CircularView>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  
  const { count, rows } = await CircularView.findAndCountAll({
    where: { circularId },
    include: [
      {
        model: User,
        attributes: ['id', 'name', 'email', 'phone']
      }
    ],
    order: [['viewedAt', 'DESC']],
    offset,
    limit: limitValue
  });
  
  return getPaginationData(rows, count, page, limit);
}; 