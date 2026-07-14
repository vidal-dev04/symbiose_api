import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { ISO_ALPHA3_TO_ALPHA2 } from '../src/pays/iso-codes';

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const PAYS_DATA = [
  {
    code: 'MDG', nom: 'Madagascar',
    villes: ['Antananarivo', 'Toamasina', 'Mahajanga', 'Fianarantsoa', 'Toliara', 'Antsiranana'],
  },
  {
    code: 'NGA', nom: 'Nigeria',
    villes: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt', 'Benin City'],
  },
  {
    code: 'CIV', nom: "Côte d'Ivoire",
    villes: ['Abidjan', 'Yamoussoukro', 'Bouaké', 'Daloa', 'San-Pédro', 'Korhogo'],
  },
  {
    code: 'BFA', nom: 'Burkina Faso',
    villes: ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora', 'Ouahigouya'],
  },
  {
    code: 'MLI', nom: 'Mali',
    villes: ['Bamako', 'Mopti', 'Tombouctou', 'Ségou', 'Gao', 'Sikasso'],
  },
];

async function main() {
  const email = 'admin@symbiose.com';
  const motDePasse = 'Admin@2024!';

  let existing = await prisma.utilisateur.findUnique({ where: { email }, include: { administrateur: true } });
  if (!existing) {
    const hash = await bcrypt.hash(motDePasse, 12);
    existing = await prisma.utilisateur.create({
      data: { email, motDePasse: hash, role: 'SUPER_ADMIN', actif: true },
      include: { administrateur: true },
    });
    console.log('🎉 Super Admin créé !');
    console.log('   Email    :', email);
    console.log('   Mot de passe :', motDePasse);
  } else {
    console.log('✅ Super Admin existe déjà :', email);
  }

  if (!existing.administrateur) {
    await prisma.administrateur.create({ data: { utilisateurId: existing.id, nom: 'Admin', prenom: 'Super' } });
    console.log('   ✅ Profil administrateur créé.');
  }

  console.log('\n🌍 Seeding pays et villes...');
  for (const p of PAYS_DATA) {
    const pays = await prisma.pays.upsert({
      where: { code: p.code },
      update: { nom: p.nom },
      create: { code: p.code, nom: p.nom, drapeau: ISO_ALPHA3_TO_ALPHA2[p.code], actif: true },
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
