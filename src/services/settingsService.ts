import Settings from "../models/Settings";

export const getSetting = async (key: string) => {
  const setting = await Settings.findOne({ where: { key } });
  return setting?.value;
};

export const getSettings = async () => {
  const settings = await Settings.findAll();
  return settings;
};

export const setSetting = async (key: string, value: any) => {
  const [setting] = await Settings.upsert({
    key,
    value
  });
  return setting;
};

export const deleteSetting = async (key: string): Promise<boolean> => {
  const setting = await Settings.findOne({ where: { key } });
  if (!setting) return false;
  
  await setting.destroy();
  return true;
};

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    {
      key: "pointValue",
      value: 0.1 // 1 point = 0.1 grams of gold
    },
    {
      key: "minDepositAmount",
      value: 1000
    },
    {
      key: "maxWithdrawalAmount",
      value: 100000
    },
    {
      key: "maintenanceMode",
      value: false
    }
  ];

  for (const setting of defaultSettings) {
    await setSetting(setting.key, setting.value);
  }
}; 