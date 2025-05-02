import { Request, Response } from 'express';
import * as fileService from '../services/fileService';
import { FilePurpose } from '../models/File';
import User from '../models/User';
import { getSignedReadUrl } from '../services/s3Service';

// Get presigned URL for direct upload
export const getPresignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { originalName, mimeType, size, userId, purpose } = req.body;

    // Validate required fields
    if (!originalName || !mimeType || !size || !purpose) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Validate purpose
    const validPurposes: FilePurpose[] = ['PROFILE_IMAGE', 'ID_PROOF', 'OTHER', 'SUPPORTING_DOC'];
    if (!validPurposes.includes(purpose as FilePurpose)) {
      res.status(400).json({
        success: false,
        message: 'Invalid purpose'
      });
      return;
    }

    // Validate file size (10MB max)
    if (size > 10 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: 'File too large (max 10MB)'
      });
      return;
    }

    // Validate mime types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (purpose === 'PROFILE_IMAGE' && !validImageTypes.includes(mimeType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type for profile image'
      });
      return;
    }
    
    if ((purpose === 'ID_PROOF' || purpose === 'SUPPORTING_DOC') && !validDocumentTypes.includes(mimeType)) {
      res.status(400).json({
        success: false,
        message: `Invalid file type for ${purpose.toLowerCase().replace('_', ' ')}`
      });
      return;
    }

    // Get presigned URL
    const result = await fileService.getFileUploadUrl({
      originalName,
      mimeType,
      size,
      userId,
      purpose: purpose as FilePurpose
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate upload URL'
    });
  }
};

// Get file by ID
export const getFileById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    const file = await fileService.getFileById(fileId);
    
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error: any) {
    console.error('Error getting file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get file'
    });
  }
};

// Get user files by purpose
export const getUserFilesByPurpose = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, purpose } = req.params;
    
    // Validate purpose
    const validPurposes: FilePurpose[] = ['PROFILE_IMAGE', 'ID_PROOF', 'OTHER', 'SUPPORTING_DOC'];
    if (!validPurposes.includes(purpose as FilePurpose)) {
      res.status(400).json({
        success: false,
        message: 'Invalid purpose'
      });
      return;
    }
    
    const files = await fileService.getUserFilesByPurpose(userId, purpose as FilePurpose);
    
    res.status(200).json({
      success: true,
      data: files
    });
  } catch (error: any) {
    console.error('Error getting user files:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user files'
    });
  }
};

// Delete file (mark as deleted)
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    
    await fileService.markFileAsDeleted(fileId);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete file'
    });
  }
};

// Update user profile with uploaded file
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fileId, fieldType } = req.body;
    
    if (!userId || !fileId || !fieldType) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }
    
    // Validate field type
    if (fieldType !== 'profile_image' && fieldType !== 'id_proof') {
      res.status(400).json({
        success: false,
        message: 'Invalid field type'
      });
      return;
    }
    
    // Get the file
    const file = await fileService.getFileById(fileId);
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }
    
    // Update user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Update the appropriate field
    if (fieldType === 'profile_image') {
      await user.update({ profile_image: file.url });
    } else if (fieldType === 'id_proof') {
      await user.update({ id_proof: file.url });
    }
    
    res.status(200).json({
      success: true,
      message: `User ${fieldType.replace('_', ' ')} updated successfully`
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user profile'
    });
  }
};

// Get a signed URL for accessing a file
export const getFileAccessUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { expiresIn } = req.query;
    
    // Validate fileId
    if (!fileId) {
      res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
      return;
    }
    
    // Get the file from database
    const file = await fileService.getFileById(fileId);
    
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }
    
    // Generate signed URL with optional expiration time
    const expiration = expiresIn ? parseInt(expiresIn as string) : undefined;
    const signedUrl = await getSignedReadUrl(file.path, expiration);
    
    res.status(200).json({
      success: true,
      data: {
        fileId: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        signedUrl
      }
    });
  } catch (error: any) {
    console.error('Error generating file access URL:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate file access URL'
    });
  }
};

// Get a signed URL for accessing a file for regular users
export const getUserFileAccessUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { expiresIn } = req.query;
    const userId = (req as any).user.id; // Get the authenticated user's ID
    
    // Validate fileId
    if (!fileId) {
      res.status(400).json({
        success: false,
        message: 'File ID is required'
      });
      return;
    }
    
    // Get the file from database
    const file = await fileService.getFileById(fileId);
    
    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
      return;
    }

    // Check if the file belongs to the authenticated user
    if (file.userId && file.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to access this file'
      });
      return;
    }
    
    // Generate signed URL with optional expiration time
    const expiration = expiresIn ? parseInt(expiresIn as string) : undefined;
    const signedUrl = await getSignedReadUrl(file.path, expiration);
    
    res.status(200).json({
      success: true,
      data: {
        fileId: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        signedUrl
      }
    });
  } catch (error: any) {
    console.error('Error generating file access URL for user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate file access URL'
    });
  }
}; 