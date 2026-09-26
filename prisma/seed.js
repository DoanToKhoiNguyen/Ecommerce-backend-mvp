const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Seed dữ liệu bảng Role
  if (prisma.role) {
    await prisma.role.upsert({
      where: { roleid: 1 },
      update: {},
      create: { roleid: 1, rolename: 'Admin' },
    });

    await prisma.role.upsert({
      where: { roleid: 2 },
      update: {},
      create: { roleid: 2, rolename: 'Customer' },
    });
  }

  // 2. Seed dữ liệu bảng MemberShip (thử cả memberShip và membership)
  const membershipModel = prisma.memberShip || prisma.membership;
  
  if (membershipModel) {
    await membershipModel.upsert({
      where: { mid: 1 },
      update: {},
      create: { mid: 1, mname: 'Bronze', score: 0 },
    });
  } else {
    console.log('⚠️ Không tìm thấy model MemberShip trong Prisma Client');
  }

  console.log('🌱 Seed dữ liệu Role & MemberShip thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });