const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

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
      create: { roleid: 2, rolename: 'Normal' },
    });
  }

  // 2. Seed dữ liệu bảng MemberShip (thử cả memberShip và membership)
  const membershipModel = prisma.memberShip || prisma.membership;

  if (membershipModel) {
    await membershipModel.upsert({
      where: { mid: 1 },
      update: {},
      create: { mid: 1, mname: 'Bronze', score: 10 },
    });
  } else {
    console.log('⚠️ Không tìm thấy model MemberShip trong Prisma Client');
  }

  if (prisma.user) {
    // Mã hóa mật khẩu 'admin123'
    const hashedPassword = await bcrypt.hash('123123', 10);

    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        fullname: 'Administrator',
        password: hashedPassword,
        roleid: 1, // Liên kết với Role 'Admin' (roleid = 1)
        mid: 1,    // Liên kết với MemberShip 'Bronze' (mid = 1)
      },
    });
    console.log('👤 Đã tạo tài khoản Admin mặc định thành công!');
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