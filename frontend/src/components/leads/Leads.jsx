import React, { useEffect, useState } from "react";
import axios from "axios";

const Lead = () => {
  const [leads, setLeads] = useState([]);
  const [countries, setCountries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [filters, setFilters] = useState({
    country: "",
    brand: "",
    website: "",
  });
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  const fetchBrands = async (regionId) => {
    try {
      const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/email/brands/${regionId}`);
      setBrands(res.data);
    } catch (err) {
      console.error("Error fetching brands:", err);
      setBrands([]);
    }
  };
  const fetchWebsites = async (brandId) => {
    try {
      const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/websites/${brandId}`);
      setWebsites(res.data);
    } catch (e) {
      console.log('Error fetching websites', e);
      setWebsites([]);
    }
  };
  const fetchRegion = async () => {
              try {
                  const res = await axios(`${import.meta.env.VITE_BASE_URL}/api/region`);
                  setCountries(res.data);
              } catch (e) {
                  console.log(e);
              }
          };
    
          // const 

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if(key=='country'){
      fetchBrands(value);
    }
    else if(key=='brand'){
      fetchWebsites(value);
    }
    onFilter(newFilters); // send selected filters to parent
  };

  useEffect(() => {
    axios.get("http://localhost:3000/submission/getleads") // adjust API URL
      .then((res) => { console.log(res.data); setLeads(res.data) })
      .catch((err) => console.error("Error fetching leads:", err));

      fetchRegion();
  }, []);

  return (
    <div className="p-20 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Leads Dashboard</h1>
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-2">
        {/* Country */}
        <select
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          value={filters.country}
          onChange={(e) => handleChange("country", e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.countryName}
            </option>
          ))}
        </select>

        {/* Brand */}
        <select
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          value={filters.brand}
          onChange={(e) => handleChange("brand", e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Website */}
        <select
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          value={filters.website}
          onChange={(e) => handleChange("website", e.target.value)}
        >
          <option value="">All Websites</option>
          {websites.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-700">#</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Country</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Brand</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Website</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Phone</th>
              <th className="p-3 text-sm font-semibold text-gray-700">Form ID</th>
              {/* <th className="p-3 text-sm font-semibold text-gray-700">Data</th> */}
              <th className="p-3 text-sm font-semibold text-gray-700">Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.length > 0 ? (
              leads.map((lead, index) => (
                <tr
                  key={`lead-${index}`}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                  <td className="p-3 text-sm text-gray-800">{lead.country_name || "-"}</td>
                  <td className="p-3 text-sm text-gray-800">{lead.brand_name || "-"}</td>
                  <td className="p-3 text-sm text-gray-800">{lead.website_name || "-"}</td>
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
