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

  // Helper function to render email content in iframe
  const renderEmailContent = (emailContent) => {
    if (!emailContent) return null;
    
    let htmlContent;
    if (typeof emailContent === 'string') {
      // If it's already HTML string
      htmlContent = emailContent;
    } else if (typeof emailContent === 'object') {
      // If it's an object, check for common HTML properties
      htmlContent = emailContent.html || emailContent.body || JSON.stringify(emailContent, null, 2);
    } else {
      htmlContent = String(emailContent);
    }

    // Basic HTML structure if content doesn't look like HTML
    if (!htmlContent.includes('<') || !htmlContent.includes('>')) {
      htmlContent = `<pre style="white-space: pre-wrap; font-family: monospace; padding: 12px;">${htmlContent}</pre>`;
    }

    return (
      <iframe
        srcDoc={htmlContent}
        className="w-full h-64 border border-gray-200 rounded-md resize-y"
        title="Email Content"
        sandbox="allow-same-origin"
        style={{ minHeight: '200px' }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with sidebar spacing */}
      <div className="ml-64 p-6 lg:ml-72">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">All Email Logs</h2>

          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-4">
              {[
                { label: "Region", name: "region", options: filterOptions.regions },
                { label: "Brand", name: "brand", options: filterOptions.brands },
                { label: "Website", name: "website", options: filterOptions.websites },
                { label: "Template", name: "template", options: filterOptions.templates },
                { label: "Status", name: "status", options: ["sent", "failed"] }
              ].map((filter) => (
                <div key={filter.name} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {filter.label}
                  </label>
                  <select
                    name={filter.name}
                    value={filters[filter.name]}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">All {filter.label}s</option>
                    {filter.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleApplyFilters}
                disabled={loading}
                className="bg-blue-600 text-white rounded-md px-6 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Loading...' : 'Apply Filters'}
              </button>
            </div>
          </div>

          {/* Logs Section */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No email logs found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Log metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Page</span>
                          <p className="text-gray-900 font-medium">{log.page_name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Brand</span>
                          <p className="text-gray-900 font-medium">{log.brand_name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Region</span>
                          <p className="text-gray-900 font-medium">{log.region_name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website</span>
                          <p className="text-gray-900 font-medium">{log.website_name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Template</span>
                          <p className="text-gray-900 font-medium">{log.template_id || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</span>
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.status === 'sent' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email content */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Content</span>
                      </div>
                      <div className="bg-gray-50 rounded-md p-1">
                        {renderEmailContent(log.email_content)}
                      </div>
                    </div>

                    {/* Created at */}
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created At</span>
                      <p className="text-gray-900 font-medium mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {logs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 mt-8">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNext}
                    disabled={!hasNextPage}
                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      !hasNextPage 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeeAllData;