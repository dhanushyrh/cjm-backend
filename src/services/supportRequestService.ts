import SupportRequest, {
  SupportRequestStatus,
} from "../models/SupportRequest";
import User from "../models/User";
import File from "../models/File";

const MAX_IMAGES = 3;

export const createSupportRequest = async (
  userId: string,
  title: string,
  description: string,
  image_file_ids: string[] = []
) => {
  const ids = Array.isArray(image_file_ids) ? image_file_ids : [];

  if (ids.length > MAX_IMAGES) {
    throw new Error(`Maximum ${MAX_IMAGES} images allowed`);
  }

  if (ids.length > 0) {
    const files = await File.findAll({
      where: {
        id: ids,
        userId,
        purpose: "SUPPORT_IMAGE",
        is_deleted: false,
      },
    });

    if (files.length !== ids.length) {
      throw new Error(
        "One or more image files are invalid or do not belong to this user"
      );
    }
  }

  return await SupportRequest.create({
    userId,
    title: title.trim(),
    description: description.trim(),
    image_file_ids: ids,
    status: SupportRequestStatus.PENDING,
    admin_remarks: null,
    is_deleted: false,
  });
};

export const getUserSupportRequests = async (userId: string) => {
  return await SupportRequest.findAll({
    where: { userId, is_deleted: false },
    order: [["createdAt", "DESC"]],
  });
};

export const getSupportRequestById = async (id: string) => {
  return await SupportRequest.findOne({
    where: { id, is_deleted: false },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "mobile", "userId"],
      },
    ],
  });
};

export const getAllSupportRequests = async (
  page: number = 1,
  limit: number = 10,
  status?: SupportRequestStatus
) => {
  const offset = (page - 1) * limit;
  const where: Record<string, unknown> = { is_deleted: false };

  if (status) {
    where.status = status;
  }

  const { count, rows } = await SupportRequest.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email", "mobile", "userId"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    data: rows,
  };
};

export const updateSupportRequest = async (
  id: string,
  updates: {
    status?: SupportRequestStatus;
    admin_remarks?: string | null;
  }
) => {
  const request = await SupportRequest.findOne({
    where: { id, is_deleted: false },
  });

  if (!request) {
    throw new Error("Support request not found");
  }

  if (updates.status !== undefined) {
    if (!Object.values(SupportRequestStatus).includes(updates.status)) {
      throw new Error("Invalid status");
    }
  }

  return await request.update(updates);
};
