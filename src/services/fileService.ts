import File, { FilePurpose } from '../models/File';
import { getPresignedUrl, getPublicUrl, deleteFile } from './s3Service';
import { generateUniqueFilename } from './s3Service';
import User from '../models/User';
import { Transaction } from 'sequelize';

export interface FileUploadParams {
  originalName: string;
  mimeType: string;
  size: number;
  userId?: string;
  purpose: FilePurpose;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fields: any;
  fileId: string;
  key: string;
}

// Generate a presigned URL for direct upload to S3
export const getFileUploadUrl = async (
  params: FileUploadParams,
  transaction?: Transaction
): Promise<PresignedUrlResponse> => {
  try {
    // Validate the user if userId is provided
    if (params.userId) {
      const user = await User.findByPk(params.userId);
      if (!user) {
        throw new Error('User not found');
      }
    }

    // Generate a unique key for S3
    const { url, fields, key } = await getPresignedUrl(
      params.purpose,
      params.originalName,
      params.mimeType,
      params.userId
    );

    // Create a file record in the database
    const file = await File.create(
      {
        originalName: params.originalName,
        filename: key.split('/').pop() || generateUniqueFilename(params.originalName),
        mimeType: params.mimeType,
        size: params.size,
        path: key,
        url: url,
        userId: params.userId || null,
        purpose: params.purpose,
        is_deleted: false
      },
      { transaction }
    );

    return {
      uploadUrl: url,
      fields,
      fileId: file.id,
      key
    };
  } catch (error) {
    console.error('Error getting file upload URL:', error);
    throw error;
  }
};

// Get file by ID
export const getFileById = async (fileId: string): Promise<File | null> => {
  return await File.findOne({
    where: {
      id: fileId,
      is_deleted: false
    }
  });
};

// Get user files by purpose
export const getUserFilesByPurpose = async (
  userId: string,
  purpose: FilePurpose
): Promise<File[]> => {
  return await File.findAll({
    where: {
      userId,
      purpose,
      is_deleted: false
    },
    order: [['createdAt', 'DESC']]
  });
};

// Mark file as deleted
export const markFileAsDeleted = async (fileId: string): Promise<void> => {
  const file = await File.findByPk(fileId);
  
  if (!file) {
    throw new Error('File not found');
  }

  // Mark as deleted in database
  await file.update({ is_deleted: true });

  // Optionally delete from S3 as well
  // await deleteFile(file.path);
};

// Delete file from S3 and database
export const permanentlyDeleteFile = async (fileId: string): Promise<void> => {
  const file = await File.findByPk(fileId);
  
  if (!file) {
    throw new Error('File not found');
  }

  // Delete from S3
  await deleteFile(file.path);

  // Delete from database
  await file.destroy();
}; 