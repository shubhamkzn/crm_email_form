import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./Navbar.jsx";
import { STARTERS } from "../pages/Starters/starter.js";

export default function BuildTemplates() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  // Function to extract just the body content from full HTML
  const extractBodyContent = (html) => {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Try to find body content
    const bodyElement = tempDiv.querySelector('body');
    if (bodyElement) {
      return bodyElement.innerHTML;
    }
    
    // If no body tag, return the original content but remove html/head/body tags
    return html
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();
  };

  // Function to create a safe preview version of the HTML
  const createPreviewHTML = (html) => {
    const bodyContent = extractBodyContent(html);
    
    // Create a simplified preview version
    return `
      <div style="
        font-family: Arial, sans-serif;
        font-size: 11px;
        line-height: 1.3;
        color: #333;
        padding: 8px;
        background: #fff;
        height: 100%;
        overflow: hidden;
        transform: scale(0.6);
        transform-origin: top left;
        width: 166%;
      ">
        ${bodyContent}
      </div>
    `;
  };

  const handleChoose = async (starter) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/api/email/uniqueid`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.status === 200) {
        const id = res.data.id;
        const templateData = {
          id,
          name: `${starter.name} - ${new Date().toLocaleString()}`,
          html: starter.html,
          config: starter.config || {},
          isEditing: false,
          isStarter: true,
        };

        toast.success("Template created! Redirecting...");

        setTimeout(() => {
          navigate(`/templates/editor/${id}`, { state: { templateData } });
        }, 800);
      }
    } catch (err) {
      console.error("Unique ID error:", err);
      toast.error(
        err.response?.data?.error ||
          "Failed to generate template ID. Please retry."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Choose a Starter
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Pick a legal website starter template or start blank.
            </p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Blank Template */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 text-center transition-colors duration-300 flex flex-col justify-between">
            <div className="h-36 mb-3 overflow-hidden rounded border dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
              <div className="text-gray-400 dark:text-gray-500 text-sm">
                Blank Canvas
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Blank Template
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Start from scratch
            </p>
            <button
              onClick={() =>
                handleChoose({
                  name: "Blank",
                  html: `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif"><div style="padding:24px">Start typing...</div></div>`,
                  config: {},
                })
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
            >
              Start Blank
            </button>
          </div>

          {/* Starter Templates */}
          {STARTERS.map((s) => (
            <div
              key={s.key}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 transition-colors duration-300 flex flex-col"
            >
              <div className="h-36 mb-3 overflow-hidden rounded border dark:border-gray-700 bg-white">
                <div className="w-full h-full">
                  <div
                    className="w-full h-full overflow-hidden"
                    dangerouslySetInnerHTML={{ 
                      __html: createPreviewHTML(s.html)
                    }}
                  />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {s.name}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {s.preview}
              </p>
              <button
                onClick={() => handleChoose(s)}
                className="mt-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-300"
              >
                Use Starter
              </button>
            </div>
          ))}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}