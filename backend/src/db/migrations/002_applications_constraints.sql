-- Un étudiant ne peut avoir qu'une candidature non retirée pour une offre.
-- Les candidatures retirées restent historisées et permettent une nouvelle tentative.
CREATE UNIQUE INDEX applications_one_active_per_offer_student
  ON applications (offer_id, student_id)
  WHERE status <> 'WITHDRAWN';
