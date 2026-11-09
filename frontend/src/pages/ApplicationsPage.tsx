import ApplicationList from "../components/ApplicationList.tsx";
import EmptyState from "../components/EmptyState.tsx";
import ErrorState from "../components/ErrorState.tsx";
import LoadingState from "../components/LoadingState.tsx";
import { useApplications } from "../hooks/useApplications.ts";

interface ApplicationsPageProps {
  token: string;
  onUnauthorized: () => void;
}

const ApplicationsPage = ({ token, onUnauthorized }: ApplicationsPageProps) => {
  const { applications, isLoading, error, withdraw } = useApplications(token, onUnauthorized);
  if (error) return <ErrorState message={error} />;
  if (isLoading) return <LoadingState />;
  return (
    <section>
      <h1>Mes candidatures</h1>
      {applications.length === 0 ? (
        <EmptyState message="Aucune candidature à afficher." />
      ) : (
        <ApplicationList applications={applications} onWithdraw={withdraw} />
      )}
    </section>
  );
};

export default ApplicationsPage;
