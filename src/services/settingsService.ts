import Settings from "../models/Settings";

export const CONTACT_SETTING_KEYS = [
  "contact_address",
  "contact_phone",
  "contact_email",
  "contact_terms_url",
  "contact_privacy_url",
] as const;

export const getSetting = async (key: string) => {
  const setting = await Settings.findOne({ where: { key, is_deleted: false } });
  return setting?.value;
};

export const getSettings = async () => {
  const settings = await Settings.findAll({ where: { is_deleted: false } });
  return settings;
};

export const setSetting = async (key: string, value: any) => {
  const stringValue =
    typeof value === "string" ? value : JSON.stringify(value);
  const [setting] = await Settings.upsert({
    key,
    value: stringValue,
    is_deleted: false,
  });
  return setting;
};

export const ensureSetting = async (key: string, value: string) => {
  const existing = await Settings.findOne({ where: { key } });
  if (!existing) {
    return setSetting(key, value);
  }
  return existing;
};

export const deleteSetting = async (key: string): Promise<boolean> => {
  const setting = await Settings.findOne({ where: { key } });
  if (!setting) return false;

  await setting.destroy();
  return true;
};

export const getContactInfo = async () => {
  const [address, phone, email, termsUrl, privacyUrl] = await Promise.all([
    getSetting("contact_address"),
    getSetting("contact_phone"),
    getSetting("contact_email"),
    getSetting("contact_terms_url"),
    getSetting("contact_privacy_url"),
  ]);

  return {
    address: address || "",
    phone: phone || "",
    email: email || "",
    termsUrl: termsUrl || "",
    privacyUrl: privacyUrl || "",
  };
};

export const upsertContactInfo = async (payload: {
  address?: string;
  phone?: string;
  email?: string;
  termsUrl?: string;
  privacyUrl?: string;
}) => {
  if (payload.address !== undefined) {
    await setSetting("contact_address", payload.address.trim());
  }
  if (payload.phone !== undefined) {
    await setSetting("contact_phone", payload.phone.trim());
  }
  if (payload.email !== undefined) {
    await setSetting("contact_email", payload.email.trim());
  }
  if (payload.termsUrl !== undefined) {
    await setSetting("contact_terms_url", payload.termsUrl.trim());
  }
  if (payload.privacyUrl !== undefined) {
    await setSetting("contact_privacy_url", payload.privacyUrl.trim());
  }
  return getContactInfo();
};

export const ensureContactSettings = async () => {
  await ensureSetting("contact_address", "");
  await ensureSetting("contact_phone", "");
  await ensureSetting("contact_email", "");
  await ensureSetting("contact_terms_url", "");
  await ensureSetting("contact_privacy_url", "");
};

// Initialize default settings
export const initializeDefaultSettings = async () => {
  const defaultSettings = [
    {
      key: "pointValue",
      value: "0.1",
    },
    {
      key: "minDepositAmount",
      value: "1000",
    },
    {
      key: "maxWithdrawalAmount",
      value: "100000",
    },
    {
      key: "maintenanceMode",
      value: "false",
    },
  ];

  for (const setting of defaultSettings) {
    await ensureSetting(setting.key, setting.value);
  }
  await ensureContactSettings();
};
