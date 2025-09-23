import React, { useState } from "react";

const EmailCard = ({ email }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
      {/* Compact row */}
      <div
        className="flex justify-between items-center px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="font-medium text-gray-800 dark:text-gray-100">
            {email.subject || "No Subject"}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {email.sender || "Unknown sender"} - {email.body?.slice(0, 50)}...
          </div>
        </div>
        <div className="text-sm text-gray-400 dark:text-gray-300 ml-4 whitespace-nowrap">
          {new Date(email.date_sent || email.created_at).toLocaleString()}
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
          <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <div><strong className="dark:text-gray-200">From:</strong> {email.sender}</div>
            <div><strong className="dark:text-gray-200">To:</strong> {email.recipient || "N/A"}</div>
            <div><strong className="dark:text-gray-200">Date:</strong> {new Date(email.date_sent || email.created_at).toLocaleString()}</div>
          </div>
          <div
            className="prose max-w-full text-gray-800 dark:text-gray-100"
            dangerouslySetInnerHTML={{ __html: email.body || "<p>No content</p>" }}
          />
        </div>
      )}
    </div>
  );
};

export default EmailCard;
