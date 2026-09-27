import File, { FilePurpose } from '../models/File';
import { getPresignedUrl, deleteFile, getDefaultBucketName } from './s3Service';
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
  bucket: string;
}

export const getFileUploadUrl = async (
  params: FileUploadParams,
  transaction?: Transaction
): Promise<PresignedUrlResponse> => {
  try {
    if (params.userId) {
      const user = await User.findByPk(params.userId);
      if (!user) {
        throw new Error('User not found');
      }
    }

    const { url, fields, key, bucket } = await getPresignedUrl(
      params.purpose,
      params.originalName,
      params.mimeType,
      params.userId
    );

    const file = await File.create(
      {
        originalName: params.originalName,
        filename: key.split('/').pop() || generateUniqueFilename(params.originalName),
        mimeType: params.mimeType,
        size: params.size,
        path: key,
        url: url,
        bucket,
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
      key,
      bucket
    };
  } catch (error) {
    console.error('Error getting file upload URL:', error);
    throw error;
  }
};

export const getFileById = async (fileId: string): Promise<File | null> => {
  return await File.findOne({
    where: {
      id: fileId,
      is_deleted: false
    }
  });
};

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

export const markFileAsDeleted = async (fileId: string): Promise<void> => {
  const file = await File.findByPk(fileId);

  if (!file) {
    throw new Error('File not found');
  }

  await file.update({ is_deleted: true });
};

export const permanentlyDeleteFile = async (fileId: string): Promise<void> => {
  const file = await File.findByPk(fileId);

  if (!file) {
    throw new Error('File not found');
  }

  await deleteFile(file.path, file.bucket || getDefaultBucketName());
  await file.destroy();
};

export const resolveFileBucket = (file: File): string =>
  file.bucket || getDefaultBucketName();
