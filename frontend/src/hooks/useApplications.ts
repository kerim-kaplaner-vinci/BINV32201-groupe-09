import { useCallback, useEffect, useState } from "react";
import type { Application } from "../models/application.ts";
import { createApplication, getApplications, withdrawApplication } from "../services/applications.service.ts";
import { isUnauthorized } from "../utils/api.ts";

export const useApplications = (
  token: string,
  onUnauthorized: () => void,
  enabled = true,
) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (enabled) setApplications(await getApplications(token));
  }, [enabled, token]);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    getApplications(token, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setApplications(data);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (isUnauthorized(reason)) onUnauthorized();
        else setError(reason instanceof Error ? reason.message : "Erreur inconnue");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [enabled, onUnauthorized, token]);

  const apply = async (offerId: number): Promise<void> => {
    try {
      const application = await createApplication(token, offerId);
      setApplications((current) => [application, ...current]);
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      throw reason;
    }
  };

  const withdraw = async (id: number): Promise<void> => {
    try {
      await withdrawApplication(token, id);
      await reload();
    } catch (reason: unknown) {
      if (isUnauthorized(reason)) onUnauthorized();
      throw reason;
    }
  };

  return { applications, isLoading, error, apply, withdraw };
};
