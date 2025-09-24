import React, { useEffect, useState } from "react";
import axios from "axios";

const Lead = () => {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/submission/getleads") // adjust API URL
      .then((res) => setLeads(res.data))
      .catch((err) => console.error("Error fetching leads:", err));
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Leads Dashboard</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700">#</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Phone</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Form ID</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3 text-sm text-gray-800">{lead.name || "-"}</td>
                  <td className="p-3 text-sm text-blue-600">{lead.email || "-"}</td>
                  <td className="p-3 text-sm">{lead.phone || "-"}</td>
                  <td className="p-3 text-sm">{lead.form_id}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-3 text-center text-gray-500" colSpan="6">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lead;
