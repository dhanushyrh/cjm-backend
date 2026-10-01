import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost, PresignedPostOptions } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { FilePurpose } from '../models/File';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const defaultBucketName = process.env.S3_BUCKET_NAME || 'your-bucket-name';
// Dedicated daily-tasks bucket needs IAM Put/Get/Delete + browser CORS.
// Opt in with S3_DAILY_TASKS_USE_DEDICATED=true once AWS is configured;
// otherwise proofs use the main docs bucket (same as circulars).
const useDedicatedDailyTasksBucket =
  process.env.S3_DAILY_TASKS_USE_DEDICATED === 'true';
const dailyTasksBucketName = useDedicatedDailyTasksBucket
  ? process.env.S3_DAILY_TASKS_BUCKET_NAME || defaultBucketName
  : defaultBucketName;

export const getBucketForPurpose = (purpose: FilePurpose): string => {
  if (purpose === 'DAILY_TASK_PROOF') {
    return dailyTasksBucketName;
  }
  return defaultBucketName;
};

export const getDefaultBucketName = (): string => defaultBucketName;
export const getDailyTasksBucketName = (): string => dailyTasksBucketName;

const getFolderPath = (purpose: FilePurpose, userId?: string): string => {
  const basePath = purpose.toLowerCase().replace(/_/g, '-');
  return userId ? `users/${userId}/${basePath}/` : `uploads/${basePath}/`;
};

export const generateUniqueFilename = (originalName: string): string => {
  const extension = originalName.split('.').pop() || '';
  return `${uuidv4()}${extension ? '.' + extension : ''}`;
};

export const getPresignedUrl = async (
  purpose: FilePurpose,
  fileName: string,
  fileType: string,
  userId?: string
): Promise<{ url: string; fields: any; key: string; bucket: string }> => {
  const folderPath = getFolderPath(purpose, userId);
  const uniqueFilename = generateUniqueFilename(fileName);
  const key = `${folderPath}${uniqueFilename}`;
  const bucket = getBucketForPurpose(purpose);
  const maxBytes =
    purpose === 'DAILY_TASK_PROOF' || purpose === 'SUPPORT_IMAGE'
      ? 5 * 1024 * 1024
      : 10485760;

  const params: PresignedPostOptions = {
    Bucket: bucket,
    Key: key,
    Conditions: [
      ["content-length-range", 0, maxBytes],
      ["eq", "$Content-Type", fileType]
    ],
    Fields: {
      'Content-Type': fileType
    },
    Expires: 300
  };

  try {
    const presignedPost = await createPresignedPost(s3Client, params);
    return {
      url: presignedPost.url,
      fields: presignedPost.fields,
      key,
      bucket
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

export const getPublicUrl = (key: string, bucket: string = defaultBucketName): string => {
  return `https://${bucket}.s3.amazonaws.com/${key}`;
};

export const deleteFile = async (
  key: string,
  bucket: string = defaultBucketName
): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
};

export const getSignedReadUrl = async (
  key: string,
  expiresIn: number = 3600,
  bucket: string = defaultBucketName
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL for reading:', error);
    throw new Error('Failed to generate signed URL for file access');
  }
};
