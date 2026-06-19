import type { CdsTriggerContext, ImagingProtocol, ProtocolRecommendation } from '../../../types/cds';

const MOCK_PROTOCOLS: ImagingProtocol[] = [
  { id: 'proto-001', name: '头颅CT平扫', nameEn: 'CT Head Non-Contrast', modality: 'CT', bodyPart: '头颅', indication: 'routine', description: '常规头颅CT平扫', ageGroup: 'adult', duration: 5, qualityScore: 90, usageCount: 1520, rating: 4.5, version: '3.0', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', parameters: [{ name: 'kV', label: '管电压', value: 120, unit: 'kV', required: true }, { name: 'mAs', label: '管电流', value: 250, unit: 'mAs', required: true }, { name: 'sliceThickness', label: '层厚', value: 5, unit: 'mm', required: true }], estimatedDose: { ctdiVol: 60, dlp: 850, effectiveDose: 2.0 } },
  { id: 'proto-002', name: '头颅CT增强', nameEn: 'CT Head Contrast', modality: 'CT', bodyPart: '头颅', indication: 'routine', description: '常规头颅CT增强扫描', ageGroup: 'adult', contrastAgent: '碘海醇', contrastDose: '50-70mL', flowRate: '3mL/s', duration: 10, qualityScore: 92, usageCount: 890, rating: 4.6, version: '2.1', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', parameters: [{ name: 'kV', label: '管电压', value: 120, unit: 'kV', required: true }, { name: 'mAs', label: '管电流', value: 300, unit: 'mAs', required: true }, { name: 'delay', label: '延迟时间', value: 60, unit: 's', required: true }], estimatedDose: { ctdiVol: 70, dlp: 1050, effectiveDose: 2.5 } },
  { id: 'proto-003', name: '胸部CT平扫', nameEn: 'CT Chest Non-Contrast', modality: 'CT', bodyPart: '胸部', indication: 'routine', description: '常规胸部CT平扫', ageGroup: 'adult', duration: 8, qualityScore: 88, usageCount: 2100, rating: 4.7, version: '3.2', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', parameters: [{ name: 'kV', label: '管电压', value: 120, unit: 'kV', required: true }, { name: 'mAs', label: '管电流', value: 120, unit: 'mAs', required: true }, { name: 'pitch', label: '螺距', value: 1.2, unit: '', required: true }], estimatedDose: { ctdiVol: 15, dlp: 450, effectiveDose: 6.0 } },
  { id: 'proto-004', name: '胸部CT增强', nameEn: 'CT Chest Contrast', modality: 'CT', bodyPart: '胸部', indication: 'routine', description: '常规胸部CT增强扫描', ageGroup: 'adult', contrastAgent: '碘海醇', contrastDose: '60-80mL', flowRate: '3mL/s', duration: 12, qualityScore: 90, usageCount: 1450, rating: 4.5, version: '2.3', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', parameters: [{ name: 'kV', label: '管电压', value: 120, unit: 'kV', required: true }, { name: 'mAs', label: '管电流', value: 150, unit: 'mAs', required: true }, { name: 'delay', label: '延迟时间', value: 40, unit: 's', required: true }], estimatedDose: { ctdiVol: 21, dlp: 650, effectiveDose: 8.0 } },
  { id: 'proto-005', name: '腹部CT增强(三期)', nameEn: 'CT Abdomen Triphasic', modality: 'CT', bodyPart: '腹部', indication: 'cancer_staging', description: '腹部三期增强扫描(动脉期/门脉期/延迟期)', ageGroup: 'adult', contrastAgent: '碘海醇', contrastDose: '80-100mL', flowRate: '4mL/s', duration: 20, qualityScore: 85, usageCount: 680, rating: 4.3, version: '2.0', createdAt: '2025-02-01T00:00:00Z', updatedAt: '2025-06-01T00:00:00Z', parameters: [{ name: 'kV', label: '管电压', value: 120, unit: 'kV', required: true }, { name: 'mAs', label: '管电流', value: 200, unit: 'mAs', required: true }, { name: 'arterialDelay', label: '动脉期延迟', value: 30, unit: 's', required: true }, { name: 'portalDelay', label: '门脉期延迟', value: 70, unit: 's', required: true }], estimatedDose: { ctdiVol: 35, dlp: 1300, effectiveDose: 15.0 } },
];

export class ProtocolSelector {
  private protocols: ImagingProtocol[] = MOCK_PROTOCOLS;

  getProtocols(): ImagingProtocol[] {
    return this.protocols;
  }

  getProtocol(id: string): ImagingProtocol | null {
    return this.protocols.find((p) => p.id === id) ?? null;
  }

  search(query: string): ImagingProtocol[] {
    const q = query.toLowerCase();
    return this.protocols.filter(
      (p) => p.name.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    );
  }

  getProtocolsByModality(modality: string): ImagingProtocol[] {
    return this.protocols.filter((p) => p.modality === modality);
  }

  getProtocolsByBodyPart(bodyPart: string): ImagingProtocol[] {
    return this.protocols.filter((p) => p.bodyPart === bodyPart);
  }

  recommend(context: CdsTriggerContext): ProtocolRecommendation[] {
    const exam = context.exam;
    if (!exam) return [];
    const candidates = this.protocols.filter((p) => p.modality === exam.modality && p.bodyPart === exam.bodyPart);
    return candidates.map((p) => {
      const score = p.qualityScore - (exam.contrastPlanned && !p.contrastAgent ? 20 : 0) + (p.usageCount > 1000 ? 5 : 0);
      return {
        protocol: p,
        score: Math.max(0, score),
        rationale: [p.description],
        warnings: exam.contrastPlanned && !p.contrastAgent ? ['此协议不含对比剂'] : undefined,
      };
    }).sort((a, b) => b.score - a.score);
  }

  getProtocolCount(): number {
    return this.protocols.length;
  }
}

let _instance: ProtocolSelector | null = null;
export function getProtocolSelector(): ProtocolSelector {
  if (!_instance) _instance = new ProtocolSelector();
  return _instance;
}
