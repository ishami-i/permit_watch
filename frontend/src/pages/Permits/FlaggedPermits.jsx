import PermitListPage from "../../components/permits/PermitListPage";
import { getFlaggedPermits } from "../../services/permitService";

export default function FlaggedPermits() {
  return (
    <PermitListPage
      title="Flagged Permits"
      description="Permits flagged for irregularities and requiring review."
      fetcher={getFlaggedPermits}
    />
  );
}
