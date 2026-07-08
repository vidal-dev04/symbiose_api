import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.utilisateur.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Un compte avec cet email existe déjà');

    const hash = await bcrypt.hash(dto.motDePasse, 12);
    const user = await this.prisma.utilisateur.create({
      data: {
        email: dto.email,
        motDePasse: hash,
        role: dto.role ?? 'ADHERENT',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.utilisateur.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await bcrypt.compare(dto.motDePasse, user.motDePasse);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (!user.actif) throw new UnauthorizedException('Votre compte est inactif');

    // Pour les admins d'organisation : vérifier l'abonnement
    if (user.role === 'ADMIN_ORG') {
      const adminOrg = await this.prisma.adminOrganisation.findFirst({
        where: { utilisateurId: user.id },
        include: { organisation: { include: { abonnement: true } } },
      });

      const abonnement = adminOrg?.organisation?.abonnement;
      if (abonnement) {
        const now = new Date();
        // Auto-marquer comme EXPIRE si dateFin dépassée
        if (abonnement.dateFin < now && abonnement.statut !== 'EXPIRE' && abonnement.statut !== 'ANNULE') {
          await this.prisma.abonnement.update({
            where: { id: abonnement.id },
            data: { statut: 'EXPIRE' },
          });
          await this.prisma.organisation.update({
            where: { id: adminOrg!.organisationId },
            data: { statut: 'INACTIVE' },
          });
        }
        if (abonnement.dateFin < now || abonnement.statut === 'EXPIRE' || abonnement.statut === 'ANNULE') {
          throw new UnauthorizedException(
            `L'abonnement de votre organisation a expiré le ${abonnement.dateFin.toLocaleDateString('fr-FR')}. Veuillez contacter l'administrateur pour renouveler votre abonnement.`
          );
        }
      }
    }

    await this.prisma.utilisateur.update({
      where: { id: user.id },
      data: { derniereConnexion: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: { id: user.id, email: user.email, role: user.role }, ...tokens };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.utilisateur.findUnique({ where: { id: userId } });
    if (!user || !user.actif) throw new UnauthorizedException('Compte invalide');
    return this.generateTokens(user.id, user.email, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        actif: true,
        emailVerifie: true,
        createdAt: true,
        adminOrgs: { include: { organisation: { select: { id: true, nom: true, type: true, logoUrl: true, pays: { select: { id: true, nom: true, armoirieUrl: true } } } } } },
        adherent: {
        select: {
          id: true, nom: true, prenom: true, organisationId: true, statut: true, motifRefus: true,
          organisation: { select: { id: true, nom: true, logoUrl: true, pays: { select: { id: true, nom: true, armoirieUrl: true } } } },
          tokenPaiements: {
            where: { expireAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { token: true, montant: true, expireAt: true },
          },
        },
      },
      },
    });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '1d'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
