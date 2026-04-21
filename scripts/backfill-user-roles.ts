import "dotenv/config";
import prisma from "../src/lib/prisma";

async function main() {
  const defaultRole = await prisma.role.findUnique({
    where: { roleName: "Administrador" },
  });

  if (!defaultRole) {
    throw new Error('No existe el rol "Administrador". Ejecuta primero el seed.');
  }

  const result = await prisma.user.updateMany({
    where: {
      roleId: null,
    },
    data: {
      roleId: defaultRole.roleId,
    },
  });

  console.log(`Usuarios actualizados con rol por defecto: ${result.count}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Error haciendo backfill de roles:", error);
    await prisma.$disconnect();
    process.exit(1);
  });