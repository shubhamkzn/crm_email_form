import React, { useEffect, useState } from "react";
import EmailCard from "./EmailCard";
import Navbar from "./Navbar.jsx";
import { Mail as MailIcon } from "lucide-react";
import { useDarkModeContext } from "../context/DarkModeContext.jsx"; // centralized dark mode

const PAGE_SIZE = 10;

const SeeData = () => {
  const { isDark } = useDarkModeContext(); // use centralized dark mode
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

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


      <div className="p-6 max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-xl border shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 mb-6">
          <div className="flex items-center gap-3">
            <MailIcon className="w-5 h-5" />
            <div>
              <h1 className="text-xl font-semibold">Emails</h1>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                View all email logs
              </p>
            </div>
          </div>
        </div>

        {/* Brand Selector */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <select
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
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

        {/* Logs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <div className="p-6 text-center text-gray-900 dark:text-gray-100">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No emails to display
            </div>
          ) : (
            logs.map((log, idx) => <EmailCard key={idx} email={log} />)
          )}
        </div>

        {/* Pagination */}
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

export default SeeData;
