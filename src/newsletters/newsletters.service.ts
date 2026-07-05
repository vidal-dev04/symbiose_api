import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class NewslettersService {
  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async create(data: { organisationId: string; titre: string; contenu: string }) {
    return this.prisma.newsletter.create({ data });
  }

  async findAll(organisationId: string) {
    return this.prisma.newsletter.findMany({
      where: { organisationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const n = await this.prisma.newsletter.findUnique({ where: { id } });
    if (!n) throw new NotFoundException('Newsletter introuvable');
    return n;
  }

  async update(id: string, data: { titre?: string; contenu?: string }) {
    return this.prisma.newsletter.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.newsletter.delete({ where: { id } });
  }

  async envoyer(id: string) {
    const newsletter = await this.findOne(id);

    const adherents = await this.prisma.adherent.findMany({
      where: { organisationId: newsletter.organisationId, statut: 'ACTIF' },
      include: { utilisateur: { select: { email: true } } },
    });

    const org = await this.prisma.organisation.findUnique({
      where: { id: newsletter.organisationId },
      select: { nom: true },
    });

    let envoyes = 0;
    for (const a of adherents) {
      try {
        await this.email.sendCustomEmail(
          a.utilisateur.email,
          `${newsletter.titre} – ${org?.nom ?? 'Symbiose Pays'}`,
          `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <div style="margin-bottom:16px;font-size:20px;font-weight:bold;color:#F05A22;">${org?.nom ?? 'Symbiose Pays'}</div>
            <h2 style="color:#333;">${newsletter.titre}</h2>
            <div style="font-size:15px;line-height:1.7;color:#444;">${newsletter.contenu.replace(/\n/g, '<br>')}</div>
            <hr style="margin:24px 0;border:none;border-top:1px solid #eee;"/>
            <p style="font-size:12px;color:#aaa;">Vous recevez cet email en tant que membre de ${org?.nom}.</p>
          </div>`,
        );
        envoyes++;
      } catch (_) { /* continue */ }
    }

    await this.prisma.newsletter.update({
      where: { id },
      data: { envoye: true, dateEnvoi: new Date(), envoyeA: envoyes },
    });

    return { success: true, envoyes, total: adherents.length };
  }
}
