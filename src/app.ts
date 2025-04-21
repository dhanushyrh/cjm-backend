import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import sequelize from "./config/database";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRedemptionRoutes from "./routes/adminRedemptionRoutes";
import adminTransactionRoutes from "./routes/adminTransactionRoutes";
import oas from "express-oas-generator";
import goldPriceRoutes from "./routes/goldPriceRoutes";
import pointRedemptionRoutes from "./routes/pointRedemptionRoutes";
import userSchemeRoutes from "./routes/userSchemeRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import fileRoutes from "./routes/fileRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import referralRoutes from "./routes/referralRoutes";
import circularRoutes from "./routes/circularRoutes";
import { startPointsRecalculationScheduler } from "./schedulers/pointsRecalculationScheduler";
import { startGoldAccrualScheduler } from "./schedulers/goldAccrualScheduler";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { stream as winstonStream } from './config/winston';

dotenv.config();
const app = express();
oas.init(app as any, {});

// Set up Morgan logger with Winston stream
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: winstonStream }));

// Configure CORS
const corsOptions = {
  origin: [
    '*'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/redemption", adminRedemptionRoutes);
app.use("/api/admin", adminTransactionRoutes);
app.use("/api/gold-prices", goldPriceRoutes);
app.use("/api/points", pointRedemptionRoutes);
app.use("/api/user-schemes", userSchemeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/circulars", circularRoutes);

// Swagger documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send("Database connected successfully!");
  } catch (error) {
    res.status(500).send("Database connection failed");
  }
});

// Start schedulers
startPointsRecalculationScheduler();
startGoldAccrualScheduler().catch(err => console.error("Failed to start gold accrual scheduler:", err));

export default app;
