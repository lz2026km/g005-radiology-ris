/**
 * G005 放射RIS系统 v3.0.5.1 - R3.SIGN 区块链存证 Service (mock)
 * A5-REPORT / 100 点
 *
 * 模拟医院链 / 国家健康链 / 以太坊测试网三种网络
 */

import type { BlockchainProof } from '../../types/R3/R3.SIGN';
import { BLOCKCHAIN_PROOFS } from '../../data/reportSignMock';

const MIN_DELAY_MS = 300;
const MAX_DELAY_MS = 800;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function randomDelay(): Promise<void> {
  return delay(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));
}

function randomHex(bytes: number): string {
  let s = '';
  for (let i = 0; i < bytes * 2; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

export interface AnchorParams {
  reportId: string;
  contentHash: string;
  signerId: string;
  certificateSerial: string;
  network?: BlockchainProof['network'];
}

export class BlockchainService {
  private proofs: BlockchainProof[] = [...BLOCKCHAIN_PROOFS];

  async anchorToBlockchain(params: AnchorParams): Promise<BlockchainProof> {
    await randomDelay();
    const network = params.network ?? 'hospital-chain';
    const txHash = '0x' + randomHex(32);
    const blockNumber = 18430000 + Math.floor(Math.random() * 1000);
    const proof: BlockchainProof = {
      id: 'bc-' + Date.now().toString(36),
      reportId: params.reportId,
      txHash,
      blockNumber,
      blockHash: '0x' + randomHex(32),
      network,
      anchoredAt: new Date().toISOString(),
      contentHash: params.contentHash,
      signerId: params.signerId,
      certificateSerial: params.certificateSerial,
      verifyUrl: `https://verify.g005-hospital.local/tx/${txHash.slice(0, 10)}`,
      confirmations: 1,
      isImmutable: true,
    };
    this.proofs.push(proof);
    return proof;
  }

  async listProofs(): Promise<BlockchainProof[]> {
    await randomDelay();
    return [...this.proofs];
  }

  async listByReport(reportId: string): Promise<BlockchainProof[]> {
    await randomDelay();
    return this.proofs.filter((p) => p.reportId === reportId);
  }

  async verify(txHash: string): Promise<{
    txHash: string;
    found: boolean;
    proof?: BlockchainProof;
    verifiedAt: string;
  }> {
    await randomDelay();
    const proof = this.proofs.find((p) => p.txHash === txHash);
    return {
      txHash,
      found: !!proof,
      proof,
      verifiedAt: new Date().toISOString(),
    };
  }

  async getConfirmations(txHash: string): Promise<{ txHash: string; confirmations: number; isFinal: boolean }> {
    await randomDelay();
    const proof = this.proofs.find((p) => p.txHash === txHash);
    if (!proof) return { txHash, confirmations: 0, isFinal: false };
    const confirmations = proof.confirmations + Math.floor(Math.random() * 5);
    return {
      txHash,
      confirmations,
      isFinal: confirmations >= 12,
    };
  }
}

export const blockchainService = new BlockchainService();