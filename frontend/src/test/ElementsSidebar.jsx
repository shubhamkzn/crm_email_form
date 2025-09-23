import React from 'react';
import { 
  Heading1, FileText, Plus, Image, SplitSquareVertical, 
  Minus, Quote, List 
} from 'lucide-react';

const ElementsSidebar = ({ snippets, insertSnippet }) => {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-5">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
          Quick Elements
        </h3>
        <div className="space-y-2">
          {snippets.map((snippet, index) => (
            <button
              key={index}
              onClick={() => {
                if (snippet.action === 'image') {
                  const url = prompt('Enter image URL:', 'https://');
                  if (url) {
                    const imgCode = `<div style="text-align: center; margin: 20px 0;">
  <img src="${url}" alt="Image" style="max-width: 100%; height: auto; border-radius: 4px;" />
</div>`;
                    insertSnippet(imgCode);
                  }
                } else if (snippet.code) {
                  insertSnippet(snippet.code);
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <span className="text-gray-500 group-hover:text-gray-700">
                {snippet.icon}
              </span>
              <span className="text-sm font-medium text-gray-700">{snippet.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ElementsSidebar;