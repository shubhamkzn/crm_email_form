import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Mail, Send, Eye, Save, Download, Copy, Upload, Trash2, 
  ChevronDown, Loader2, Check, AlertCircle, X, Monitor, 
  Smartphone, Plus, Minus, Quote, List as ListIcon,
  Heading1, FileText, Image as ImageIcon, SplitSquareVertical
} from 'lucide-react';
import HtmlEditor from './HtmlEditor';
import ElementsSidebar from './ElementsSidebar';
import { sanitizeHtml } from './htmlUtils';

export default function EmailBuilder() {
  const { templateId } = useParams();
  const location = useLocation();
  const fileInputRef = useRef(null);

  // State
  const [emailConfig, setEmailConfig] = useState({
    templateId: templateId,
    brand: '',
    to: '',
    cc: '',
    bcc: '',
    fromName: '',
    fromEmail: '',
    replyTo: '',
    subject: ''
  });

  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [html, setHtml] = useState('');
  const [activeTab, setActiveTab] = useState('visual');
  const [splitView, setSplitView] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [templates, setTemplates] = useState({});
  const [lastSaved, setLastSaved] = useState(new Date());
  const [selectedFont, setSelectedFont] = useState('Arial');
  const [selectedFontSize, setSelectedFontSize] = useState('3');

  // Font families
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' }
  ];

  // Font sizes mapping
  const fontSizeMap = {
    '1': '10px',
    '2': '13px',
    '3': '16px',
    '4': '18px',
    '5': '24px',
    '6': '32px',
    '7': '48px'
  };

  // Show notification
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/email/brands`);
        if (!res.ok) throw new Error("Failed to fetch brands");

        const data = await res.json();
        setBrands(data);
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to load brands");
      }
    };

    fetchBrands();
  }, [showNotification]);

  useEffect(() => {
    const templateData = location.state?.templateData;

    if (templateData) {
      if (templateData.html) {
        setHtml(sanitizeHtml(templateData.html));
        addToHistory(templateData.html);
      }

      if (templateData.config) {
        setEmailConfig(prev => ({
          ...prev,
          ...templateData.config,
          templateId: templateData.id
        }));
      }

      setTemplates(prev => ({
        ...prev,
        [templateData.id]: {
          id: templateData.id,
          name: templateData.name,
          html: templateData.html,
          config: templateData.config
        }
      }));

      if (templateData.isStarter) {
        showNotification("success", `Starter "${templateData.name}" loaded`);
      } else if (templateData.isEditing) {
        showNotification("success", `Template "${templateData.name}" loaded for editing`);
      }
    }
  }, [location.state, showNotification]);

  // Add new brand
  const addNewBrand = useCallback(async () => {
    if (newBrandName.trim()) {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/email/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newBrandName.trim() }),
        });

        if (!res.ok) throw new Error("Failed to add brand");

        const brand = await res.json();

        setBrands((prev) => [...prev, brand]);
        setEmailConfig((prev) => ({ ...prev, brand: brand.name }));
        setNewBrandName("");
        setShowBrandModal(false);
        showNotification("success", "Brand added");
      } catch (err) {
        console.error(err);
        showNotification("error", "Failed to add brand");
      }
    }
  }, [newBrandName, setEmailConfig, showNotification]);

  // History management
  const addToHistory = useCallback((content) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), content];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtml(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHtml(history[newIndex]);
    }
  }, [history, historyIndex]);

  // Enhanced visual input handler
  const handleVisualInput = useCallback(() => {
    // This will be handled by the HtmlEditor component
  }, []);

  // Code editor change handler
  const handleCodeChange = useCallback((e) => {
    const newHtml = e.target.value;
    setHtml(newHtml);
    addToHistory(newHtml);
  }, [addToHistory]);

  // Enhanced formatting function
  const applyFormatting = useCallback((command, value = null) => {
    // This will be handled by the HtmlEditor component
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result;
        if (imgUrl) {
          const imgCode = `<div style="text-align: center; margin: 20px 0;">
            <img src="${imgUrl}" alt="Uploaded image" style="max-width: 100%; height: auto; border-radius: 4px;" />
          </div>`;
          insertSnippet(imgCode);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Insert snippet at cursor
  const insertSnippet = useCallback((snippetHtml) => {
    if (activeTab === 'visual') {
      // This will be handled by the HtmlEditor component
    } else {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newHtml = html.substring(0, start) + '\n' + snippetHtml + '\n' + html.substring(end);
        setHtml(newHtml);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + snippetHtml.length + 2;
          textarea.focus();
        }, 0);
      }
    }
    showNotification('success', 'Element added');
  }, [activeTab, html, showNotification]);

  // Auto-save
  useEffect(() => {
    const saveInterval = setInterval(() => {
      setLastSaved(new Date());
      localStorage.setItem('emailBuilder_autosave', JSON.stringify({
        html,
        emailConfig,
        timestamp: new Date().toISOString()
      }));
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [html, emailConfig]);

  // Email validation
  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];
    
    if (!emailConfig.to.trim()) {
      errors.push('Recipient email is required');
    }
    if (!emailConfig.fromEmail || !emailRegex.test(emailConfig.fromEmail)) {
      errors.push('Valid sender email is required');
    }
    if (!emailConfig.subject.trim()) {
      errors.push('Subject is required');
    }
    
    return errors;
  }, [emailConfig]);

  // Send email
  const sendEmail = useCallback(async () => {
    const errors = validateEmail();
    if (errors.length > 0) {
      showNotification('error', errors[0]);
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNotification('success', 'Email sent successfully');
    } catch (error) {
      showNotification('error', 'Failed to send email');
    } finally {
      setIsLoading(false);
    }
  }, [validateEmail, showNotification]);

  // Export HTML
  const downloadHtml = useCallback(() => {
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${emailConfig.subject || 'Email'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    ${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${emailConfig.templateId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('success', 'Downloaded successfully');
  }, [html, emailConfig, showNotification]);

  // Copy HTML
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html);
      showNotification('success', 'Copied to clipboard');
    } catch (error) {
      showNotification('error', 'Failed to copy');
    }
  }, [html, showNotification]);

  // Import HTML
  const handleFileImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const newHtml = bodyMatch ? bodyMatch[1] : content;
        setHtml(sanitizeHtml(newHtml));
        showNotification('success', 'Imported successfully');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, [showNotification]);

  // Save template
  const saveTemplate = useCallback(async () => {
    const name = prompt("Template name:");
    if (!name?.trim()) return;

    const template = {
      id: templateId,
      name: name.trim(),
      html,
      config: emailConfig,
      created: new Date().toISOString()
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/email/savetemplate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      const data = await res.json();

      if (res.ok) {
        setTemplates((prev) => ({ ...prev, [template.id]: template }));
        showNotification("success", `Template saved: ${template.id}`);
      } else {
        showNotification("error", `Error: ${data.message || "Failed to save"}`);
        console.error("Save template error:", data);
      }
    } catch (err) {
      showNotification("error", `Error: ${err.message}`);
      console.error("Save template exception:", err);
    }
  }, [html, emailConfig, showNotification, templateId]);

  // Load template
  const loadTemplate = useCallback((id) => {
    const template = templates[id];
    if (template) {
      setHtml(sanitizeHtml(template.html));
      setEmailConfig(prev => ({ ...prev, ...template.config }));
      showNotification('success', 'Template loaded');
    }
  }, [templates, showNotification]);

  // Snippets
  const snippets = useMemo(() => [
    {
      name: 'Heading',
      icon: <Heading1 className="w-3.5 h-3.5" />,
      code: `<h1 style="color: #1a1a1a; font-size: 28px; font-weight: 600; margin: 20px 0;">Heading Text</h1>`
    },
    {
      name: 'Paragraph',
      icon: <FileText className="w-3.5 h-3.5" />,
      code: `<p style="color: #4a4a4a; font-size: 16px; line-height: 1.6; margin: 15px 0;">Your paragraph text here.</p>`
    },
    {
      name: 'Button',
      icon: <Plus className="w-3.5 h-3.5" />,
      code: `<div style="text-align: center; margin: 25px 0;">
  <a href="https://example.com" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Click Here</a>
</div>`
    },
    {
      name: 'Image',
      icon: <ImageIcon className="w-3.5 h-3.5" />,
      action: 'image'
    },
    {
      name: '2 Columns',
      icon: <SplitSquareVertical className="w-3.5 h-3.5" />,
      code: `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
  <tr>
    <td width="50%" style="padding: 15px; vertical-align: top;">
      <h3 style="color: #1a1a1a; margin: 0 0 10px 0;">Column 1</h3>
      <p style="color: #4a4a4a; margin: 0;">Content here</p>
    </td>
    <td width="50%" style="padding: 15px; vertical-align: top;">
      <h3 style="color: #1a1a1a; margin: 0 0 10px 0;">Column 2</h3>
      <p style="color: #4a4a4a; margin: 0;">Content here</p>
    </td>
  </tr>
</table>`
    },
    {
      name: 'Divider',
      icon: <Minus className="w-3.5 h-3.5" />,
      code: `<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 25px 0;" />`
    },
    {
      name: 'Quote',
      icon: <Quote className="w-3.5 h-3.5" />,
      code: `<blockquote style="border-left: 3px solid #2563eb; padding-left: 20px; margin: 20px 0; color: #4a4a4a; font-style: italic;">
  "Your quote here"
</blockquote>`
    },
    {
      name: 'List',
      icon: <ListIcon className="w-3.5 h-3.5" />,
      code: `<ul style="color: #4a4a4a; margin: 15px 0; padding-left: 25px;">
  <li style="margin: 8px 0;">Item 1</li>
  <li style="margin: 8px 0;">Item 2</li>
  <li style="margin: 8px 0;">Item 3</li>
</ul>`
    }
  ], []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Premium Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-5 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                <Mail className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Email Builder Pro</h1>
                <p className="text-xs text-gray-500 font-medium">ID: {emailConfig.templateId}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>Auto-saved {lastSaved.toLocaleTimeString()}</span>
              </div>
              
              <button
                onClick={sendEmail}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-sm text-sm font-medium"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Email
              </button>
              
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm"
              >
                <Eye size={14} />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Configuration Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Configuration Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">
                Email Configuration
              </h3>
              
              <div className="space-y-4">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Brand</label>
                  <div className="relative">
                    <select
                      value={emailConfig.brand}
                      onChange={(e) => {
                        if (e.target.value === 'add-new') {
                          setShowBrandModal(true);
                        } else {
                          setEmailConfig(prev => ({ ...prev, brand: e.target.value }));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.name}>{brand.name}</option>
                      ))}
                      <option value="add-new" className="font-medium">+ Add New Brand</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    value={emailConfig.subject}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter subject line"
                  />
                </div>

                {/* From Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">From Name *</label>
                    <input
                      type="text"
                      value={emailConfig.fromName}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">From Email *</label>
                    <input
                      type="email"
                      value={emailConfig.fromEmail}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Reply To */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Reply To</label>
                  <input
                    type="email"
                    value={emailConfig.replyTo}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, replyTo: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="reply@example.com"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">To *</label>
                  <input
                    type="text"
                    value={emailConfig.to}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="recipient@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>

                {/* CC & BCC */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">CC</label>
                    <input
                      type="text"
                      value={emailConfig.cc}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, cc: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="cc@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">BCC</label>
                    <input
                      type="text"
                      value={emailConfig.bcc}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, bcc: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="bcc@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-5 space-y-2">
              <button
                onClick={saveTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Save size={14} />
                Save as Template
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadHtml}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Download size={14} />
                  Export
                </button>
                
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <Copy size={14} />
                  Copy
                </button>
              </div>
              
              <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer">
                <Upload size={14} />
                Import HTML
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            {/* Templates */}
            {Object.keys(templates).length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wider">
                  Saved Templates
                </h3>
                <div className="space-y-2">
                  {Object.values(templates).map(template => (
                    <div key={template.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => loadTemplate(template.id)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm font-medium text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">ID: {template.id}</div>
                      </button>
                      <button
                        onClick={() => {
                          const newTemplates = { ...templates };
                          delete newTemplates[template.id];
                          setTemplates(newTemplates);
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Editor Area */}
        <main className="flex-1 flex flex-col bg-white">
          <HtmlEditor
            html={html}
            setHtml={setHtml}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            splitView={splitView}
            setSplitView={setSplitView}
            history={history}
            historyIndex={historyIndex}
            addToHistory={addToHistory}
            undo={undo}
            redo={redo}
            applyFormatting={applyFormatting}
            handleVisualInput={handleVisualInput}
            handleCodeChange={handleCodeChange}
            handleImageUpload={handleImageUpload}
            snippets={snippets}
            insertSnippet={insertSnippet}
            fontFamilies={fontFamilies}
            fontSizeMap={fontSizeMap}
            selectedFont={selectedFont}
            setSelectedFont={setSelectedFont}
            selectedFontSize={selectedFontSize}
            setSelectedFontSize={setSelectedFontSize}
          />
        </main>

        {/* Elements Sidebar */}
        <ElementsSidebar snippets={snippets} insertSnippet={insertSnippet} />
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-7xl h-full rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <Monitor size={14} className="inline mr-1.5" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <Smartphone size={14} className="inline mr-1.5" />
                    Mobile
                  </button>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-100 p-8">
              <div className={`mx-auto bg-white rounded-lg shadow-lg ${
                previewMode === 'mobile' ? 'max-w-sm' : 'max-w-5xl'
              }`}>
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 rounded-t-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-medium">From:</span> {emailConfig.fromName || 'Sender'} &lt;{emailConfig.fromEmail || 'sender@example.com'}&gt;</div>
                    <div><span className="font-medium">To:</span> {emailConfig.to || 'recipient@example.com'}</div>
                    <div><span className="font-medium">Subject:</span> {emailConfig.subject || 'Email Subject'}</div>
                  </div>
                </div>
                <div className="p-6">
                  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) || '<p style="color: #999; text-align: center;">Empty email content</p>' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brand Modal */}
      {showBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowBrandModal(false);
                    setNewBrandName('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewBrand}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Brand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? 
              <Check size={16} /> : 
              <AlertCircle size={16} />
            }
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}