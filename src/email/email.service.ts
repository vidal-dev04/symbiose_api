import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private frontendUrl: string;
  private gmailUser: string;
  private gmailPass: string;
  private transporter: nodemailer.Transporter | null = null;

  private readonly logoSvg = `<table cellpadding="0" cellspacing="0" style="display:inline-table;vertical-align:middle;margin-right:10px;"><tr><td style="width:48px;height:48px;background-color:#F05A22;border-radius:24px;text-align:center;vertical-align:middle;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;line-height:48px;">SP</td></tr></table>`;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('BREVO_API_KEY', '');
    this.senderEmail = this.config.get('BREVO_SENDER_EMAIL', 'noreply@symbiosepays.com');
    this.senderName = this.config.get('BREVO_SENDER_NAME', 'Symbiose Pays');
    this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:4200');
    this.gmailUser = this.config.get('EMAIL_USER', '');
    this.gmailPass = this.config.get('EMAIL_PASS', '');

    if (this.gmailUser && this.gmailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: this.gmailUser, pass: this.gmailPass },
      });
    }
  }

  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    if (!to || !to.trim()) {
      this.logger.warn(`[Email] Destinataire vide, email ignoré: ${subject}`);
      return false;
    }

    // Priorité 1 : Gmail (Nodemailer)
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"${this.senderName}" <${this.gmailUser}>`,
          to,
          subject,
          html: htmlContent,
        });
        this.logger.log(`[Gmail] Email envoyé à ${to}: ${subject}`);
        return true;
      } catch (err) {
        this.logger.error(`[Gmail] Erreur envoi email`, err);
        return false;
      }
    }

    // Priorité 2 : Brevo
    if (this.apiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: this.senderName, email: this.senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          this.logger.error(`[Brevo] Erreur envoi email: ${error}`);
          return false;
        }

        this.logger.log(`[Brevo] Email envoyé à ${to}: ${subject}`);
        return true;
      } catch (err) {
        this.logger.error(`[Brevo] Erreur envoi email`, err);
        return false;
      }
    }

    // Priorité 3 : Mock (aucun provider configuré)
    this.logger.warn(`[MOCK] Email to ${to}: ${subject}`);
    this.logger.debug(htmlContent);
    return true;
  }

  async sendLienPaiement(email: string, token: string, montant: number, periode: string) {
    const lien = `${this.frontendUrl}/paiement?token=${token}`;
    return this.sendEmail(email, 'Lien de paiement – Symbiose Pays', `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Pour activer votre compte, veuillez procéder au paiement de <strong>${montant.toLocaleString('fr-FR')} FCFA</strong> (${periode}).</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${lien}" style="background:#F05A22;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">Payer maintenant</a>
        </p>
        <p style="font-size:0.85rem;color:#888;">Ce lien est valable 7 jours. Passé ce délai, vous devrez en demander un nouveau.</p>
      </div>
    `);
  }

  async sendCompteCreeSansPaiement(email: string, token: string, joursEssai: number) {
    const lien = `${this.frontendUrl}/paiement?token=${token}`;
    return this.sendEmail(email, 'Compte créé – Paiement en attente', `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre compte a été créé avec succès ! Cependant, il ne sera <strong>actif que pendant ${joursEssai} jours</strong> tant que le paiement n'est pas effectué.</p>
        <p>Vous pouvez payer à tout moment via le lien ci-dessous :</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${lien}" style="background:#F05A22;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">Payer maintenant</a>
        </p>
        <p style="font-size:0.85rem;color:#888;">Passé les ${joursEssai} jours, vos accès seront suspendus et votre compte deviendra inactif.</p>
      </div>
    `);
  }

  async sendPaiementConfirme(email: string, montant: number, periode: string, dateFin: string) {
    return this.sendEmail(email, 'Paiement confirmé – Symbiose Pays', `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre paiement de <strong>${montant.toLocaleString('fr-FR')} FCFA</strong> (${periode}) a bien été confirmé.</p>
        <p>Votre compte est maintenant <strong>actif jusqu'au ${dateFin}</strong>.</p>
        <p>Vous pouvez vous connecter dès maintenant :</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${this.frontendUrl}/login" style="background:#F05A22;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">Se connecter</a>
        </p>
      </div>
    `);
  }

  async sendDemandeAdhesionAdherent(email: string, orgNom: string) {
    return this.sendEmail(email, `Demande d'adhésion reçue – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre demande d'adhésion à l'organisation <strong>${orgNom}</strong> a bien été enregistrée.</p>
        <p>L'administrateur va vérifier vos informations. Si votre dossier est validé, vous recevrez un lien de paiement pour adhérer officiellement.</p>
      </div>
    `);
  }

  async sendInscriptionOrganisation(email: string, orgNom: string) {
    return this.sendEmail(email, `Dossier reçu – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre demande d'inscription pour l'organisation <strong>${orgNom}</strong> a bien été reçue sur la plateforme Symbiose Pays.</p>
        <div style="background:#fff8e1;border-left:4px solid #F05A22;border-radius:4px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#e65100;font-weight:600;">Dossier en cours d'examen</p>
          <p style="margin:8px 0 0;color:#333;font-size:0.9rem;">Notre équipe va vérifier les informations soumises. Vous recevrez un email de confirmation avec vos accès dès que votre dossier sera validé.</p>
        </div>
        <p style="font-size:0.85rem;color:#888;">Ce processus prend généralement moins de 48h ouvrables.</p>
      </div>
    `);
  }

  async sendOrganisationValidee(email: string, orgNom: string, motDePasse: string, token: string, montant: number) {
    const lien = `${this.frontendUrl}/paiement?token=${token}`;
    return this.sendEmail(email, `Organisation validée – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre organisation <strong>${orgNom}</strong> a été <strong style="color:#2e7d32;">validée</strong> sur la plateforme Symbiose Pays !</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;"><strong>Email :</strong> ${email}</p>
          <p style="margin:4px 0;"><strong>Mot de passe :</strong> <code style="background:#e0e0e0;padding:2px 6px;border-radius:4px;">${motDePasse}</code></p>
        </div>
        <p>Pour activer votre compte, veuillez procéder au paiement de <strong>${montant.toLocaleString('fr-FR')} FCFA / mois</strong> :</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${lien}" style="background:#F05A22;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">Payer et activer mon compte</a>
        </p>
        <p style="font-size:0.85rem;color:#888;">Ce lien est valable 7 jours. Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
      </div>
    `);
  }

  async sendOrganisationRefusee(email: string, orgNom: string, motif: string) {
    return this.sendEmail(email, `Demande refusée – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Nous avons le regret de vous informer que la demande d'inscription de <strong>${orgNom}</strong> a été <strong style="color:#c62828;">refusée</strong>.</p>
        <div style="background:#fff3f3;border-left:4px solid #c62828;border-radius:4px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#c62828;font-weight:600;">Motif du refus :</p>
          <p style="margin:8px 0 0;color:#333;">${motif}</p>
        </div>
        <p>Pour toute question, contactez notre équipe support.</p>
      </div>
    `);
  }

  async sendInscriptionAdherent(email: string, orgNom: string, motDePasse: string) {
    return this.sendEmail(email, `Demande d'adhésion enregistrée – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre demande d'adhésion à <strong>${orgNom}</strong> a bien été enregistrée.</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;"><strong>Email :</strong> ${email}</p>
          <p style="margin:4px 0;"><strong>Mot de passe :</strong> <code style="background:#e0e0e0;padding:2px 6px;border-radius:4px;">${motDePasse}</code></p>
        </div>
        <p>L'administrateur de l'organisation va vérifier votre dossier. Si vos informations sont validées, vous recevrez un lien de paiement pour finaliser votre adhésion.</p>
        <p style="font-size:0.85rem;color:#888;">Nous vous recommandons de changer votre mot de passe après votre première connexion.</p>
      </div>
    `);
  }

  async sendAdhesionRefusee(email: string, orgNom: string, motif: string) {
    return this.sendEmail(email, `Demande d'adhésion refusée – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Nous avons le regret de vous informer que votre demande d'adhésion à <strong>${orgNom}</strong> a été <strong>refusée</strong>.</p>
        <div style="background:#fff3f3;border-left:4px solid #c62828;border-radius:4px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#c62828;font-weight:600;">Motif du refus :</p>
          <p style="margin:8px 0 0;color:#333;">${motif}</p>
        </div>
        <p>Pour toute question, contactez directement l'administrateur de l'organisation.</p>
      </div>
    `);
  }

  async sendCustomEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    return this.sendEmail(to, subject, htmlContent);
  }

  async sendAdhesionValidee(email: string, orgNom: string, token: string, montant: number) {
    const lien = `${this.frontendUrl}/paiement?token=${token}`;
    return this.sendEmail(email, `Adhésion validée – ${orgNom}`, `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">${this.logoSvg}<span style="font-size:20px;font-weight:bold;color:#F05A22;">Symbiose Pays</span></div>
        <p>Bonjour,</p>
        <p>Votre demande d'adhésion à <strong>${orgNom}</strong> a été <strong>validée</strong> !</p>
        <p>Pour finaliser votre adhésion, veuillez procéder au paiement de <strong>${montant.toLocaleString('fr-FR')} FCFA</strong> :</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${lien}" style="background:#F05A22;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">Payer et adhérer</a>
        </p>
      </div>
    `);
  }
}
