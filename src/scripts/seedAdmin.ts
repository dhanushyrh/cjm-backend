import Admin from "../models/Admin";

export const seedAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne({ where: { email: "admin@example.com" } });

    if (!existingAdmin) {
      await Admin.create({
        name: "Super Admin",
        email: "admin@example.com",
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
