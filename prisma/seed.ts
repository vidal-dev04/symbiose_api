import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Pays
  const ci = await prisma.pays.upsert({
    where: { code: 'CI' },
    update: {},
    create: { code: 'CI', nom: 'Côte d\'Ivoire', drapeau: '🇨🇮' },
  });

  const ml = await prisma.pays.upsert({
    where: { code: 'ML' },
    update: {},
    create: { code: 'ML', nom: 'Mali', drapeau: '🇲🇱' },
  });

  const sn = await prisma.pays.upsert({
    where: { code: 'SN' },
    update: {},
    create: { code: 'SN', nom: 'Sénégal', drapeau: '🇸🇳' },
  });

  const bf = await prisma.pays.upsert({
    where: { code: 'BF' },
    update: {},
    create: { code: 'BF', nom: 'Burkina Faso', drapeau: '🇧🇫' },
  });

  const tg = await prisma.pays.upsert({
    where: { code: 'TG' },
    update: {},
    create: { code: 'TG', nom: 'Togo', drapeau: '🇹🇬' },
  });

  const bj = await prisma.pays.upsert({
    where: { code: 'BJ' },
    update: {},
    create: { code: 'BJ', nom: 'Bénin', drapeau: '🇧🇯' },
  });

  // Villes
  const villes = [
    { nom: 'Abidjan', paysId: ci.id },
    { nom: 'Yamoussoukro', paysId: ci.id },
    { nom: 'Bouaké', paysId: ci.id },
    { nom: 'Bamako', paysId: ml.id },
    { nom: 'Sikasso', paysId: ml.id },
    { nom: 'Dakar', paysId: sn.id },
    { nom: 'Thiès', paysId: sn.id },
    { nom: 'Ouagadougou', paysId: bf.id },
    { nom: 'Bobo-Dioulasso', paysId: bf.id },
    { nom: 'Lomé', paysId: tg.id },
    { nom: 'Cotonou', paysId: bj.id },
  ];

  for (const v of villes) {
    await prisma.ville.upsert({
      where: { nom_paysId: { nom: v.nom, paysId: v.paysId } },
      update: {},
      create: v,
    });
  }

  // Super Admin
  const hash = await bcrypt.hash('admin123', 12);
  await prisma.utilisateur.upsert({
    where: { email: 'admin@symbiosepays.com' },
    update: {},
    create: {
      email: 'admin@symbiosepays.com',
      motDePasse: hash,
      role: 'SUPER_ADMIN',
      actif: true,
      emailVerifie: true,
    },
  });

  console.log('✅ Seed terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
