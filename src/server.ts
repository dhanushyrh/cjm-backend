import app from "./app";
import sequelize from "./config/database";
import { ensureRbacSchema } from "./utils/ensureRbacSchema";
import { initializeDefaultSettings } from "./services/settingsService";

const PORT = process.env.PORT || 5000;

sequelize
  .sync({ force: false })
  .then(async () => {
    await ensureRbacSchema();
    await initializeDefaultSettings();
    console.log("Database synced");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
    process.exit(1);
  });
