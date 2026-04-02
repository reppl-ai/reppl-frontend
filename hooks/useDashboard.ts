import { useEffect, useState } from "react";

import { connectSlackWebhook, getBrief, getDashboard, scanNow } from "../lib/api";
import type { DailyBrief, DashboardResponse, IntegrationStatus } from "../lib/types";

interface DashboardState {
  data: DashboardResponse | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(productId: string | null) {
  const [state, setState] = useState<DashboardState>({ data: null, loading: false, error: null });

  useEffect(() => {
    if (!productId) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const activeProductId = productId;
    let active = true;
    let dashboardTimer: ReturnType<typeof setInterval> | null = null;
    let briefTimer: ReturnType<typeof setInterval> | null = null;

    async function loadDashboard() {
      setState((current) => ({ ...current, loading: current.data === null }));
      try {
        const data = await getDashboard(activeProductId);
        if (active) {
          setState({ data, loading: false, error: null });
        }
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            error: error instanceof Error ? error.message : "REQUEST FAILED",
          }));
        }
      }
    }

    async function loadBrief() {
      try {
        const brief = await getBrief(activeProductId);
        if (!active || !brief) return;
        setState((current) => ({
          ...current,
          data: current.data ? { ...current.data, brief } : current.data,
        }));
      } catch {
        return;
      }
    }

    void loadDashboard();
    void loadBrief();
    dashboardTimer = setInterval(() => void loadDashboard(), 5000);
    briefTimer = setInterval(() => void loadBrief(), 10000);

    return () => {
      active = false;
      if (dashboardTimer) clearInterval(dashboardTimer);
      if (briefTimer) clearInterval(briefTimer);
    };
  }, [productId]);

  async function triggerScanNow() {
    if (!productId) return;
    const data = await scanNow(productId);
    setState({ data, loading: false, error: null });
  }

  async function connectSlack(webhookUrl: string) {
    if (!productId) return;
    const integrations = await connectSlackWebhook(productId, webhookUrl);
    setState((current) => ({
      ...current,
      data: current.data ? { ...current.data, integrations } : current.data,
    }));
  }

  function patchBrief(brief: DailyBrief) {
    setState((current) => ({
      ...current,
      data: current.data ? { ...current.data, brief } : current.data,
    }));
  }

  function patchIntegrations(integrations: IntegrationStatus) {
    setState((current) => ({
      ...current,
      data: current.data ? { ...current.data, integrations } : current.data,
    }));
  }

  return { ...state, triggerScanNow, connectSlack, patchBrief, patchIntegrations };
}
