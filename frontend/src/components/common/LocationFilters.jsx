import { useEffect, useState } from "react";
import locations from "../../data/locations.json";

export default function LocationFilters({ onChange }) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");

  const provinces = Object.keys(locations);
  const districts = province ? Object.keys(locations[province]) : [];
  const sectors = province && district ? locations[province][district] : [];

  useEffect(() => {
    onChange?.({ province, district, sector });
  }, [province, district, sector, onChange]);

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={province}
        onChange={(e) => {
          setProvince(e.target.value);
          setDistrict("");
          setSector("");
        }}
        className="rounded-md border border-[var(--background-200)] bg-[var(--background-50)] px-3 py-2 text-sm"
      >
        <option value="">Select Province</option>
        {provinces.map((prov) => (
          <option key={prov} value={prov}>
            {prov}
          </option>
        ))}
      </select>

      <select
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setSector("");
        }}
        disabled={!province}
        className="rounded-md border border-[var(--background-200)] bg-[var(--background-50)] px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="">Select District</option>
        {districts.map((dist) => (
          <option key={dist} value={dist}>
            {dist}
          </option>
        ))}
      </select>

      <select
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        disabled={!district}
        className="rounded-md border border-[var(--background-200)] bg-[var(--background-50)] px-3 py-2 text-sm disabled:opacity-50"
      >
        <option value="">Select Sector</option>
        {sectors.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
      </select>
    </div>
  );
}
