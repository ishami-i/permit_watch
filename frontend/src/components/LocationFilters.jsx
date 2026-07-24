import { useEffect, useState } from "react";
import locations from "../data/locations.json";

function LocationFilters({ onChange }) {
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
    <div className="flex gap-3">
      {/* Province */}
      <select
        value={province}
        onChange={(e) => {
          setProvince(e.target.value);
          setDistrict("");
          setSector("");
        }}
        className="px-3 py-2 border border-[var(--background-200)] rounded-md"
      >
        <option value="">Select Province</option>
        {provinces.map((prov) => (
          <option key={prov} value={prov}>
            {prov}
          </option>
        ))}
      </select>

      {/* District */}
      <select
        value={district}
        onChange={(e) => {
          setDistrict(e.target.value);
          setSector("");
        }}
        disabled={!province}
        className="px-3 py-2 border border-[var(--background-200)] rounded-md disabled:opacity-50"
      >
        <option value="">Select District</option>
        {districts.map((dist) => (
          <option key={dist} value={dist}>
            {dist}
          </option>
        ))}
      </select>

      {/* Sector */}
      <select
        value={sector}
        onChange={(e) => setSector(e.target.value)}
        disabled={!district}
        className="px-3 py-2 border border-[var(--background-200)] rounded-md disabled:opacity-50"
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

export default LocationFilters;