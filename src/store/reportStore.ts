// @deprecated v3.0.4: Consumers should use useStore() hook pattern instead of .getState()
// TODO: Convert all getState() calls to useStore() for reactive subscriptions
import { create } from "zustand";
import { reportApi } from "../services/api";
import type { ReportDto } from "../services/api";

interface ReportState {
  reports: ReportDto[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  submit: (id: string) => Promise<void>;
  review: (
    id: string,
    type: "initial" | "final",
    doctorId: string,
    doctorName: string,
    suggestion: string,
    score: number,
  ) => Promise<void>;
  sign: (id: string) => Promise<void>;
  publish: (id: string, qualityScore?: number) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
  revise: (id: string) => Promise<void>;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const res = await reportApi.list({});
      if (res.success && Array.isArray(res.data)) {
        set({ reports: res.data as ReportDto[], loading: false, error: null });
      } else {
        set({ loading: false, error: res.error?.message ?? "加载失败" });
      }
    } catch (err) {
      set({ loading: false, error: errorMessage(err, "网络错误") });
    }
  },

  submit: async (id) => {
    set({ error: null });
    try {
      const res = await reportApi.submit(id);
      if (res.success) {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "已提交" } : r,
          ),
        }));
      } else {
        set({ error: res.error?.message ?? "提交失败" });
      }
    } catch (err) {
      set({ error: errorMessage(err, "网络错误") });
    }
  },

  review: async (id, type, _doctorId, _doctorName, suggestion, _score) => {
    const field =
      type === "initial" ? "initialAuditSuggestion" : "finalAuditSuggestion";
    const nextStatus = type === "initial" ? "初审通过" : "已审核";
    set((s) => ({
      reports: s.reports.map((r) =>
        r.id === id ? { ...r, status: nextStatus, [field]: suggestion } : r,
      ),
    }));
  },

  sign: async (id) => {
    set({ error: null });
    try {
      const res = await reportApi.sign(id);
      if (res.success) {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "已签发" } : r,
          ),
        }));
      } else {
        set({ error: res.error?.message ?? "签发失败" });
      }
    } catch (err) {
      set({ error: errorMessage(err, "网络错误") });
    }
  },

  publish: async (id, qualityScore) => {
    set({ error: null });
    try {
      const res = await reportApi.publish(id, qualityScore);
      if (res.success) {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "已发布" } : r,
          ),
        }));
      } else {
        set({ error: res.error?.message ?? "发布失败" });
      }
    } catch (err) {
      set({ error: errorMessage(err, "网络错误") });
    }
  },

  reject: async (id, reason) => {
    set({ error: null });
    try {
      const res = await reportApi.reject(id, reason);
      if (res.success) {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "已驳回" } : r,
          ),
        }));
      } else {
        set({ error: res.error?.message ?? "驳回失败" });
      }
    } catch (err) {
      set({ error: errorMessage(err, "网络错误") });
    }
  },

  revise: async (id) => {
    set({ error: null });
    try {
      const res = await reportApi.revise(id);
      if (res.success) {
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, status: "修订中" } : r,
          ),
        }));
      } else {
        set({ error: res.error?.message ?? "修订失败" });
      }
    } catch (err) {
      set({ error: errorMessage(err, "网络错误") });
    }
  },
}));
