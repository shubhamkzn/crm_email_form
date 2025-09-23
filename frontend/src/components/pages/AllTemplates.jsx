import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import { useDarkModeContext } from "../context/DarkModeContext.jsx"; // centralized dark mode

const AllTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark } = useDarkModeContext(); // centralized dark mode

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/email/getalltemplates`
        );
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleEdit = (template) => {
    navigate(`/templates/editor/${template.id}`, {
      state: {
        templateData: {
          id: template.id,
          name: template.name,
          html: template.html,
          config: template.config,
          isEditing: true,
        },
      },
    });
  };

  const handleCopy = async (template) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/email/copyTemplate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: template.id }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTemplates((prev) => [...prev, data.template]);
        alert(`Copied template: ${data.template.name}`);
      } else alert("Failed to copy template");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy template");
    }
  };

  const handleDelete = async (template) => {
    if (
      window.confirm(`Are you sure you want to delete "${template.name}"?`)
    ) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/email/deleteTemplate`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: template.id }),
          }
        );
        if (res.ok) {
          setTemplates((prev) =>
            prev.filter((t) => t.id !== template.id)
          );
          alert(`Deleted template: ${template.name}`);
        } else alert("Failed to delete template");
      } catch (error) {
        console.error("Delete error:", error);
        alert("Failed to delete template");
      }
    }
  };

  const handleCreateNew = () => navigate("/templates/build");

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-600 dark:text-gray-300">
        Loading templates...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Email Templates
          </h1>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <span className="text-xl font-bold">+</span> Create New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No templates found
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex justify-between items-center border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {template.name[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                      {template.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Template ID:{" "}
                      <span className="font-mono">{template.id}</span>
                    </p>
                    {template.created && (
                      <p className="text-gray-400 dark:text-gray-500 text-xs">
                        Created:{" "}
                        {new Date(template.created).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(template);
                    }}
                    className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-medium rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(template);
                    }}
                    className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 font-medium rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition"
                  >
                    Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template);
                    }}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 font-medium rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTemplates;
