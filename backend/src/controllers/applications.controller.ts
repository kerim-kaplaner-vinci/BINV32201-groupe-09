import { Router } from "express";
import { toApplicationDto } from "../mappers/application.mapper.ts";
import { getCurrentUser } from "../middlewares/authenticate.ts";
import type { ApplicationsService } from "../services/applications.service.ts";
import { HttpError } from "../utils/httpError.ts";

const parsePositiveInteger = (value: unknown, name: string): number => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, "INVALID_BODY", `${name} doit être un entier positif`);
  }
  return Number(value);
};

const parseBody = (body: unknown): { offerId: number; message: string | null } => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "INVALID_BODY", "Le corps doit être un objet JSON");
  }
  const data = body as Record<string, unknown>;
  const offerId = data.offerId;
  if (!Number.isInteger(offerId) || (offerId as number) <= 0) {
    throw new HttpError(400, "INVALID_BODY", "offerId doit être un entier positif");
  }
  const message = data.message;
  if (message !== undefined && message !== null && typeof message !== "string") {
    throw new HttpError(400, "INVALID_BODY", "message doit être une chaîne de caractères");
  }
  if (typeof message === "string" && message.length > 5000) {
    throw new HttpError(400, "INVALID_BODY", "message ne peut pas dépasser 5000 caractères");
  }
  return { offerId: offerId as number, message: message === undefined ? null : message as string | null };
};

export const createApplicationsRouter = (service: ApplicationsService) => {
  const router = Router();

  router.get("/", (req, res) => {
    res.json(service.listApplications(getCurrentUser(req)).map(toApplicationDto));
  });

  router.post("/", (req, res) => {
    const { offerId, message } = parseBody(req.body);
    res.status(201).json(toApplicationDto(service.apply(getCurrentUser(req), offerId, message)));
  });

  router.delete("/:id", (req, res) => {
    const id = parsePositiveInteger(req.params.id, "id");
    service.withdraw(getCurrentUser(req), id);
    res.status(204).send();
  });

  return router;
};
