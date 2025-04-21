/**
 * Calculate pagination parameters
 * @param page Current page (1-based)
 * @param limit Items per page
 * @returns Object with offset and limit
 */
export const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

/**
 * Interface for pagination response
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Format data with pagination information
 * @param data Array of data items
 * @param totalItems Total number of items
 * @param page Current page
 * @param limit Items per page
 * @returns Pagination result object
 */
export const getPaginationData = <T>(
  data: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
};

/**
 * Validate and normalize pagination parameters
 * @param page Page number from request
 * @param limit Items per page from request
 * @param maxLimit Maximum allowed limit
 * @returns Validated pagination parameters
 */
export const validatePaginationParams = (
  page: number,
  limit: number,
  maxLimit: number = 100
) => {
  const result = {
    page: 1,
    limit: 10,
    isValid: true,
    message: ""
  };

  if (isNaN(page) || page < 1) {
    result.isValid = false;
    result.message = "Page must be a positive number";
    return result;
  }

  if (isNaN(limit) || limit < 1) {
    result.isValid = false;
    result.message = "Limit must be a positive number";
    return result;
  }

  if (limit > maxLimit) {
    result.limit = maxLimit;
    result.message = `Limit exceeds maximum of ${maxLimit}, using ${maxLimit} instead`;
  } else {
    result.limit = limit;
  }

  result.page = page;
  
  return result;
}; 