import PermitListPage from "../../components/permits/PermitListPage";
import { getPendingPermits } from "../../services/permitService";

export default function PendingPermits() {
  return (
    <PermitListPage
      title="Pending Permits"
      description="Permits awaiting a decision."
      fetcher={getPendingPermits}
    />
  );
}
