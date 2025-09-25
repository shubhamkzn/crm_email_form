import React, { useEffect, useState } from "react";
import { 
  Eye, 
  Edit3, 
  Trash2, 
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useDarkModeContext } from "../../context/DarkModeContext.jsx";
import axios from "axios";
import config from "../config";

const PAGE_SIZE = 8;

const Home = () => {
  const { isDark } = useDarkModeContext();
  const [forms, setForms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchForms = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.apiUrl}/form/all?page=${page}&limit=${PAGE_SIZE}`
      );
      
      const responseData = res.data;
      const data = responseData.rows || [];
      setForms(data);
      setHasNextPage(page < responseData.totalPages);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setForms([]);
      setHasNextPage(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchForms(1);
  }, []);

  const handlePrev = () => fetchForms(currentPage - 1);
  const handleNext = () => fetchForms(currentPage + 1);

  const handleView = (form) => (window.location.href = `/forms/${form.form_id}`);
  const handleEdit = (form) => (window.location.href = `/forms/edit/${form.form_id}`);
  const handleDelete = async (formId) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      await axios.delete(`${config.apiUrl}/form/${formId}`);
      fetchForms(currentPage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forms</h1>
          </div>
        </div>

        {/* Forms List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No forms available</h3>
              <p className="text-gray-500 dark:text-gray-400">Create your first form to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {forms.map((form) => (
                <div
                  key={form.form_id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {form.page_name?.charAt(0)?.toUpperCase() || 'F'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {form.page_name || 'Untitled Form'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Country:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {form.countryName || 'Not specified'}
                            </span>
                          </div>
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">Brand:</span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {form.brand_name || 'Not specified'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(form)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(form)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(form.form_id)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(currentPage > 1 || hasNextPage) && (
          <div className="flex items-center justify-center mt-6 space-x-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage}
            </span>
            
            <button
              onClick={handleNext}
              disabled={!hasNextPage}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
