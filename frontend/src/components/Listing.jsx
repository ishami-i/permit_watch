import React from "react";
import { NavLink } from "react-router-dom";
import LocationFilters  from "./LocationFilters";
import { permitData } from "../api/axios";

{/* using the permited data to be later added on the table */}


export default function Listing() {
    return (
        <>
        <div className="max-w-7xl mx-auto px-6 py-6">
        <h2 className="text-lg font-semibold text-[var(--text-900)] mb-4">
            Permit Listings
        </h2>
        {/* the search bar */}
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search permits..."
                className="w-full px-4 py-2 border border-[var(--background-200)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            />

            {/*Location filters */}
            <LocationFilters />
        </div>
        {/* the list of permits table*/}
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-[var(--background-200)]">
                <thead>
                    <tr className="bg-[var(--background-100)]">
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Permit ID</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Applicant</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Project</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">UPI</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Status</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">submission date</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Resubmission</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">response date</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Province</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">District</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Sector</th>
                        <th className="border border-[var(--background-200)] px-4 py-2 text-left">Supervisor name</th>                    </tr>
                </thead>
                <tbody>
                    {Response.data.map((permit) => (
                        <tr key={permit.id}>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.id}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.applicant.name}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.project.name}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.project.upi}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.status}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.submission_date}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.resubmission ? "Yes" : "No"}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.response_date}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.project.property.zoning.province}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.project.property.zoning.district}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.project.property.zoning.sector}</td>
                            <td className="border border-[var(--background-200)] px-4 py-2">{permit.supervisor.name}</td>
                        </tr>
                    ))}
                </tbody>
            </table>    
        </div>
        </div>
    </>
    ):
}
export default Listing;