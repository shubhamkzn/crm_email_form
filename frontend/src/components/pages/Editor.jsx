import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { flushSync } from 'react-dom';
import {
  Download, Copy, Send, Eye, Save, Upload, Trash2, Settings, Mail,
  Smartphone, Monitor, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, Type, Palette, Link, Image, List, Plus, ChevronDown,
  X, Check, AlertCircle, Undo, Redo, Code, FileText,
  Hash, Zap, Loader2, Strikethrough, ListOrdered, Link2,
  Indent, Outdent, Minus, SplitSquareVertical, FileImage,
  Heading1, Heading2, Heading3, Quote, Eraser
} from "lucide-react";
import { useParams, useLocation, useNavigate } from "react-router-dom";


// Sanitize HTML
const sanitizeHtml = (html) => {
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

export default function EmailBuilder() {
  // Refs
  const { templateId } = useParams();
  const visualIframeRef = useRef(null);
  const codeEditorRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageFileRef = useRef(null);
  const colorInputRef = useRef(null);
  const bgColorInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const initialIframeSrcDoc = useMemo(() => `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        outline: none;
        min-height: calc(100vh - 40px);
      }
      body:empty:before {
        content: "Start typing or add elements from the sidebar...";
        color: #999;
        font-style: italic;
      }
    </style>
  </head>
  <body contenteditable="true"></body>
</html>`, []);


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

  // Get iframe document and body
  const getIframeDocument = useCallback(() => {
    return visualIframeRef.current?.contentDocument;
  }, []);

  const getIframeBody = useCallback(() => {
    const doc = getIframeDocument();
    return doc?.body;
  }, [getIframeDocument]);

  // Show notification
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Fetch brands
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

  // Handle template data from location state
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
  }, []);

  // Add brand
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


  const handleVisualInput = useCallback(() => {
    const body = getIframeBody();
    if (body) {
      const newHtml = body.innerHTML;
      if (newHtml !== html) {
        setHtml(newHtml);
        addToHistory(newHtml);
      }
    }
  }, [getIframeBody, html, addToHistory]);

  // --- INSERT: synchronous flush before switching to Code view ---
  const switchToCode = useCallback(() => {
  try {
    const body = getIframeBody();
    if (body) {
      const newHtml = sanitizeHtml(body.innerHTML || '');
      // Force React to synchronously update html state so the code view receives it immediately
      flushSync(() => setHtml(newHtml));
      // If the code textarea is mounted, set its DOM value immediately (defensive)
      if (codeEditorRef.current) {
        try { codeEditorRef.current.value = newHtml; } catch (err) { /* ignore */ }
      }
    }
  } catch (err) {
    // defensive: ignore
  }
  // Now switch - after html is guaranteed flushed
  setActiveTab('code');
  setSplitView(false);
}, [getIframeBody]);



  // Code editor change handler
  const handleCodeChange = useCallback((e) => {
    const newHtml = e.target.value;
    setHtml(newHtml);
    addToHistory(newHtml);
  }, [addToHistory]);


  // --- INSERT: switchToVisual to synchronously flush code -> visual before switching ---
  const switchToVisual = useCallback(() => {
  try {
    // Read the DOM textarea directly to capture the latest user edits
    const currentCode = codeEditorRef.current ? codeEditorRef.current.value : null;
    const newHtml = sanitizeHtml(typeof currentCode === 'string' ? currentCode : html || '');
    // Force React to synchronously update html state
    flushSync(() => setHtml(newHtml));
    // Immediately write into iframe body (if present) so the visual shows instantly
    try {
      const body = getIframeBody();
      if (body) {
        body.innerHTML = newHtml;
      }
    } catch (err) {
      // ignore if iframe inaccessible
    }
  } catch (err) {
    // defensive ignore
  }

  // Switch view after state/body updated
  setActiveTab('visual');
  setSplitView(false);
}, [getIframeBody, html]);



  // Enhanced formatting function for iframe
  const applyFormatting = useCallback((command, value = null) => {
    const iframeDoc = getIframeDocument();
    const body = getIframeBody();

    if (!iframeDoc || !body) return;

    // Focus the iframe body first
    body.focus();

    try {
      let success = false;

      switch (command) {
        case 'bold':
        case 'italic':
        case 'underline':
        case 'strikethrough':
          iframeDoc.execCommand(command, false, null);
          success = true;
          break;

        case 'fontSize':
          iframeDoc.execCommand('fontSize', false, value);
          success = true;
          break;

        case 'fontName':
          iframeDoc.execCommand('fontName', false, value);
          success = true;
          break;

        case 'foreColor':
          iframeDoc.execCommand('foreColor', false, value);
          success = true;
          break;

        case 'hiliteColor':
        case 'backColor':
          if (!iframeDoc.execCommand('hiliteColor', false, value)) {
            iframeDoc.execCommand('backColor', false, value);
          }
          success = true;
          break;

        case 'justifyLeft':
        case 'justifyCenter':
        case 'justifyRight':
        case 'justifyFull':
          iframeDoc.execCommand(command, false, null);
          success = true;
          break;

        case 'insertUnorderedList':
        case 'insertOrderedList':
          iframeDoc.execCommand(command, false, null);
          success = true;
          break;

        case 'indent':
        case 'outdent':
          iframeDoc.execCommand(command, false, null);
          success = true;
          break;

        case 'formatBlock':
          iframeDoc.execCommand('formatBlock', false, value);
          success = true;
          break;

        case 'createLink':
          const selection = iframeDoc.getSelection();
          if (selection.toString()) {
            const url = prompt('Enter URL:', 'https://');
            if (url) {
              iframeDoc.execCommand('createLink', false, url);
              // Make links blue and underlined
              const links = body.getElementsByTagName('a');
              for (let link of links) {
                if (!link.style.color) {
                  link.style.color = '#0066cc';
                  link.style.textDecoration = 'underline';
                }
              }
              success = true;
            }
          } else {
            alert('Please select text first');
          }
          break;

        case 'unlink':
          iframeDoc.execCommand('unlink', false, null);
          success = true;
          break;

        case 'insertImage':
          const imgUrl = prompt('Enter image URL:', 'https://');
          if (imgUrl) {
            iframeDoc.execCommand('insertImage', false, imgUrl);
            // Style images
            setTimeout(() => {
              const images = body.getElementsByTagName('img');
              const lastImg = images[images.length - 1];
              if (lastImg) {
                lastImg.style.maxWidth = '100%';
                lastImg.style.height = 'auto';
              }
            }, 100);
            success = true;
          }
          break;

        case 'insertHorizontalRule':
          iframeDoc.execCommand('insertHorizontalRule', false, null);
          success = true;
          break;

        case 'removeFormat':
          iframeDoc.execCommand('removeFormat', false, null);
          success = true;
          break;

        case 'blockquote':
          iframeDoc.execCommand('formatBlock', false, 'blockquote');
          success = true;
          break;
      }

      if (success) {
        handleVisualInput();
      }
    } catch (error) {
      console.error('Formatting error:', error);
    }
  }, [getIframeDocument, getIframeBody, handleVisualInput]);


  // --- REPLACE previous setupIframeListeners / handleIframeLoad logic with this effect ---
  useEffect(() => {
    const iframe = visualIframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    const body = doc?.body;
    if (!doc || !body) return;

    // Ensure the body is editable and has the intended style
    try {
      body.setAttribute('contenteditable', 'true');
      body.style.outline = 'none';
    } catch (err) {
      // ignore if setting attribute fails
    }

    // Initialize body content once if it differs (keeps code -> visual sync)
    const sanitized = sanitizeHtml(html);
    if (body.innerHTML !== sanitized) {
      body.innerHTML = sanitized;
    }

    // Input handler: push visual changes into React state (keeps code view synced)
    const handleInput = () => {
      const newHtml = body.innerHTML;
      // Update state and history (same behaviour as before)
      setHtml(newHtml);
      addToHistory(newHtml);
    };

    // Keydown handler: capture Ctrl/Cmd shortcuts (same behaviour)
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            applyFormatting('bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormatting('italic');
            break;
          case 'u':
            e.preventDefault();
            applyFormatting('underline');
            break;
          case 'z':
            e.preventDefault();
            undo();
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    body.addEventListener('input', handleInput);
    doc.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount or when dependencies change
    return () => {
      try {
        body.removeEventListener('input', handleInput);
        doc.removeEventListener('keydown', handleKeyDown);
      } catch (err) {
        // iframe might be unloaded already
      }
    };
    // Keep dependency list limited so we do not reattach listeners on every keystroke.
    // We include handler functions that are declared with useCallback so this effect reruns only when those change.
  }, [visualIframeRef, applyFormatting, addToHistory, undo, redo]);


  // Enhanced visual input handler for iframe


  // Insert snippet at cursor for iframe
  const insertSnippet = useCallback((snippetHtml) => {
    if (activeTab === 'visual') {
      const iframeDoc = getIframeDocument();
      const body = getIframeBody();

      if (iframeDoc && body) {
        body.focus();
        iframeDoc.execCommand('insertHTML', false, snippetHtml);
        handleVisualInput();
      }
    } else if (codeEditorRef.current) {
      const textarea = codeEditorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newHtml = html.substring(0, start) + '\n' + snippetHtml + '\n' + html.substring(end);
      setHtml(newHtml);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + snippetHtml.length + 2;
        textarea.focus();
      }, 0);
    }
    showNotification('success', 'Element added');
  }, [activeTab, html, getIframeDocument, getIframeBody, handleVisualInput, showNotification]);

  // Handle image upload for iframe
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result;
        if (imgUrl) {
          const iframeDoc = getIframeDocument();
          const body = getIframeBody();

          if (iframeDoc && body) {
            body.focus();
            iframeDoc.execCommand('insertImage', false, imgUrl);
            handleVisualInput();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  }, [getIframeDocument, getIframeBody, handleVisualInput]);

  // Simplified iframe load handler: ensure body has current HTML when iframe finishes loading
  const handleIframeLoad = useCallback(() => {
    const body = getIframeBody();
    if (body) {
      const sanitized = sanitizeHtml(html);
      if (body.innerHTML !== sanitized) {
        body.innerHTML = sanitized;
      }
      // Ensure editable attribute (defensive)
      try { body.setAttribute('contenteditable', 'true'); body.style.outline = 'none'; } catch (err) { }
    }
  }, [getIframeBody, html]);


  // Sync iframe content when html changes
  useEffect(() => {
    if (activeTab === 'visual') {
      const body = getIframeBody();
      if (body && body.innerHTML !== html) {
        body.innerHTML = sanitizeHtml(html);
      }
    }
  }, [html, activeTab, getIframeBody]);

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'visual') {
      setSplitView(false);
    }
  }, [activeTab]);

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
  // const sendEmail = useCallback(async () => {
  //   const errors = validateEmail();
  //   if (errors.length > 0) {
  //     showNotification('error', errors[0]);
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 2000));
  //     showNotification('success', 'Email sent successfully');
  //   } catch (error) {
  //     showNotification('error', 'Failed to send email');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [validateEmail, showNotification]);
  const sendEmail = () => {
    navigate("/templates/existing")
  }

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
  }, [html, emailConfig, showNotification]);

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
      icon: <Image className="w-3.5 h-3.5" />,
      action: 'image'
    },
    //     {
    //       name: '2 Columns',
    //       icon: <SplitSquareVertical className="w-3.5 h-3.5" />,
    //       code: `<table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
    //   <tr>
    //     <td width="50%" style="padding: 15px; vertical-align: top;">
    //       <h3 style="color: #1a1a1a; margin: 0 0 10px 0;">Column 1</h3>
    //       <p style="color: #4a4a4a; margin: 0;">Content here</p>
    //     </td>
    //     <td width="50%" style="padding: 15px; vertical-align: top;">
    //       <h3 style="color: #1a1a1a; margin: 0 0 10px 0;">Column 2</h3>
    //       <p style="color: #4a4a4a; margin: 0;">Content here</p>
    //     </td>
    //   </tr>
    // </table>`
    //     },
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
      icon: <List className="w-3.5 h-3.5" />,
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
                <h1 className="text-lg font-semibold text-gray-900">KaiMail</h1>
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
                See Mail
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
        {/* Premium Sidebar */}
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

                {/* Text Format */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={() => applyFormatting('bold')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('italic')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('underline')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Underline (Ctrl+U)"
                  >
                    <Underline size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('strikethrough')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                    title="Strikethrough"
                  >
                    <Strikethrough size={15} />
                  </button>
                </div>

                {/* Colors */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="relative">
                    <button
                      className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                      title="Text Color"
                    >
                      <Type size={15} />
                      <input
                        ref={colorInputRef}
                        type="color"
                        onChange={(e) => applyFormatting('foreColor', e.target.value)}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                        defaultValue="#000000"
                      />
                    </button>
                  </div>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <div className="relative">
                    <button
                      className="flex items-center gap-1.5 px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                      title="Background Color"
                    >
                      <Palette size={15} />
                      <input
                        ref={bgColorInputRef}
                        type="color"
                        onChange={(e) => applyFormatting('hiliteColor', e.target.value)}
                        className="w-5 h-5 border border-gray-300 rounded cursor-pointer"
                        defaultValue="#ffffff"
                      />
                    </button>
                  </div>
                </div>

                {/* Headings */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={() => applyFormatting('formatBlock', 'H1')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                    title="Heading 1"
                  >
                    <Heading1 size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('formatBlock', 'H2')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Heading 2"
                  >
                    <Heading2 size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('formatBlock', 'H3')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Heading 3"
                  >
                    <Heading3 size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('formatBlock', 'P')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                    title="Paragraph"
                  >
                    <FileText size={15} />
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={() => applyFormatting('justifyLeft')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                    title="Align Left"
                  >
                    <AlignLeft size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('justifyCenter')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Align Center"
                  >
                    <AlignCenter size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('justifyRight')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-r-lg"
                    title="Align Right"
                  >
                    <AlignRight size={15} />
                  </button>
                </div>

                {/* Lists & Links */}
                <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={() => applyFormatting('insertUnorderedList')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors rounded-l-lg"
                    title="Bullet List"
                  >
                    <List size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('insertOrderedList')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('createLink')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Insert Link"
                  >
                    <Link2 size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => applyFormatting('insertImage')}
                    className="px-2.5 py-2 hover:bg-gray-50 transition-colors"
                    title="Insert Image URL"
                  >
                    <Image size={15} />
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <label className="px-2.5 py-2 hover:bg-gray-50 transition-colors cursor-pointer rounded-r-lg" title="Upload Image">
                    <FileImage size={15} />
                    <input
                      ref={imageFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
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
                    onClick={() => { switchToVisual(); }}

                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-l-lg ${activeTab === 'visual' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    Visual
                  </button>
                  <div className="w-px h-5 bg-gray-200"></div>
                  <button
                    onClick={() => {
                      // flush visual DOM into code state before switching
                      switchToCode();
                    }}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors ${activeTab === 'code' && !splitView ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <Code size={13} className="inline mr-1" />
                    HTML
                  </button>

                  {activeTab === 'code' && (
                    <>
                      <div className="w-px h-5 bg-gray-200"></div>
                      {/* <button
                        onClick={() => setSplitView(!splitView)}
                        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-r-lg ${
                          splitView ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        title="Split View"
                      >
                        <SplitSquareVertical size={13} className="inline mr-1" />
                        Split
                      </button> */}
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
                  ref={visualIframeRef}
                  onLoad={handleIframeLoad}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }}
                  srcDoc={initialIframeSrcDoc}
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
                      <div className="p-6 overflow-auto" style={{ height: 'calc(100% - 36px)' }}>
                        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
                      </div>
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
        </main>

        {/* Elements Sidebar */}
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
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                      }`}
                  >
                    <Monitor size={14} className="inline mr-1.5" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
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
              <div className={`mx-auto bg-white rounded-lg shadow-lg ${previewMode === 'mobile' ? 'max-w-sm' : 'max-w-5xl'
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
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${notification.type === 'success'
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