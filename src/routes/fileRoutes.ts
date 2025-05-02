import express, { RequestHandler } from 'express';
import * as fileController from '../controllers/fileController';
import { authenticateAdmin, authenticateUser } from '../middleware/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * /api/files/upload-url:
 *   post:
 *     tags: [Files]
 *     summary: Get a presigned URL for direct file upload to S3
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - originalName
 *               - mimeType
 *               - size
 *               - purpose
 *             properties:
 *               originalName:
 *                 type: string
 *                 description: Original file name
 *               mimeType:
 *                 type: string
 *                 description: MIME type of the file
 *               size:
 *                 type: integer
 *                 description: File size in bytes
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional user ID to associate the file with
 *               purpose:
 *                 type: string
 *                 enum: [PROFILE_IMAGE, ID_PROOF, OTHER, SUPPORTING_DOC]
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload-url', authenticateAdmin as RequestHandler, fileController.getPresignedUrl);

/**
 * @swagger
 * /api/files/test-config:
 *   get:
 *     tags: [Files]
 *     summary: Test S3 configuration and Files table structure
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: S3 configuration and database structure test result
 *       500:
 *         description: Server error
 */
router.get('/test-config', authenticateAdmin as RequestHandler, async (req, res) => {
  try {
    // Check S3 configuration
    const s3Config = {
      bucketName: process.env.S3_BUCKET_NAME || 'not-set',
      region: process.env.AWS_REGION || 'not-set',
      // Don't log credentials
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    };
    
    // Check Files table structure
    const File = require('../models/File').default;
    
    // Get the model attributes to confirm they match the table structure
    const fileAttributes = Object.keys(File.rawAttributes).sort();
    
    // Expected attributes based on your SQL schema
    const expectedAttributes = [
      'id', 'originalName', 'filename', 'mimeType', 'size', 
      'path', 'url', 'userId', 'purpose', 'is_deleted',
      'createdAt', 'updatedAt'
    ].sort();
    
    // Check if all expected attributes are present
    const hasAllAttributes = expectedAttributes.every(attr => 
      fileAttributes.includes(attr)
    );
    
    // Check for any fields defined in the model but not in the schema
    const extraAttributes = fileAttributes.filter(attr => 
      !expectedAttributes.includes(attr)
    );
    
    // Get valid purposes
    const validPurposes = ['PROFILE_IMAGE', 'ID_PROOF', 'OTHER', 'SUPPORTING_DOC'];
    
    res.status(200).json({
      success: true,
      message: 'Configuration test completed',
      data: {
        s3: s3Config,
        database: {
          fileTableExists: true,
          hasAllRequiredFields: hasAllAttributes,
          extraFields: extraAttributes,
          modelFields: fileAttributes,
          validPurposes: validPurposes
        }
      }
    });
  } catch (error: any) {
    console.error('Error testing configuration:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to test configuration'
    });
  }
});

/**
 * @swagger
 * /api/files/user/{userId}/{purpose}:
 *   get:
 *     tags: [Files]
 *     summary: Get user files by purpose
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: purpose
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PROFILE_IMAGE, ID_PROOF, OTHER, SUPPORTING_DOC]
 *     responses:
 *       200:
 *         description: Files retrieved successfully
 *       400:
 *         description: Invalid purpose
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user/:userId/:purpose', authenticateAdmin as RequestHandler, fileController.getUserFilesByPurpose);

/**
 * @swagger
 * /api/files/update-user-profile:
 *   post:
 *     tags: [Files]
 *     summary: Update user profile with uploaded file
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - fileId
 *               - fieldType
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               fileId:
 *                 type: string
 *                 format: uuid
 *               fieldType:
 *                 type: string
 *                 enum: [profile_image, id_proof]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: User or file not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/update-user-profile', authenticateAdmin as RequestHandler, fileController.updateUserProfile);

/**
 * @swagger
 * /api/files/{fileId}:
 *   get:
 *     tags: [Files]
 *     summary: Get file details by ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File details retrieved successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:fileId', authenticateAdmin as RequestHandler, fileController.getFileById);

/**
 * @swagger
 * /api/files/{fileId}:
 *   delete:
 *     tags: [Files]
 *     summary: Delete a file (mark as deleted)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:fileId', authenticateAdmin as RequestHandler, fileController.deleteFile);

/**
 * @swagger
 * /api/files/access/{fileId}:
 *   get:
 *     tags: [Files]
 *     summary: Get a signed URL for accessing a file
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the file to access
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           minimum: 60
 *           maximum: 86400
 *           default: 3600
 *         description: URL expiration time in seconds (default 1 hour, max 24 hours)
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                       format: uuid
 *                     filename:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *                     signedUrl:
 *                       type: string
 *                       description: Temporary signed URL for accessing the file
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/access/:fileId', authenticateAdmin as RequestHandler, fileController.getFileAccessUrl);

/**
 * @swagger
 * /api/files/user-access/{fileId}:
 *   get:
 *     tags: [Files]
 *     summary: Get a signed URL for accessing a file for regular users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the file to access
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           minimum: 60
 *           maximum: 86400
 *           default: 3600
 *         description: URL expiration time in seconds (default 1 hour, max 24 hours)
 *     responses:
 *       200:
 *         description: Signed URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                       format: uuid
 *                     filename:
 *                       type: string
 *                     mimeType:
 *                       type: string
 *                     signedUrl:
 *                       type: string
 *                       description: Temporary signed URL for accessing the file
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 *       500:
 *         description: Server error
 */
router.get('/user-access/:fileId', authenticateUser as RequestHandler, fileController.getUserFileAccessUrl);

export default router; 