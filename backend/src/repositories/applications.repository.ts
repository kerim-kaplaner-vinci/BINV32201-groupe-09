import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

interface ApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface OfferStatusRow {
  status: string;
}

export const createApplicationsRepository = (db: Db) => {
  const select = `
    SELECT a.id, a.offer_id, a.student_id, a.message, a.status, a.applied_at,
           o.title AS offer_title, c.short_name AS company_short_name,
           ay.label AS academic_year_label, p.code AS period_code
    FROM applications a
    JOIN offers o ON o.id = a.offer_id
    JOIN companies c ON c.id = o.company_id
    JOIN academic_years ay ON ay.id = o.academic_year_id
    JOIN periods p ON p.id = o.period_id
  `;
  const findByStudent = db.prepare<{ studentId: number }, ApplicationDbo>(
    `${select} WHERE a.student_id = @studentId ORDER BY a.applied_at DESC, a.id DESC`,
  );
  const findByIdAndStudent = db.prepare<{ id: number; studentId: number }, ApplicationDbo>(
    `${select} WHERE a.id = @id AND a.student_id = @studentId`,
  );
  const findActive = db.prepare<{ offerId: number; studentId: number }, ApplicationDbo>(
    `${select} WHERE a.offer_id = @offerId AND a.student_id = @studentId
      AND a.status <> 'WITHDRAWN'`,
  );
  const findOfferStatus = db.prepare<{ offerId: number }, OfferStatusRow>(
    "SELECT status FROM offers WHERE id = @offerId",
  );
  const insert = db.prepare<ApplicationParams>(
    `INSERT INTO applications (offer_id, student_id, message)
     VALUES (@offerId, @studentId, @message)`,
  );
  const withdraw = db.prepare<{ id: number; studentId: number }>(
    `UPDATE applications SET status = 'WITHDRAWN'
     WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'`,
  );

  return {
    findByStudent: (studentId: number): ApplicationDbo[] => findByStudent.all({ studentId }),
    findByIdAndStudent: (id: number, studentId: number): ApplicationDbo | undefined =>
      findByIdAndStudent.get({ id, studentId }),
    findActive: (offerId: number, studentId: number): ApplicationDbo | undefined =>
      findActive.get({ offerId, studentId }),
    findOfferStatus: (offerId: number): string | undefined => findOfferStatus.get({ offerId })?.status,
    create: (offerId: number, studentId: number, message: string | null): number =>
      Number(insert.run({ offerId, studentId, message }).lastInsertRowid),
    withdraw: (id: number, studentId: number): boolean =>
      withdraw.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
