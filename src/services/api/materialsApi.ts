// [v3.0.6.8-51] PR7: 眼料 (IOL 库存 + 接触镜库) API client
import { api } from './client';

// ============= IOL 库存 =============
export interface IolItemDto {
  id: string;
  barcode: string;
  model: string;        // SA60AT / SN6AT5 / PanOptix / TECNIS Symfony
  type: 'monofocal' | 'toric' | 'multifocal' | 'edof';
  power: number;        // D
  cylinder?: number;    // Toric 用
  batchNumber: string;
  expiryDate: string;
  stockLocation: string;
  status: 'in_stock' | 'reserved' | 'implanted' | 'expired' | 'recalled';
  supplier: string;
  unitPrice: number;
  createdAt: string;
}

export const iolApi = {
  list: (params?: { type?: string; status?: string; supplier?: string; pageSize?: number }) =>
    api.get<IolItemDto[]>(`/eye/materials/iol?${new URLSearchParams(params ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<IolItemDto>(`/eye/materials/iol/${id}`),

  inStock: (data: Omit<IolItemDto, 'id' | 'createdAt' | 'status'>) =>
    api.post<IolItemDto>('/eye/materials/iol/in', data),

  outStock: (id: string, data: { reason: string; patientId?: string; surgeon?: string }) =>
    api.post<IolItemDto>(`/eye/materials/iol/${id}/out`, data),

  transfer: (id: string, data: { fromLocation: string; toLocation: string }) =>
    api.post<IolItemDto>(`/eye/materials/iol/${id}/transfer`, data),

  adjust: (id: string, data: { deltaQty: number; reason: string }) =>
    api.post<IolItemDto>(`/eye/materials/iol/${id}/adjust`, data),

  getLowStock: () =>
    api.get<IolItemDto[]>('/eye/materials/iol/low-stock'),

  getExpiring: (days?: number) =>
    api.get<IolItemDto[]>(`/eye/materials/iol/expiring?days=${days || 90}`),
};

// ============= 接触镜库 =============
export interface ContactLensDto {
  id: string;
  brand: string;        // 'Bausch + Lomb' / 'Johnson & Johnson' / 'Alcon'
  type: 'RGP' | 'Scleral' | 'Soft' | 'OK' | 'Hybrid';
  series: string;        // e.g. 'Boston XO' / 'Acuvue Oasys'
  bc: number;            // 基弧 (mm)
  dia: number;           // 直径 (mm)
  power: number;         // 度数 (D)
  cylinder?: number;     // 散光 (D)
  axis?: number;         // 轴位
  stock: number;
  trialLens: boolean;    // 试戴片
  unitPrice: number;
  supplier: string;
}

export const contactLensApi = {
  list: (params?: { type?: string; brand?: string; trialLens?: boolean; pageSize?: number }) =>
    api.get<ContactLensDto[]>(`/eye/contact-lens/inventory?${new URLSearchParams(params ?? {}).toString()}`),

  getById: (id: string) =>
    api.get<ContactLensDto>(`/eye/contact-lens/inventory/${id}`),

  create: (data: Omit<ContactLensDto, 'id'>) =>
    api.post<ContactLensDto>('/eye/contact-lens/inventory', data),

  update: (id: string, data: Partial<ContactLensDto>) =>
    api.put<ContactLensDto>(`/eye/contact-lens/inventory/${id}`, data),

  delete: (id: string) =>
    api.delete(`/eye/contact-lens/inventory/${id}`),

  fitting: (id: string, data: { patientId: string; fittingData: any }) =>
    api.post<{ fittingId: string; result: string }>(`/eye/contact-lens/fitting/${id}`, data),

  // OK 镜/角膜塑形镜特殊接口 (v3.0.6.8-36 已有, 这里添加补充)
  okLensDesign: (data: { patientId: string; k1: number; k2: number; kAxis: number; targetReduction: number; brand?: string }) =>
    api.post<{ designId: string; baseCurve: number; returnZone: number; diameter: number; brand: string }>('/eye/optometry/ok-lens/design', data),
};
