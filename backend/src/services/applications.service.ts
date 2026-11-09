import { toApplication } from "../mappers/application.mapper.ts";
import type { Application } from "../models/application.ts";
import type { User } from "../models/user.ts";
import type { ApplicationsRepository } from "../repositories/applications.repository.ts";
import { HttpError } from "../utils/httpError.ts";
import { isStudent } from "./permissions.ts";

const requireStudent = (viewer: User): void => {
  if (!isStudent(viewer)) {
    throw new HttpError(403, "FORBIDDEN", "Seul un étudiant peut gérer ses candidatures");
  }
};

export const createApplicationsService = (repository: ApplicationsRepository) => ({
  listApplications: (viewer: User): Application[] => {
    requireStudent(viewer);
    return repository.findByStudent(viewer.id).map(toApplication);
  },

  apply: (viewer: User, offerId: number, message: string | null): Application => {
    requireStudent(viewer);
    if (repository.findOfferStatus(offerId) === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Cette offre n'existe pas");
    }
    if (repository.findOfferStatus(offerId) !== "PUBLISHED") {
      throw new HttpError(409, "OFFER_NOT_PUBLISHED", "Cette offre n'est pas ouverte aux candidatures");
    }
    if (repository.findActive(offerId, viewer.id) !== undefined) {
      throw new HttpError(409, "DUPLICATE_APPLICATION", "Vous avez déjà une candidature active pour cette offre");
    }
    const id = repository.create(offerId, viewer.id, message);
    const application = repository.findByIdAndStudent(id, viewer.id);
    if (application === undefined) {
      throw new HttpError(500, "INTERNAL_ERROR", "La candidature créée est introuvable");
    }
    return toApplication(application);
  },

  withdraw: (viewer: User, id: number): void => {
    requireStudent(viewer);
    const application = repository.findByIdAndStudent(id, viewer.id);
    if (application === undefined) {
      throw new HttpError(404, "NOT_FOUND", "Cette candidature est introuvable");
    }
    if (application.status !== "IN_PROGRESS") {
      throw new HttpError(409, "APPLICATION_NOT_WITHDRAWABLE", "Cette candidature ne peut plus être retirée");
    }
    if (!repository.withdraw(id, viewer.id)) {
      throw new HttpError(409, "APPLICATION_NOT_WITHDRAWABLE", "Cette candidature ne peut plus être retirée");
    }
  },
});

export type ApplicationsService = ReturnType<typeof createApplicationsService>;
