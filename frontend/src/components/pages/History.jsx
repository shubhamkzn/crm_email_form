import React, { useEffect, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import Navbar from "./Navbar.jsx";
import { useDarkModeContext } from "../context/DarkModeContext.jsx"; // centralized dark mode

const PAGE_SIZE = 10;

const History = () => {
  const { isDark } = useDarkModeContext(); // use centralized dark mode
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/email/brands");
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };
    fetchBrands();
  }, []);

  // Fetch logs
  const fetchLogs = async (brand, page = 1) => {
    if (!brand) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/email/getdata/${brand}?page=${page}&limit=${PAGE_SIZE}`
      );
      const data = await res.json();
      setLogs(data.data || []);
      setHasNextPage(data.data.length === PAGE_SIZE);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
      setHasNextPage(false);
    }
    setLoading(false);
  };

  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setCurrentPage(1);
    fetchLogs(brand, 1);
  };

  const handlePrev = () => fetchLogs(selectedBrand, currentPage - 1);
  const handleNext = () => fetchLogs(selectedBrand, currentPage + 1);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300">
         {/* <Navbar /> */}


      <div className="p-6 max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-xl border shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <HistoryIcon className="w-5 h-5" />
                History
              </h1>
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                View logs of all email activities and transactions
              </p>
            </div>
          </div>
        </div>

        {/* Brand Selector */}
        <div className="flex gap-4 mb-6 items-center flex-wrap">
          <select
            className="border rounded-lg p-2 focus:ring-2 focus:ring-rose-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            value={selectedBrand}
            onChange={handleBrandChange}
          >
            <option value="">Select a brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto border rounded-lg shadow-sm bg-white dark:bg-gray-800">
          {loading ? (
            <div className="p-6 text-center text-gray-900 dark:text-gray-100">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No logs available
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  {Object.keys(logs[0]).map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      {col.replace(/_/g, " ").toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 text-sm text-gray-800 dark:text-gray-100">
                        {String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {(currentPage > 1 || hasNextPage) && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-900 dark:text-gray-100">{currentPage}</span>
            <button
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              onClick={handleNext}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
