import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link2, Image, FileImage, 
  Eraser, Heading1, Heading2, Heading3, FileText,
  Undo, Redo, Code, SplitSquareVertical, Type, Palette
} from 'lucide-react';

// Sanitize HTML
export const sanitizeHtml = (html) => {
  const temp = document.createElement('div');
  try {
    temp.innerHTML = html;
    const scripts = temp.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      scripts[i].parentNode.removeChild(scripts[i]);
    }
    return temp.innerHTML;
  } catch (error) {
    console.error('HTML sanitization error:', error);
    return '';
  }
};

const HtmlEditor = ({
  html,
  setHtml,
  activeTab,
  setActiveTab,
  splitView,
  setSplitView,
  history,
  historyIndex,
  undo,
  redo,
  applyFormatting,
  handleVisualInput,
  handleCodeChange,
  handleImageUpload,
  fontFamilies,
  selectedFont,
  setSelectedFont,
  selectedFontSize,
  setSelectedFontSize
}) => {
  const codeEditorRef = useRef(null);
  const imageFileRef = useRef(null);
  const colorInputRef = useRef(null);
  const bgColorInputRef = useRef(null);

  // Sync visual iframe content
  useEffect(() => {
    if (activeTab === 'visual') {
      const iframe = document.getElementById('visual-iframe');
      if (iframe?.contentDocument?.body) {
        const currentHtml = iframe.contentDocument.body.innerHTML;
        if (currentHtml !== html) {
          iframe.contentDocument.body.innerHTML = sanitizeHtml(html);
        }
      }
    }
  }, [html, activeTab]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Premium Toolbar */}
      <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Undo/Redo */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="px-2.5 py-2 hover:bg-gray-50 disabled:opacity-30 transition-colors rounded-l-lg"
                title="Undo (Ctrl+Z)"
              >
                <Undo size={15} />
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="px-2.5 py-2 hover:bg-gray-50 disabled:opacity-30 transition-colors rounded-r-lg"
                title="Redo (Ctrl+Y)"
              >
                <Redo size={15} />
              </button>
            </div>

            {/* Font Family */}
            <select
              value={selectedFont}
              onChange={(e) => {
                setSelectedFont(e.target.value);
                applyFormatting('fontName', e.target.value);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              {fontFamilies.map(font => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                  {font.name}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <select
              value={selectedFontSize}
              onChange={(e) => {
                setSelectedFontSize(e.target.value);
                applyFormatting('fontSize', e.target.value);
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm"
            >
              <option value="1">10px</option>
              <option value="2">13px</option>
              <option value="3">16px</option>
              <option value="4">18px</option>
              <option value="5">24px</option>
              <option value="6">32px</option>
              <option value="7">48px</option>
            </select>

            {/* Text Formatting */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <button onClick={() => applyFormatting('bold')} className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg" title="Bold (Ctrl+B)">
                <Bold size={15} />
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button onClick={() => applyFormatting('italic')} className="px-2.5 py-2 hover:bg-gray-50 transition-colors" title="Italic (Ctrl+I)">
                <Italic size={15} />
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button onClick={() => applyFormatting('underline')} className="px-2.5 py-2 hover:bg-gray-50 transition-colors" title="Underline (Ctrl+U)">
                <Underline size={15} />
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button onClick={() => applyFormatting('strikethrough')} className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-r-lg" title="Strikethrough">
                <Strikethrough size={15} />
              </button>
            </div>

            {/* Text & Background Colors */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="relative">
                <input
                  ref={colorInputRef}
                  type="color"
                  onChange={(e) => applyFormatting('foreColor', e.target.value)}
                  className="w-8 h-8 cursor-pointer border-none bg-transparent"
                  defaultValue="#000000"
                  title="Text Color"
                />
              </div>
              <div className="w-px h-5 bg-gray-200"></div>
              <div className="relative">
                <input
                  ref={bgColorInputRef}
                  type="color"
                  onChange={(e) => applyFormatting('hiliteColor', e.target.value)}
                  className="w-8 h-8 cursor-pointer border-none bg-transparent"
                  defaultValue="#ffffff"
                  title="Background Color"
                />
              </div>
            </div>

            {/* Clear Format */}
            <button
              onClick={() => applyFormatting('removeFormat')}
              className="px-2.5 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              title="Clear Formatting"
            >
              <Eraser size={15} />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
              <button
                onClick={() => { setActiveTab('visual'); setSplitView(false); }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-l-lg ${
                  activeTab === 'visual' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                Visual
              </button>
              <div className="w-px h-5 bg-gray-200"></div>
              <button
                onClick={() => { setActiveTab('code'); setSplitView(false); }}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'code' && !splitView ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Code size={13} className="inline mr-1" />
                HTML
              </button>
              {activeTab === 'code' && (
                <>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => setSplitView(!splitView)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-r-lg ${
                      splitView ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    title="Split View"
                  >
                    <SplitSquareVertical size={13} className="inline mr-1" />
                    Split
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {activeTab === 'visual' ? (
          <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200">
            <iframe
              id="visual-iframe"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    </style>
                  </head>
                  <body contenteditable="true">${sanitizeHtml(html)}</body>
                </html>
              `}
            />
          </div>
        ) : (
          <div className="flex-1 flex">
            {splitView ? (
              <>
                {/* Code Editor */}
                <div className="w-1/2 bg-white m-4 mr-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">HTML Code</span>
                  </div>
                  <textarea
                    ref={codeEditorRef}
                    value={html}
                    onChange={handleCodeChange}
                    className="w-full h-full p-6 font-mono text-sm text-gray-800 bg-white outline-none resize-none rounded-b-lg"
                    style={{ minHeight: 'calc(100% - 36px)' }}
                    placeholder="Enter HTML code..."
                    spellCheck="false"
                  />
                </div>
                {/* Live Preview */}
                <div className="w-1/2 bg-white m-4 ml-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Live Preview</span>
                  </div>
                  <iframe
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    srcDoc={sanitizeHtml(html)}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 bg-white m-4 rounded-lg shadow-sm border border-gray-200">
                <textarea
                  ref={codeEditorRef}
                  value={html}
                  onChange={handleCodeChange}
                  className="w-full h-full p-8 font-mono text-sm text-gray-800 bg-white outline-none resize-none rounded-lg"
                  placeholder="Enter HTML code..."
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HtmlEditor;
