import Admin from "../models/Admin";

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@hiranya.com";
    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      await Admin.create({
        name: "Super Admin",
        email: adminEmail,
        password: "admin123", // Will be hashed automatically
      });
      console.log("✅ Admin user created!");
    } else {
      console.log("✅ Admin user already exists.");
    }
  } catch (error: any) {
    console.error("❌ Error seeding admin:", error);
  }
};

seedAdmin();
