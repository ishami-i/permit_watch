import PermitListPage from "../../components/permits/PermitListPage";
import { getFullPermits } from "../../services/permitService";

export default function AllPermits() {
  return (
    <PermitListPage
      title="All Permits"
      description="Every permit submitted across all districts."
      fetcher={getFullPermits}
    />
  );
}
