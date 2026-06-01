jest.mock('@whiskeysockets/baileys', () => ({
  default: jest.fn(),
  makeWASocket: jest.fn(),
  useMultiFileAuthState: jest.fn().mockResolvedValue({ state: {}, saveCreds: jest.fn() }),
  DisconnectReason: { loggedOut: 401 },
}));

import { BaileysService } from './baileys.service';

describe('BaileysService', () => {
  it('is defined', () => {
    expect(BaileysService).toBeDefined();
  });

  it('sendText() throws when socket is not ready', async () => {
    const service = new BaileysService({ get: jest.fn().mockReturnValue('/tmp') } as any);
    await expect(service.sendText('5511@s.whatsapp.net', 'hello')).rejects.toThrow('WhatsApp not connected');
  });
});
