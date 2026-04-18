import bcrypt from "bcryptjs";
import prisma from "./src/lib/prisma";

async function fixAdmin() {
  const email = "admin@bayraqlearn.com";
  const username = "admin_bayraqlearn";
  const newPassword = "Admin123!";

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword, role: "admin", is_active: true },
    create: {
      username,
      email,
      password: hashedPassword,
      role: "admin",
      is_active: true,
      is_verified: true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log("✅ Admin password updated successfully");
}

fixAdmin()
  .catch((e) => {
    console.error("❌ Error updating admin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });