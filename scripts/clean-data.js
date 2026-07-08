const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.adminOrganisation.deleteMany();
  await prisma.membreOrganisation.deleteMany();
  console.log('1/6 AdminOrg + Membres OK');

  await prisma.tokenPaiement.deleteMany();
  await prisma.cotisation.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.decaissement.deleteMany();
  await prisma.don.deleteMany();
  await prisma.avoir.deleteMany();
  console.log('2/6 Paiements + finances OK');

  await prisma.evenement.deleteMany();
  await prisma.document.deleteMany();
  await prisma.documentOfficiel.deleteMany();
  await prisma.filiation.deleteMany();
  console.log('3/6 Événements + documents OK');

  await prisma.abonnement.deleteMany();
  console.log('4/6 Abonnements OK');

  await prisma.adherent.deleteMany();
  console.log('5/6 Adhérents OK');

  await prisma.organisation.deleteMany();
  console.log('6/6 Organisations OK');

  const r = await prisma.utilisateur.deleteMany({
    where: { role: { in: ['ADMIN_ORG', 'ADHERENT'] } }
  });
  console.log('Utilisateurs supprimés (ADMIN_ORG + ADHERENT):', r.count);
  console.log('\n✅ Données nettoyées. Super admin conservé.');
}

main()
  .catch(e => { console.error('❌ Erreur:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
