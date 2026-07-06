import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PAYS_DATA = [
  {
    code: 'MG', nom: 'Madagascar',
    villes: ['Antananarivo', 'Toamasina', 'Mahajanga', 'Fianarantsoa', 'Toliara', 'Antsiranana'],
  },
  {
    code: 'NG', nom: 'Nigeria',
    villes: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City'],
  },
  {
    code: 'CI', nom: "Côte d'Ivoire",
    villes: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo'],
  },
  {
    code: 'BF', nom: 'Burkina Faso',
    villes: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya'],
  },
  {
    code: 'ML', nom: 'Mali',
    villes: ['Bamako', 'Mopti', 'Tombouctou', 'Ségou', 'Gao', 'Sikasso'],
  },
];

async function main() {
  const email = 'admin@symbiose.com';
  const motDePasse = 'Admin@2024!';

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (!existing) {
    const hash = await bcrypt.hash(motDePasse, 12);
    await prisma.utilisateur.create({
      data: { email, motDePasse: hash, role: 'SUPER_ADMIN', actif: true },
    });
    console.log('🎉 Super Admin créé !');
    console.log('   Email    :', email);
    console.log('   Mot de passe :', motDePasse);
  } else {
    console.log('✅ Super Admin existe déjà :', email);
  }

  console.log('\n🌍 Seeding pays et villes...');
  for (const p of PAYS_DATA) {
    const pays = await prisma.pays.upsert({
      where: { code: p.code },
      update: { nom: p.nom },
      create: { code: p.code, nom: p.nom, actif: true },
    });

    for (const nomVille of p.villes) {
      const exists = await prisma.ville.findFirst({ where: { nom: nomVille, paysId: pays.id } });
      if (!exists) {
        await prisma.ville.create({ data: { nom: nomVille, paysId: pays.id } });
      }
    }
    console.log(`  ✅ ${p.nom} (${p.villes.length} villes)`);
  }
  console.log('\n✨ Seed terminé !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
