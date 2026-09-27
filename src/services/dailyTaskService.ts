import { Op, WhereOptions } from "sequelize";
import sequelize from "../config/database";
import DailyTask from "../models/DailyTask";
import DailyTaskSubmission, {
  DailyTaskSubmissionStatus,
} from "../models/DailyTaskSubmission";
import User from "../models/User";
import UserScheme from "../models/UserScheme";
import File from "../models/File";
import { createTransaction } from "./transactionService";
import {
  getPagination,
  getPaginationData,
  PaginationResult,
} from "../utils/paginationHelper";

const IST_TZ = "Asia/Kolkata";

/** Calendar date YYYY-MM-DD in Asia/Kolkata */
export const getTodayInKolkata = (): string => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

export interface CreateDailyTaskInput {
  title?: string;
  message: string;
  task_date: string;
  expires_at: Date;
  is_active?: boolean;
  created_by?: string;
}

export const createDailyTask = async (input: CreateDailyTaskInput) => {
  return DailyTask.create({
    title: input.title || null,
    message: input.message,
    task_date: input.task_date,
    expires_at: input.expires_at,
    is_active: input.is_active !== undefined ? input.is_active : true,
    created_by: input.created_by || null,
    is_deleted: false,
  });
};

export const updateDailyTask = async (
  id: string,
  updates: Partial<CreateDailyTaskInput> & { is_active?: boolean }
) => {
  const task = await DailyTask.findOne({ where: { id, is_deleted: false } });
  if (!task) return null;

  await task.update({
    ...(updates.title !== undefined ? { title: updates.title || null } : {}),
    ...(updates.message !== undefined ? { message: updates.message } : {}),
    ...(updates.task_date !== undefined ? { task_date: updates.task_date } : {}),
    ...(updates.expires_at !== undefined ? { expires_at: updates.expires_at } : {}),
    ...(updates.is_active !== undefined ? { is_active: updates.is_active } : {}),
  });
  return task;
};

export const softDeleteDailyTask = async (id: string): Promise<boolean> => {
  const task = await DailyTask.findOne({ where: { id, is_deleted: false } });
  if (!task) return false;
  await task.update({ is_deleted: true, is_active: false });
  return true;
};

export const listDailyTasks = async (
  page = 1,
  limit = 10,
  isActive?: boolean
): Promise<PaginationResult<DailyTask>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  const where: WhereOptions = { is_deleted: false };
  if (isActive !== undefined) {
    where.is_active = isActive;
  }

  const { count, rows } = await DailyTask.findAndCountAll({
    where,
    order: [
      ["task_date", "DESC"],
      ["created_at", "DESC"],
    ],
    offset,
    limit: limitValue,
  });

  return getPaginationData(rows, count, page, limit);
};

export const getTodayTasksForUser = async (userId: string) => {
  const today = getTodayInKolkata();
  const tasks = await DailyTask.findAll({
    where: {
      task_date: today,
      is_active: true,
      is_deleted: false,
    },
    order: [["expires_at", "ASC"]],
  });

  const taskIds = tasks.map((t) => t.id);
  const submissions =
    taskIds.length === 0
      ? []
      : await DailyTaskSubmission.findAll({
          where: {
            user_id: userId,
            task_id: { [Op.in]: taskIds },
            status: { [Op.in]: ["PENDING", "APPROVED", "REJECTED"] },
          },
          order: [["created_at", "DESC"]],
        });

  const latestByTask = new Map<string, DailyTaskSubmission>();
  for (const sub of submissions) {
    if (!latestByTask.has(sub.task_id)) {
      latestByTask.set(sub.task_id, sub);
    }
  }

  return tasks.map((task) => {
    const plain = task.get({ plain: true }) as any;
    const submission = latestByTask.get(task.id);
    return {
      ...plain,
      submission: submission
        ? {
            id: submission.id,
            status: submission.status,
            message: submission.message,
            admin_remarks: submission.admin_remarks,
            points_awarded: submission.points_awarded,
            image_file_id: submission.image_file_id,
            created_at: submission.created_at,
          }
        : null,
      can_submit:
        new Date(task.expires_at) > new Date() &&
        (!submission || submission.status === "REJECTED"),
    };
  });
};

export const submitDailyTask = async (
  taskId: string,
  userId: string,
  imageFileId: string,
  message?: string
) => {
  const task = await DailyTask.findOne({
    where: { id: taskId, is_active: true, is_deleted: false },
  });
  if (!task) {
    throw Object.assign(new Error("Task not found"), { status: 404 });
  }

  const today = getTodayInKolkata();
  if (task.task_date !== today) {
    throw Object.assign(new Error("You can only submit today's tasks"), {
      status: 400,
    });
  }

  if (new Date(task.expires_at) <= new Date()) {
    throw Object.assign(new Error("This task has expired"), { status: 400 });
  }

  const file = await File.findOne({
    where: {
      id: imageFileId,
      userId,
      purpose: "DAILY_TASK_PROOF",
      is_deleted: false,
    },
  });
  if (!file) {
    throw Object.assign(new Error("Invalid proof image"), { status: 400 });
  }

  const blocking = await DailyTaskSubmission.findOne({
    where: {
      task_id: taskId,
      user_id: userId,
      status: { [Op.in]: ["PENDING", "APPROVED"] },
    },
  });
  if (blocking) {
    throw Object.assign(
      new Error(
        blocking.status === "APPROVED"
          ? "You already completed this task"
          : "You already have a pending submission"
      ),
      { status: 400 }
    );
  }

  return DailyTaskSubmission.create({
    task_id: taskId,
    user_id: userId,
    image_file_id: imageFileId,
    message: message || null,
    status: "PENDING",
  });
};

export const getMySubmissions = async (
  userId: string,
  page = 1,
  limit = 20
): Promise<PaginationResult<any>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  const { count, rows } = await DailyTaskSubmission.findAndCountAll({
    where: { user_id: userId },
    include: [
      {
        model: DailyTask,
        as: "task",
        attributes: ["id", "title", "message", "task_date", "expires_at"],
      },
      {
        model: File,
        as: "imageFile",
        attributes: ["id", "is_deleted", "mimeType"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    offset,
    limit: limitValue,
  });

  const data = rows.map((row) => {
    const plain = row.get({ plain: true }) as any;
    const imagePurged = !plain.imageFile || plain.imageFile.is_deleted;
    return {
      ...plain,
      status_label:
        plain.status === "APPROVED"
          ? "Credited"
          : plain.status === "REJECTED"
            ? "Rejected"
            : "Pending",
      image_available: !imagePurged,
    };
  });

  return getPaginationData(data, count, page, limit);
};

export const listSubmissionsAdmin = async (
  page = 1,
  limit = 10,
  status?: DailyTaskSubmissionStatus,
  search?: string
): Promise<PaginationResult<any>> => {
  const { offset, limit: limitValue } = getPagination(page, limit);
  const where: WhereOptions = {};
  if (status) where.status = status;

  const userWhere: WhereOptions = {};
  if (search) {
    userWhere[Op.or as any] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await DailyTaskSubmission.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: !!search,
      },
      {
        model: DailyTask,
        as: "task",
        attributes: ["id", "title", "message", "task_date", "expires_at"],
      },
      {
        model: File,
        as: "imageFile",
        attributes: ["id", "is_deleted", "mimeType", "originalName"],
        required: false,
      },
    ],
    order: [["created_at", "DESC"]],
    offset,
    limit: limitValue,
  });

  return getPaginationData(rows, count, page, limit);
};

export const reviewSubmission = async (
  submissionId: string,
  status: "APPROVED" | "REJECTED",
  adminId: string,
  adminRemarks?: string
) => {
  if (status === "REJECTED" && !adminRemarks?.trim()) {
    throw Object.assign(new Error("Remarks are required when rejecting"), {
      status: 400,
    });
  }

  const t = await sequelize.transaction();
  try {
    const submission = await DailyTaskSubmission.findByPk(submissionId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!submission) {
      throw Object.assign(new Error("Submission not found"), { status: 404 });
    }
    if (submission.status !== "PENDING") {
      throw Object.assign(new Error("Submission already reviewed"), {
        status: 400,
      });
    }

    if (status === "REJECTED") {
      await submission.update(
        {
          status: "REJECTED",
          admin_remarks: adminRemarks!.trim(),
          reviewed_by: adminId,
          reviewed_at: new Date(),
        },
        { transaction: t }
      );
      await t.commit();
      return submission;
    }

    const userScheme = await UserScheme.findOne({
      where: { userId: submission.user_id, status: "ACTIVE" },
      order: [["createdAt", "ASC"]],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!userScheme) {
      throw Object.assign(
        new Error("User has no active scheme to credit points"),
        { status: 400 }
      );
    }

    const task = await DailyTask.findByPk(submission.task_id, {
      transaction: t,
    });
    const label = task?.title || task?.message?.slice(0, 40) || submission.task_id;

    await createTransaction({
      userSchemeId: userScheme.id,
      transactionType: "points",
      amount: 0,
      goldGrams: 0,
      points: 2,
      description: `Daily task completed: ${label}`,
      transaction: t,
    });

    await userScheme.update(
      {
        totalPoints: userScheme.totalPoints + 2,
        availablePoints: userScheme.availablePoints + 2,
      },
      { transaction: t }
    );

    await submission.update(
      {
        status: "APPROVED",
        admin_remarks: adminRemarks?.trim() || null,
        reviewed_by: adminId,
        reviewed_at: new Date(),
        points_awarded: 2,
        user_scheme_id: userScheme.id,
      },
      { transaction: t }
    );

    await t.commit();
    return submission;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
