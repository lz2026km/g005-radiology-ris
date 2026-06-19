// ============================================================
// G005 放射RIS系统 v3.0.6 - TOTP 服务
// TotpService - 基于 HMAC-SHA1 的 RFC 6238 实现
// ============================================================
import type { TotpConfig, TotpQrPayload } from '../../../types/security';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buf: Uint8Array): string {
  let bits = 0, value = 0, output = '';
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  return output;
}

export function base32Decode(s: string): Uint8Array {
  const clean = s.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function hmacSha(key: Uint8Array, msg: Uint8Array, algo: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<Uint8Array> {
  const subtle = crypto.subtle;
  const cryptoKey = await subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: algo },
    false,
    ['sign'],
  );
  const sig = await subtle.sign('HMAC', cryptoKey, msg);
  return new Uint8Array(sig);
}

async function hotp(secret: Uint8Array, counter: number, digits: number, algo: 'SHA-1' | 'SHA-256' | 'SHA-512'): Promise<string> {
  const buf = new Uint8Array(8);
  let v = counter;
  for (let i = 7; i >= 0; i--) { buf[i] = v & 0xff; v = Math.floor(v / 256); }
  const hmac = await hmacSha(secret, buf, algo);
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const bin = ((hmac[offset]! & 0x7f) << 24)
            | ((hmac[offset + 1]! & 0xff) << 16)
            | ((hmac[offset + 2]! & 0xff) << 8)
            | (hmac[offset + 3]! & 0xff);
  const code = (bin % (10 ** digits)).toString().padStart(digits, '0');
  return code;
}

export async function generateTotp(secret: string, opts?: Partial<TotpConfig>): Promise<string> {
  const cfg: TotpConfig = {
    secret,
    digits: opts?.digits ?? 6,
    period: opts?.period ?? 30,
    algorithm: opts?.algorithm ?? 'SHA-1',
    issuer: opts?.issuer ?? 'G005-RIS',
    accountName: opts?.accountName ?? 'user',
  };
  const counter = Math.floor(Date.now() / 1000 / cfg.period);
  const key = base32Decode(cfg.secret);
  return hotp(key, counter, cfg.digits, cfg.algorithm);
}

export async function verifyTotp(secret: string, code: string, opts?: Partial<TotpConfig> & { window?: number }): Promise<{ valid: boolean; drift: number }> {
  const cfg: TotpConfig = {
    secret,
    digits: opts?.digits ?? 6,
    period: opts?.period ?? 30,
    algorithm: opts?.algorithm ?? 'SHA-1',
    issuer: opts?.issuer ?? 'G005-RIS',
    accountName: opts?.accountName ?? 'user',
  };
  const window = opts?.window ?? 1;
  const counter = Math.floor(Date.now() / 1000 / cfg.period);
  const key = base32Decode(cfg.secret);
  const codeClean = code.replace(/\s+/g, '');
  for (let w = -window; w <= window; w++) {
    const candidate = await hotp(key, counter + w, cfg.digits, cfg.algorithm);
    if (candidate === codeClean) return { valid: true, drift: w };
  }
  return { valid: false, drift: 0 };
}

export function generateSecret(bytes = 20): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return base32Encode(buf);
}

export function buildQrPayload(secret: string, accountName: string, issuer: string): TotpQrPayload {
  const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  return { uri, secret, manualEntryKey: secret.match(/.{1,4}/g)?.join(' ') ?? secret };
}