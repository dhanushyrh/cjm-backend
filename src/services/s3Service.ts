import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost, PresignedPostOptions } from "@aws-sdk/s3-presigned-post";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { FilePurpose } from '../models/File';

// Configure AWS
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const bucketName = process.env.S3_BUCKET_NAME || 'your-bucket-name';

// Generate a folder path based on purpose
const getFolderPath = (purpose: FilePurpose, userId?: string): string => {
  const basePath = purpose.toLowerCase().replace('_', '-');
  return userId ? `users/${userId}/${basePath}/` : `uploads/${basePath}/`;
};

// Generate a unique filename
export const generateUniqueFilename = (originalName: string): string => {
  const extension = originalName.split('.').pop() || '';
  return `${uuidv4()}${extension ? '.' + extension : ''}`;
};

// Generate a pre-signed URL for client-side uploads
export const getPresignedUrl = async (
  purpose: FilePurpose,
  fileName: string,
  fileType: string,
  userId?: string
): Promise<{ url: string; fields: any; key: string }> => {
  const folderPath = getFolderPath(purpose, userId);
  const uniqueFilename = generateUniqueFilename(fileName);
  const key = `${folderPath}${uniqueFilename}`;

  const params: PresignedPostOptions = {
    Bucket: bucketName,
    Key: key,
    Conditions: [
      ["content-length-range", 0, 10485760],
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
      key
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
};

// Get a public URL for a file
export const getPublicUrl = (key: string): string => {
  return `https://${bucketName}.s3.amazonaws.com/${key}`;
};

// Delete a file from S3
export const deleteFile = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
};

// Generate a signed URL for viewing a file (with expiration)
export const getSignedReadUrl = async (
  key: string, 
  expiresIn: number = 3600 // Default 1 hour in seconds
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL for reading:', error);
    throw new Error('Failed to generate signed URL for file access');
  }
}; 