import type { Application } from "../models/application.ts";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_TONES, PERIOD_LABELS } from "../utils/labels.ts";
import StatusBadge from "./StatusBadge.tsx";

interface ApplicationListProps {
  applications: Application[];
  onWithdraw: (id: number) => Promise<void>;
}

const ApplicationList = ({ applications, onWithdraw }: ApplicationListProps) => (
  <div className="table-wrapper">
    <table className="data-table">
      <thead>
        <tr><th>Offre</th><th>Entreprise</th><th>Période</th><th>Statut</th><th>Action</th></tr>
      </thead>
      <tbody>
        {applications.map((application) => (
          <tr key={application.id}>
            <td>{application.offerTitle}</td>
            <td>{application.companyShortName}</td>
            <td>{application.academicYear} — {PERIOD_LABELS[application.period]}</td>
            <td>
              <StatusBadge
                label={APPLICATION_STATUS_LABELS[application.status]}
                tone={APPLICATION_STATUS_TONES[application.status]}
              />
            </td>
            <td>
              {application.status === "IN_PROGRESS" && (
                <button
                  className="button button-danger"
                  type="button"
                  onClick={() => {
                    if (window.confirm("Retirer cette candidature ?")) void onWithdraw(application.id);
                  }}
                >
                  Retirer
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ApplicationList;
