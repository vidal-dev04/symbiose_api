import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@symbiose.com';
  const motDePasse = 'Admin@2024!';

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Super Admin existe déjà :', email);
    return;
  }

  const hash = await bcrypt.hash(motDePasse, 12);
  await prisma.utilisateur.create({
    data: { email, motDePasse: hash, role: 'SUPER_ADMIN', actif: true },
  });

  console.log('🎉 Super Admin créé !');
  console.log('   Email    :', email);
  console.log('   Mot de passe :', motDePasse);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
