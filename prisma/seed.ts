import "dotenv/config";
import prisma from "@/lib/prisma";

async function main() {
  await prisma.role.upsert({
    where: { roleName: "Administrador" },
    update: {},
    create: { roleName: "Administrador" },
  });

  await prisma.role.upsert({
    where: { roleName: "Vendedor" },
    update: {},
    create: { roleName: "Vendedor" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });