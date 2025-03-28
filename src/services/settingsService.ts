import Settings from "../models/Settings";

export const getSetting = async (key: string) => {
  const setting = await Settings.findOne({ where: { key } });
  return setting?.value;
};

export const getSettings = async () => {
  const settings = await Settings.findAll();
  return settings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, any>);
};

export const setSetting = async (key: string, value: any, description?: string, isSystem: boolean = false) => {
  const [setting] = await Settings.upsert({
    key,
    value,
    description,
    isSystem
  });
  return setting;
};

export const deleteSetting = async (key: string): Promise<boolean> => {
  const setting = await Settings.findOne({ where: { key } });
  if (!setting) return false;
  
  if (setting.isSystem) {
    throw new Error("Cannot delete system settings");
  }

  await setting.destroy();
  return true;
};

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    {
      key: "pointValue",
      value: 0.1, // 1 point = 0.1 grams of gold
      description: "Value of one point in gold grams",
      isSystem: true
    },
    {
      key: "minDepositAmount",
      value: 1000,
      description: "Minimum deposit amount in rupees",
      isSystem: true
    },
    {
      key: "maxWithdrawalAmount",
      value: 100000,
      description: "Maximum withdrawal amount in rupees",
      isSystem: true
    },
    {
      key: "maintenanceMode",
      value: false,
      description: "System maintenance mode flag",
      isSystem: true
    }
  ];

  for (const setting of defaultSettings) {
    await setSetting(setting.key, setting.value, setting.description, setting.isSystem);
  }
}; 