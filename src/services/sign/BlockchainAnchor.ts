/**
 * G005 放射RIS系统 v3.0.5.1 - 区块链多链锚定 Service (mock)
 * 35 pts
 *
 * 支持 Ethereum Sepolia / Mainnet, Hyperledger Fabric, FISCO BCOS, 医院链, 国家健康链
 */

import type {
  AnchorBatchResult,
  AnchorReceipt,
  AnchorRequest,
  BlockchainNetwork,
  ChainProfile,
} from '../../types/sign';
import { CHAIN_PROFILES } from '../../types/sign';
import { ANCHOR_RECEIPTS } from '../../data/signMock';

const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function randomHex(bytes: number): string {
  let s = '';
  for (let i = 0; i < bytes * 2; i++) s += Math.floor(Math.random() * 16).toString(16);
  return s;
}

function uuid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function getProfile(network: BlockchainNetwork): ChainProfile {
  return CHAIN_PROFILES.find((p) => p.network === network) ?? CHAIN_PROFILES[0]!;
}

export class BlockchainAnchor {
  private receipts: AnchorReceipt[] = [...ANCHOR_RECEIPTS];

  async anchor(req: AnchorRequest): Promise<AnchorBatchResult> {
    await randomDelay();
    const startedAt = nowIso();
    const receipts: AnchorReceipt[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const network of req.networks) {
      const profile = getProfile(network);
      const blockNumber = network === 'ethereum-sepolia'
        ? 8234120 + Math.floor(Math.random() * 500)
        : network === 'ethereum-mainnet'
          ? 18430000 + Math.floor(Math.random() * 500)
          : 41000 + Math.floor(Math.random() * 1000);
      const txHash = '0x' + randomHex(32);

      const receipt: AnchorReceipt = {
        id: uuid('arc'),
        reportId: req.reportId,
        contentHash: req.contentHash,
        signerId: req.signerId,
        certificateSerial: req.certificateSerial,
        network,
        txHash,
        blockNumber,
        blockHash: '0x' + randomHex(32),
        anchoredAt: nowIso(),
        confirmations: 0,
        confirmationsRequired: profile.confirmationsRequired,
        isFinal: false,
        verifyUrl: `${profile.explorerUrl}/tx/${txHash.slice(0, 18)}`,
        rawPayloadBase64: btoa(JSON.stringify({ reportId: req.reportId, signer: req.signerId })),
        payloadHash: req.contentHash,
      };
      receipts.push(receipt);
      this.receipts.push(receipt);
      successCount++;
    }

    return {
      batchId: uuid('batch'),
      totalRequested: req.networks.length,
      successCount,
      failedCount,
      receipts,
      startedAt,
      finishedAt: nowIso(),
    };
  }

  async listReceipts(reportId?: string): Promise<AnchorReceipt[]> {
    await randomDelay();
    return reportId ? this.receipts.filter((r) => r.reportId === reportId) : [...this.receipts];
  }

  async getConfirmation(id: string): Promise<{ receipt: AnchorReceipt | null; confirmations: number; isFinal: boolean }> {
    await randomDelay();
    const idx = this.receipts.findIndex((r) => r.id === id);
    if (idx < 0) return { receipt: null, confirmations: 0, isFinal: false };
    const r = this.receipts[idx]!;
    const confirmations = r.confirmations + Math.floor(Math.random() * 3);
    const isFinal = confirmations >= r.confirmationsRequired;
    this.receipts[idx] = { ...r, confirmations, isFinal };
    return { receipt: this.receipts[idx]!, confirmations, isFinal };
  }

  async listNetworks(): Promise<ChainProfile[]> {
    await randomDelay();
    return [...CHAIN_PROFILES];
  }

  async verifyOnChain(txHash: string): Promise<{ found: boolean; receipt?: AnchorReceipt; verifiedAt: string }> {
    await randomDelay();
    const receipt = this.receipts.find((r) => r.txHash === txHash);
    return { found: !!receipt, receipt, verifiedAt: nowIso() };
  }
}

export const blockchainAnchor = new BlockchainAnchor();
