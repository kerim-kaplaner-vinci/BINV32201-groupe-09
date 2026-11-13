import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ADMINISTRATOR, APPLICATION, OFFER, STUDENT } from "../src/db/seed/seedIds.ts";
import { createTestApp, tokenFor } from "./helpers/testApp.ts";

let app: ReturnType<typeof createTestApp>;

beforeEach(() => {
  app = createTestApp();
});

const asStudent = () => tokenFor("STUDENT", STUDENT.LUCAS_DUPONT);

describe("applications", () => {
  it("refuse une consultation sans session", async () => {
    const response = await request(app).get("/applications");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("refuse l'accès aux profils non étudiants", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("liste uniquement les candidatures de l'étudiant connecté", async () => {
    const response = await request(app).get("/applications").set("Authorization", asStudent());
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual({
      id: APPLICATION.LUCAS_FLEET_APP,
      offerId: OFFER.FLEET_APP,
      offerTitle: "Application React de gestion de flotte",
      companyShortName: "Lumen Digital",
      academicYear: "2026-2027",
      period: "P2",
      message: "Le développement React m'intéresse particulièrement.",
      status: "IN_PROGRESS",
      appliedAt: "2026-10-02 18:10:00",
    });
  });

  it("retourne les statuts sélectionnée, refusée et retirée", async () => {
    const selected = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));
    expect(selected.status).toBe(200);
    expect(selected.body).toContainEqual(
      expect.objectContaining({
        id: APPLICATION.MATEUSZ_CLOUD_MIGRATION,
        status: "SELECTED",
      }),
    );

    const rejected = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.LEA_MERTENS));
    expect(rejected.status).toBe(200);
    expect(rejected.body).toContainEqual(
      expect.objectContaining({
        id: APPLICATION.LEA_CLOUD_MIGRATION,
        status: "REJECTED",
      }),
    );

    const withdrawn = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("STUDENT", STUDENT.INES_HADDAD));
    expect(withdrawn.status).toBe(200);
    expect(withdrawn.body).toContainEqual(
      expect.objectContaining({
        id: APPLICATION.INES_BILLING_API,
        status: "WITHDRAWN",
      }),
    );
  });

  it("refuse une candidature active en double", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent())
      .send({ offerId: OFFER.FLEET_APP });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("DUPLICATE_APPLICATION");
  });

  it("crée une candidature puis autorise le retrait et la recandidature", async () => {
    const created = await request(app)
      .post("/applications")
      .set("Authorization", asStudent())
      .send({ offerId: OFFER.DATA_QUALITY, message: "Ma motivation" });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("IN_PROGRESS");

    const withdrawn = await request(app)
      .delete(`/applications/${created.body.id}`)
      .set("Authorization", asStudent());
    expect(withdrawn.status).toBe(204);

    const listedAfterWithdrawal = await request(app)
      .get("/applications")
      .set("Authorization", asStudent());
    expect(listedAfterWithdrawal.status).toBe(200);
    expect(listedAfterWithdrawal.body).toContainEqual(
      expect.objectContaining({
        id: created.body.id,
        offerId: OFFER.DATA_QUALITY,
        message: "Ma motivation",
        status: "WITHDRAWN",
      }),
    );

    const reapplied = await request(app)
      .post("/applications")
      .set("Authorization", asStudent())
      .send({ offerId: OFFER.DATA_QUALITY });
    expect(reapplied.status).toBe(201);
    expect(reapplied.body.id).not.toBe(created.body.id);
  });

  it("refuse une offre non publiée", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", asStudent())
      .send({ offerId: OFFER.CLOUD_MIGRATION });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("OFFER_NOT_PUBLISHED");
  });

  it("refuse une candidature sans session", async () => {
    const response = await request(app).post("/applications").send({ offerId: OFFER.DATA_QUALITY });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");
  });

  it("refuse une candidature par un profil non étudiant", async () => {
    const response = await request(app)
      .post("/applications")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ))
      .send({ offerId: OFFER.DATA_QUALITY });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("ne permet pas le retrait d'une candidature sélectionnée", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });

  it("ne permet pas le retrait d'une candidature refusée", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.LEA_CLOUD_MIGRATION}`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.LEA_MERTENS));

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });

  it("refuse le retrait de la candidature d'un autre étudiant", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.INES_FLEET_APP}`)
      .set("Authorization", asStudent());

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("refuse un identifiant de candidature invalide", async () => {
    const response = await request(app)
      .delete("/applications/not-an-id")
      .set("Authorization", asStudent());

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_BODY");
  });
});
