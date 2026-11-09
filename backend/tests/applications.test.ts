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
  it("refuse l'accès aux profils non étudiants", async () => {
    const response = await request(app)
      .get("/applications")
      .set("Authorization", tokenFor("ADMIN", ADMINISTRATOR.ANNE_LECLERCQ));
    expect(response.status).toBe(403);
  });

  it("liste uniquement les candidatures de l'étudiant connecté", async () => {
    const response = await request(app).get("/applications").set("Authorization", asStudent());
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      id: APPLICATION.LUCAS_FLEET_APP,
      offerId: OFFER.FLEET_APP,
      status: "IN_PROGRESS",
    });
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

  it("ne permet pas le retrait d'une candidature sélectionnée", async () => {
    const response = await request(app)
      .delete(`/applications/${APPLICATION.MATEUSZ_CLOUD_MIGRATION}`)
      .set("Authorization", tokenFor("STUDENT", STUDENT.MATEUSZ_KOWALSKI));
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("APPLICATION_NOT_WITHDRAWABLE");
  });
});
