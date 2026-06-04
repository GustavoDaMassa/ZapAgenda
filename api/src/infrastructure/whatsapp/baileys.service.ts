import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

type WASocket = ReturnType<typeof makeWASocket>;

@Injectable()
export class BaileysService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BaileysService.name);
  private socket: WASocket | null = null;
  private messageHandler: ((jid: string, text: string, audioBase64?: string) => Promise<void>) | null = null;

  constructor(private readonly config: ConfigService) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.connect();
  }

  setMessageHandler(handler: (jid: string, text: string, audioBase64?: string) => Promise<void>): void {
    this.messageHandler = handler;
  }

  async sendText(jid: string, text: string): Promise<void> {
    if (!this.socket) throw new Error('WhatsApp not connected');
    await this.socket.sendMessage(jid, { text });
  }

  private async connect(): Promise<void> {
    const authDir = this.config.get<string>('whatsapp.authDir') ?? './baileys-auth';
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    this.socket = makeWASocket({ auth: state, printQRInTerminal: false });

    this.socket.ev.on('creds.update', saveCreds);

    this.socket.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        const encoded = encodeURIComponent(qr);
        this.logger.log('════════════════════════════════════════');
        this.logger.log('WHATSAPP QR — abra o link abaixo para escanear:');
        this.logger.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}`);
        this.logger.log('════════════════════════════════════════');
      }
      if (connection === 'open') this.logger.log('✓ WhatsApp conectado com sucesso!');
      if (connection === 'close') {
        const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = code !== DisconnectReason.loggedOut;
        this.logger.warn(`WhatsApp desconectado (code ${code}), reconectando=${shouldReconnect}`);
        if (shouldReconnect) this.connect();
      }
    });

    this.socket.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue;
        const jid = msg.key.remoteJid!;
        const text = msg.message.conversation ?? msg.message.extendedTextMessage?.text ?? '';
        const audioBase64 = msg.message.audioMessage
          ? Buffer.from(await this.downloadAudio(msg)).toString('base64')
          : undefined;
        if (this.messageHandler) {
          await this.messageHandler(jid, text, audioBase64).catch((e) =>
            this.logger.error(`Handler error: ${e.message}`),
          );
        }
      }
    });
  }

  private async downloadAudio(msg: any): Promise<Buffer> {
    const { downloadMediaMessage } = await import('@whiskeysockets/baileys');
    return downloadMediaMessage(msg, 'buffer', {}) as Promise<Buffer>;
  }
}
