import { useState } from "react";
import locations from "../data/locations.json";

function LocationFilters() {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [sector, setSector] = useState("");

  const provinces = Object.keys(locations);

  const districts = province
    ? Object.keys(locations[province])
    : [];

  const sectors =
    province && district
      ? locations[province][district]
      : [];

  return (
    <div>
      {/* Province */}

      <select
        value={province}
        onChange={(e) => {
          setProvince(e.target.value);
          setDistrict("");
          setSector("");
        }}
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