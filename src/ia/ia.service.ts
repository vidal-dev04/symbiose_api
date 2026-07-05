import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private client: Groq | null = null;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY', '');
    if (apiKey) {
      this.client = new Groq({ apiKey });
    } else {
      this.logger.warn('GROQ_API_KEY non configurée — analyse IA désactivée');
    }
  }

  async analyserDossierOrganisation(org: {
    nom: string;
    type: string;
    description?: string;
    secteurs?: string[];
    email: string;
    telephone: string;
    responsableNom: string;
    responsablePrenom: string;
    responsableFonction: string;
    pays?: string;
    ville?: string;
  }): Promise<{ rapport: string; score: number } | null> {
    if (!this.client) return null;

    const prompt = `Tu es un expert en analyse de dossiers d'inscription pour une plateforme de gestion d'organisations (ONG, mutuelles, associations) en Afrique de l'Ouest.

Analyse ce dossier d'inscription et fournis :
1. Un score de complétude et de qualité du dossier sur 100
2. Un rapport structuré en français avec : points forts, points faibles, et recommandations

Données du dossier :
- Nom : ${org.nom}
- Type : ${org.type}
- Description : ${org.description || 'Non renseignée'}
- Secteurs d'activité : ${org.secteurs?.join(', ') || 'Non renseignés'}
- Email : ${org.email}
- Téléphone : ${org.telephone}
- Responsable : ${org.responsablePrenom} ${org.responsableNom} (${org.responsableFonction})
- Pays : ${org.pays || 'Non renseigné'}
- Ville : ${org.ville || 'Non renseignée'}

Réponds UNIQUEMENT en JSON valide avec ce format :
{
  "score": <nombre entre 0 et 100>,
  "rapport": "<rapport en français, 3-5 phrases>"
}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content ?? '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Réponse IA invalide');

      const result = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, Number(result.score) || 0)),
        rapport: String(result.rapport || ''),
      };
    } catch (err) {
      this.logger.error('Erreur analyse IA', err);
      return null;
    }
  }
}
