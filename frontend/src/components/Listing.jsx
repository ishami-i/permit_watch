import React from "react";
import { NavLink } from "react-router-dom";
import LocationFilters  from "./LocationFilters";

export default function Listing() {
    return (
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


                    </tr>
                </thead>
                <tbody>
                    {/* Example row */}
                    <tr className="hover:bg-[var(--background-50)]">
                        <td className="border border-[var(--background-200)] px-4 py-2">12345</td>
                        <td className="border border-[var(--background-200)] px-4 py-2">John Doe</td>
                        <td className="border border-[var(--background-200)] px-4 py-2">New Building Project</td>
                        <td className="border border-[var(--background-200)] px-4 py-2">Approved</td>
                    </tr>
                    {/* Add more rows as needed */}
                </tbody>
            </table>    
        </div>  
    ):
}
export default Listing;