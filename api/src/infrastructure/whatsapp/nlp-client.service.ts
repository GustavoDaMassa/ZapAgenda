import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface NlpRequest {
  jid: string;
  text: string | null;
  audio_base64: string | null;
  history: Array<{ role: string; content: string }>;
}

export interface NlpEntities {
  title?: string | null;
  date?: string | null;
  time?: string | null;
  category?: string | null;
  recurrence?: string | null;
}

export interface NlpResponse {
  intent: string;
  entities: NlpEntities;
  reply_text: string;
  needs_confirmation: boolean;
  session_state: string;
}

@Injectable()
export class NlpClientService {
  private readonly logger = new Logger(NlpClientService.name);

  constructor(private readonly config: ConfigService) {}

  async process(request: NlpRequest): Promise<NlpResponse> {
    const url = `${this.config.get<string>('nlp.url') ?? 'http://nlp:8000'}/process`;
    try {
      const { data } = await axios.post<NlpResponse>(url, request);
      return data;
    } catch (err: any) {
      this.logger.error(`NLP service error: ${err.message}`);
      return {
        intent: 'unknown',
        entities: {},
        reply_text: 'Não entendi. Pode reformular?',
        needs_confirmation: false,
        session_state: 'idle',
      };
    }
  }
}
