import { Op } from "sequelize";
import File from "../models/File";
import { deleteFile, getDailyTasksBucketName } from "./s3Service";

const RETENTION_DAYS = 30;

export const flushExpiredDailyTaskProofs = async () => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const files = await File.findAll({
    where: {
      purpose: "DAILY_TASK_PROOF",
      is_deleted: false,
      createdAt: { [Op.lt]: cutoff },
    },
    limit: 500,
  });

  let deleted = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const bucket = file.bucket || getDailyTasksBucketName();
      try {
        await deleteFile(file.path, bucket);
      } catch (s3Error) {
        console.error(`S3 delete failed for file ${file.id}:`, s3Error);
      }
      await file.update({ is_deleted: true });
      deleted += 1;
    } catch (error) {
      failed += 1;
      console.error(`Failed to flush daily task proof ${file.id}:`, error);
    }
  }

  return {
    scanned: files.length,
    deleted,
    failed,
    cutoff: cutoff.toISOString(),
  };
};
