import React, { useEffect, useState } from "react";
import axios from "axios";

const PAGE_SIZE = 10;

const SeeAllData = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    region: "",
    brand: "",
    website: "",
    template: "",
    status: ""
  });
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    brands: [],
    websites: [],
    templates: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/emaillogs/filters`);
        setFilterOptions({
          regions: res.data.regions || [],
          brands: res.data.brands || [],
          websites: res.data.websites || [],
          templates: res.data.templates || []
        });
      } catch (err) {
        console.error("Failed to fetch filter options:", err);
      }
    };
    fetchFilters();
  }, []);

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...filters,
        page,
        limit: PAGE_SIZE
      }).toString();

      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/emaillogs/logs?${query}`);
      setLogs(res.data.data || []);
      setHasNextPage(res.data.data.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApplyFilters = () => fetchLogs(1);
  const handlePrev = () => fetchLogs(currentPage - 1);
  const handleNext = () => fetchLogs(currentPage + 1);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">All Email Logs</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Region", name: "region", options: filterOptions.regions },
          { label: "Brand", name: "brand", options: filterOptions.brands },
          { label: "Website", name: "website", options: filterOptions.websites },
          { label: "Template", name: "template", options: filterOptions.templates },
          { label: "Status", name: "status", options: ["sent", "failed"] }
        ].map((filter) => (
          <select
            key={filter.name}
            name={filter.name}
            value={filters[filter.name]}
            onChange={handleFilterChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">{filter.label} (All)</option>
            {filter.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}

        <button
          onClick={handleApplyFilters}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors w-full"
        >
          Apply
        </button>
      </div>

      {/* Logs */}
      {loading ? (
        <p>Loading...</p>
      ) : logs.length === 0 ? (
        <p>No email logs found</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="border border-gray-300 rounded shadow-sm p-4 bg-white">
              <p><span className="font-semibold">Page:</span> {log.page_name}</p>
              <p><span className="font-semibold">Brand:</span> {log.brand_name}</p>
              <p><span className="font-semibold">Region:</span> {log.region_name}</p>
              <p><span className="font-semibold">Website:</span> {log.website_name}</p>
              <p><span className="font-semibold">Template:</span> {log.template_id}</p>
              <p><span className="font-semibold">Status:</span> {log.status}</p>
              <p className="font-semibold mt-2">Email Content:</p>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto max-h-48 whitespace-pre-wrap">
                {JSON.stringify(log.email_content, null, 2)}
              </pre>
              <p className="mt-2"><span className="font-semibold">Created At:</span> {new Date(log.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Prev
        </button>
        <span>{currentPage}</span>
        <button
          onClick={handleNext}
          disabled={!hasNextPage}
          className={`px-4 py-2 rounded ${!hasNextPage ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SeeAllData;
