import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Download, Copy, Send, Eye, Save, Upload, Trash2, Settings, Mail, Smartphone, Monitor, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, Link, Image, List, Table, Plus } from "lucide-react";

export default function Email() {
  const visualRef = useRef(null);
  const fileInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  
  // State management
  const [html, setHtml] = useState(`
<div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #ffffff;">
  <div style="padding: 40px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
    <h1 style="margin: 0 0 16px 0; font-size: 28px; color: #ffffff; font-weight: 600;">Welcome to Our Newsletter</h1>
    <p style="margin: 0; font-size: 16px; color: #f0f0f0; line-height: 1.5;">Stay updated with our latest news and exclusive offers.</p>
  </div>
  <div style="padding: 32px 24px; background: #ffffff;">
    <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #333333;">Featured Content</h2>
    <p style="margin: 0 0 24px 0; font-size: 16px; color: #666666; line-height: 1.6;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://example.com" style="display: inline-block; padding: 14px 28px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Learn More</a>
    </div>
  </div>
  <div style="padding: 24px; background: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
    <p style="margin: 0; font-size: 14px; color: #6c757d;">© 2025 Your Company. All rights reserved.</p>
  </div>
</div>
`.trim());

  const [codeText, setCodeText] = useState(html);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [activeTab, setActiveTab] = useState('visual');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorType, setColorType] = useState('text'); // 'text' or 'background'
  const [emailConfig, setEmailConfig] = useState({
    to: '',
    subject: 'Email from Builder',
    from: 'sender@example.com'
  });
  
  // In-memory template storage
  const [templates, setTemplates] = useState({
    'modern-welcome': `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
    <h1 style="color: white; margin: 0 0 20px 0; font-size: 32px; font-weight: bold;">Welcome Aboard!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 0 0 30px 0; font-size: 18px;">Thanks for joining our community. We're excited to have you!</p>
    <a href="#" style="display: inline-block; padding: 15px 30px; background: white; color: #6366f1; text-decoration: none; border-radius: 25px; font-weight: 600;">Get Started</a>
  </div>
</div>`,
    'newsletter': `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background: white;">
  <div style="padding: 20px; border-bottom: 3px solid #3b82f6;">
    <h1 style="color: #1f2937; margin: 0; font-size: 28px;">Weekly Update</h1>
  </div>
  <div style="padding: 30px 20px;">
    <div style="margin-bottom: 30px;">
      <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 22px;">Latest News</h2>
      <p style="color: #6b7280; line-height: 1.6; margin: 0 0 15px 0;">Stay updated with our latest developments and announcements.</p>
      <a href="#" style="color: #3b82f6; text-decoration: none; font-weight: 600;">Read more →</a>
    </div>
  </div>
</div>`,
    'promotional': `
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <div style="padding: 40px 20px; text-align: center; background: linear-gradient(45deg, #f59e0b, #ef4444);">
    <h1 style="color: white; margin: 0 0 20px 0; font-size: 36px; font-weight: bold;">🔥 MEGA SALE!</h1>
    <p style="color: white; margin: 0 0 25px 0; font-size: 20px;">Up to 70% off everything - Limited time only!</p>
    <a href="#" style="display: inline-block; padding: 18px 35px; background: white; color: #ef4444; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 18px;">Shop Now</a>
  </div>
</div>`
  });

  // Show notification with auto-dismiss
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Sync visual editor with HTML state
  useEffect(() => {
    if (activeTab === 'code') {
      setCodeText(html);
    } else if (visualRef.current && visualRef.current.innerHTML !== html) {
      visualRef.current.innerHTML = html;
    }
  }, [html, activeTab]);

  // Handle visual editor input with better change detection
  const handleVisualInput = useCallback(() => {
    if (visualRef.current && activeTab === 'visual') {
      const newHtml = visualRef.current.innerHTML;
      if (newHtml !== html) {
        setHtml(newHtml);
      }
    }
  }, [html, activeTab]);

  // Handle code editor changes
  const handleCodeChange = useCallback((e) => {
    const text = e.target.value;
    setCodeText(text);
    if (activeTab === 'code') {
      setHtml(text);
    }
  }, [activeTab]);

  // Modern formatting functions with better element handling
  const applyFormatting = useCallback((command, value = null) => {
    if (!visualRef.current || activeTab !== 'visual') return;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    visualRef.current.focus();
    
    try {
      switch (command) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'fontSize':
          document.execCommand('fontSize', false, '3');
          // Apply custom size
          const fontElements = document.querySelectorAll('font[size="3"]');
          fontElements.forEach(el => {
            el.style.fontSize = value + 'px';
            el.removeAttribute('size');
          });
          break;
        case 'foreColor':
          document.execCommand('foreColor', false, value);
          break;
        case 'backColor':
          document.execCommand('backColor', false, value);
          break;
        case 'justifyLeft':
          document.execCommand('justifyLeft', false, null);
          break;
        case 'justifyCenter':
          document.execCommand('justifyCenter', false, null);
          break;
        case 'justifyRight':
          document.execCommand('justifyRight', false, null);
          break;
        case 'insertUnorderedList':
          document.execCommand('insertUnorderedList', false, null);
          break;
        case 'insertOrderedList':
          document.execCommand('insertOrderedList', false, null);
          break;
        case 'createLink':
          const url = value || prompt('Enter URL:');
          if (url) {
            document.execCommand('createLink', false, url);
          }
          break;
        case 'insertImage':
          const imgUrl = value || prompt('Enter image URL:');
          if (imgUrl) {
            document.execCommand('insertImage', false, imgUrl);
            // Style the inserted image
            setTimeout(() => {
              const images = visualRef.current.querySelectorAll('img');
              const lastImg = images[images.length - 1];
              if (lastImg) {
                lastImg.style.maxWidth = '100%';
                lastImg.style.height = 'auto';
                lastImg.style.borderRadius = '4px';
              }
            }, 100);
          }
          break;
        case 'formatBlock':
          document.execCommand('formatBlock', false, value);
          break;
        default:
          console.warn(`Unknown command: ${command}`);
      }
      
      handleVisualInput();
    } catch (error) {
      console.error('Formatting error:', error);
      showNotification('error', 'Formatting failed. Please try again.');
    }
  }, [activeTab, handleVisualInput, showNotification]);

  // Insert HTML snippets properly
  const insertSnippet = useCallback((snippetHtml) => {
    if (!visualRef.current || activeTab !== 'visual') return;
    
    visualRef.current.focus();
    
    try {
      // Use insertHTML command for better insertion
      document.execCommand('insertHTML', false, snippetHtml);
      handleVisualInput();
      showNotification('success', 'Snippet inserted successfully');
    } catch (error) {
      console.error('Insert error:', error);
      showNotification('error', 'Failed to insert snippet');
    }
  }, [activeTab, handleVisualInput, showNotification]);

  // Color picker functionality
  const handleColorChange = useCallback((color) => {
    if (colorType === 'text') {
      applyFormatting('foreColor', color);
    } else {
      applyFormatting('backColor', color);
    }
    setShowColorPicker(false);
  }, [colorType, applyFormatting]);

  // Font size options
  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];

  // Email validation
  const validateEmail = useCallback(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];

    if (!emailConfig.to.trim()) {
      errors.push('Recipient email is required');
    } else if (!emailRegex.test(emailConfig.to)) {
      errors.push('Invalid recipient email format');
    }

    if (!emailConfig.subject.trim()) {
      errors.push('Subject is required');
    }

    if (!html.trim()) {
      errors.push('Email content cannot be empty');
    }

    return errors;
  }, [emailConfig, html]);

// Send email
const sendEmail = useCallback(async () => {
  const errors = validateEmail();
  if (errors.length > 0) {
    showNotification("error", errors.join(", "));
    return;
  }

  setIsLoading(true);

  try {
    const body = {
      toEmail: emailConfig.to,        // ✅ maps correctly
      subject: emailConfig.subject,   // ✅ matches backend
      html: html,                     // ✅ editor content
      text: html.replace(/<[^>]+>/g, ""), // fallback plain text
      brand: "default_brand",         // ⚡ make dynamic later if needed
    };

    // 🔍 Log the body being sent
    console.log("📨 Sending email body:", body);

    const response = await fetch("http://localhost:3000/api/email/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    const result = await response.json();
    showNotification("success", result.message || "Email sent successfully!");
  } catch (error) {
    showNotification("error", error.message);
  } finally {
    setIsLoading(false);
  }
}, [emailConfig, html, validateEmail, showNotification]);

  // Export functions
  const downloadHtml = useCallback(() => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('success', 'HTML file downloaded');
  }, [html, showNotification]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(html);
      showNotification('success', 'HTML copied to clipboard');
    } catch (error) {
      showNotification('error', 'Failed to copy to clipboard');
    }
  }, [html, showNotification]);

  // Template management
  const saveTemplate = useCallback((name) => {
    if (!name.trim()) {
      showNotification('error', 'Template name is required');
      return;
    }
    
    setTemplates(prev => ({
      ...prev,
      [name.trim()]: html
    }));
    showNotification('success', `Template '${name}' saved`);
  }, [html, showNotification]);

  const loadTemplate = useCallback((name) => {
    if (templates[name]) {
      setHtml(templates[name]);
      showNotification('success', `Template '${name}' loaded`);
    }
  }, [templates, showNotification]);

  const deleteTemplate = useCallback((name) => {
    setTemplates(prev => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
    showNotification('success', `Template '${name}' deleted`);
  }, [showNotification]);

  // Import HTML file
  const importHtmlFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileImport = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/html' && !file.name.endsWith('.html')) {
      showNotification('error', 'Please select an HTML file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        setHtml(content);
        showNotification('success', 'HTML file imported successfully');
      }
    };
    reader.onerror = () => showNotification('error', 'Failed to read file');
    reader.readAsText(file);
    
    event.target.value = '';
  }, [showNotification]);

  // Enhanced snippets with better HTML structure
  const snippets = useMemo(() => [
    {
      name: 'Hero Section',
      preview: '🎯 Header with CTA',
      code: `<div style="padding: 50px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center; border-radius: 12px; margin: 20px 0;">
  <h1 style="color: white; margin: 0 0 20px 0; font-size: 32px; font-weight: bold;">Your Headline Here</h1>
  <p style="color: rgba(255,255,255,0.9); margin: 0 0 30px 0; font-size: 18px; line-height: 1.5;">Compelling subtitle that explains your value proposition</p>
  <a href="#" style="display: inline-block; padding: 15px 30px; background: white; color: #667eea; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px;">Get Started</a>
</div>`
    },
    {
      name: 'Content Block',
      preview: '📝 Text with image',
      code: `<div style="padding: 30px; background: white; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
  <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">Section Title</h2>
  <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">Add your content here. This is a flexible content block that you can customize with your own text, images, and styling.</p>
  <div style="text-align: center; margin: 20px 0;">
    <img src="https://via.placeholder.com/400x200/667eea/ffffff?text=Your+Image" alt="Content Image" style="max-width: 100%; height: auto; border-radius: 8px;">
  </div>
</div>`
    },
    {
      name: 'CTA Button',
      preview: '🎯 Call-to-action',
      code: `<div style="text-align: center; margin: 30px 0;">
  <a href="https://example.com" style="display: inline-block; padding: 16px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
    Call to Action
  </a>
</div>`
    },
    {
      name: 'Two Columns',
      preview: '📊 Side by side',
      code: `<div style="display: flex; gap: 20px; margin: 20px 0; flex-wrap: wrap;">
  <div style="flex: 1; min-width: 250px; padding: 20px; background: #f8fafc; border-radius: 8px;">
    <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Left Column</h3>
    <p style="color: #6b7280; margin: 0; line-height: 1.5;">Content for the left side</p>
  </div>
  <div style="flex: 1; min-width: 250px; padding: 20px; background: #f8fafc; border-radius: 8px;">
    <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Right Column</h3>
    <p style="color: #6b7280; margin: 0; line-height: 1.5;">Content for the right side</p>
  </div>
</div>`
    },
    {
      name: 'Product Card',
      preview: '🛍️ Product showcase',
      code: `<div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin: 20px 0; max-width: 300px; margin-left: auto; margin-right: auto;">
  <img src="https://via.placeholder.com/300x200/3b82f6/ffffff?text=Product" alt="Product" style="width: 100%; height: 200px; object-fit: cover;">
  <div style="padding: 20px;">
    <h3 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px; font-weight: 600;">Product Name</h3>
    <p style="color: #6b7280; margin: 0 0 15px 0; line-height: 1.5;">Short product description goes here</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="color: #059669; font-size: 24px; font-weight: bold;">$99</span>
      <a href="#" style="padding: 8px 16px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">Buy Now</a>
    </div>
  </div>
</div>`
    },
    {
      name: 'Social Media Bar',
      preview: '📱 Social links',
      code: `<div style="text-align: center; padding: 30px; background: #f8fafc; border-radius: 8px; margin: 20px 0;">
  <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">Follow Us</h3>
  <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
    <a href="#" style="display: inline-block; width: 40px; height: 40px; background: #1da1f2; border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; font-weight: bold;">T</a>
    <a href="#" style="display: inline-block; width: 40px; height: 40px; background: #4267B2; border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; font-weight: bold;">F</a>
    <a href="#" style="display: inline-block; width: 40px; height: 40px; background: #E4405F; border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; font-weight: bold;">I</a>
    <a href="#" style="display: inline-block; width: 40px; height: 40px; background: #0077b5; border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; font-weight: bold;">L</a>
  </div>
</div>`
    },
    {
      name: 'Testimonial',
      preview: '💬 Customer quote',
      code: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; color: white;">
  <div style="font-size: 48px; margin-bottom: 15px; opacity: 0.7;">"</div>
  <p style="font-size: 18px; line-height: 1.6; margin: 0 0 20px 0; font-style: italic;">This product completely transformed how we work. Highly recommended!</p>
  <div style="border-top: 1px solid rgba(255,255,255,0.3); padding-top: 20px;">
    <strong style="display: block; margin-bottom: 5px;">Jane Doe</strong>
    <span style="opacity: 0.8;">CEO, Company Inc.</span>
  </div>
</div>`
    },
    {
      name: 'Footer',
      preview: '📄 Email footer',
      code: `<div style="background: #1f2937; color: #d1d5db; padding: 40px 30px; text-align: center; margin-top: 40px;">
  <div style="margin-bottom: 20px;">
    <h3 style="color: white; margin: 0 0 10px 0; font-size: 20px;">Company Name</h3>
    <p style="margin: 0; opacity: 0.8; font-size: 14px;">123 Business St, City, State 12345</p>
  </div>
  <div style="border-top: 1px solid #374151; padding-top: 20px; font-size: 12px; opacity: 0.7;">
    <p style="margin: 0 0 10px 0;">© 2025 Your Company. All rights reserved.</p>
    <p style="margin: 0;">
      <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Unsubscribe</a>
      <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
      <a href="#" style="color: #9ca3af; text-decoration: none; margin: 0 10px;">Terms</a>
    </p>
  </div>
</div>`
    }
  ], []);

  // Advanced toolbar component
  const AdvancedToolbar = () => (
    <div className="bg-gray-50 border-b">
      {/* Primary toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 border-b border-gray-200">
        {/* Text formatting */}
        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
          <button
            onClick={() => applyFormatting('bold')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => applyFormatting('italic')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => applyFormatting('underline')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline size={16} />
          </button>
        </div>

        {/* Font size */}
        <select
          onChange={(e) => applyFormatting('fontSize', e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
          title="Font Size"
        >
          <option value="">Size</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        {/* Colors */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setColorType('text');
              setShowColorPicker(!showColorPicker);
            }}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
            title="Text Color"
          >
            <Type size={16} />
            <div className="w-4 h-4 bg-black border border-gray-300 rounded"></div>
          </button>
          <button
            onClick={() => {
              setColorType('background');
              setShowColorPicker(!showColorPicker);
            }}
            className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors"
            title="Background Color"
          >
            <Palette size={16} />
            <div className="w-4 h-4 bg-yellow-200 border border-gray-300 rounded"></div>
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
          <button
            onClick={() => applyFormatting('justifyLeft')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => applyFormatting('justifyCenter')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => applyFormatting('justifyRight')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
          <button
            onClick={() => applyFormatting('insertUnorderedList')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => applyFormatting('insertOrderedList')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Numbered List"
          >
            1.
          </button>
        </div>

        {/* Insert elements */}
        <div className="flex items-center gap-1 bg-white border rounded-lg p-1">
          <button
            onClick={() => applyFormatting('createLink')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Insert Link"
          >
            <Link size={16} />
          </button>
          <button
            onClick={() => applyFormatting('insertImage')}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Insert Image"
          >
            <Image size={16} />
          </button>
        </div>

        {/* Headings */}
        <select
          onChange={(e) => e.target.value && applyFormatting('formatBlock', e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white"
          title="Text Format"
        >
          <option value="">Format</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="P">Paragraph</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                activeTab === 'visual' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                activeTab === 'code' 
                  ? 'bg-blue-100 border-blue-300 text-blue-700' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              HTML
            </button>
          </div>
          
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
        </div>
      </div>

      {/* Color picker */}
      {showColorPicker && (
        <div className="absolute top-full left-0 z-50 bg-white border rounded-lg shadow-lg p-4 mt-1">
          <div className="grid grid-cols-8 gap-2 mb-3">
            {[
              '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff', '#ff0000', '#00ff00',
              '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000', '#000080', '#808000',
              '#800080', '#008080', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd',
              '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9', '#f8c471', '#82e0aa', '#f1948a', '#85929e'
            ].map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <input
            type="color"
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 border rounded cursor-pointer"
            title="Custom Color"
          />
          <button
            onClick={() => setShowColorPicker(false)}
            className="w-full mt-2 px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Mail className="text-blue-600" size={32} />
                Email Builder Pro
              </h1>
              <p className="text-gray-600 mt-2">Professional email editor with advanced visual tools and customization options</p>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>✅ Rich Text Editor</div>
              <div>✅ Advanced Formatting</div>
              <div>✅ Drag & Drop Snippets</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <AdvancedToolbar />
              
              {/* Editor Content */}
              <div className="relative">
                {activeTab === 'visual' ? (
                  <div className="relative">
                    <div
                      ref={visualRef}
                      contentEditable
                      onInput={handleVisualInput}
                      onPaste={(e) => {
                        // Allow pasting but clean it up
                        setTimeout(() => handleVisualInput(), 100);
                      }}
                      className="min-h-[600px] p-8 outline-none focus:ring-4 focus:ring-blue-100 focus:ring-inset overflow-auto"
                      style={{ 
                        backgroundColor: '#ffffff',
                        lineHeight: '1.6',
                        fontSize: '16px',
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                      dangerouslySetInnerHTML={{ __html: html }}
                      spellCheck="true"
                    />
                    <div className="absolute top-4 right-4 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      Click to edit • Use toolbar for formatting
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      value={codeText}
                      onChange={handleCodeChange}
                      className="w-full min-h-[600px] p-8 font-mono text-sm border-none outline-none focus:ring-4 focus:ring-blue-100 focus:ring-inset resize-none bg-gray-50"
                      placeholder="Edit HTML code here..."
                      spellCheck="false"
                    />
                    <div className="absolute top-4 right-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                      HTML Editor • Changes sync with visual editor
                    </div>
                  </div>
                )}
              </div>

              {/* Email Configuration */}
              <div className="border-t bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Email Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Email *</label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailConfig.to}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      placeholder="Email subject line"
                      value={emailConfig.subject}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                    <input
                      type="email"
                      placeholder="sender@example.com"
                      value={emailConfig.from}
                      onChange={(e) => setEmailConfig(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={sendEmail}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    <Send size={18} />
                    {isLoading ? 'Sending...' : 'Send Email'}
                  </button>

                  <button
                    onClick={downloadHtml}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download size={18} />
                    Export HTML
                  </button>

                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Copy size={18} />
                    Copy Code
                  </button>

                  <button
                    onClick={importHtmlFile}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload size={18} />
                    Import HTML
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,text/html"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <aside className="space-y-6">
            {/* Quick Templates */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings size={18} />
                Quick Templates
              </h3>
              
              <div className="space-y-3 mb-4">
                {Object.entries(templates).map(([name, template]) => (
                  <div key={name} className="flex items-center gap-2">
                    <button
                      onClick={() => loadTemplate(name)}
                      className="flex-1 text-left px-4 py-3 text-sm border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="font-medium text-gray-900 capitalize">{name.replace('-', ' ')}</div>
                      <div className="text-xs text-gray-500 mt-1">Professional template</div>
                    </button>
                    <button
                      onClick={() => deleteTemplate(name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New template name"
                    id="template-name"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById('template-name');
                      const name = input?.value?.trim();
                      if (name) {
                        saveTemplate(name);
                        input.value = '';
                      }
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Snippets */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus size={18} />
                Design Elements
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {snippets.map((snippet, index) => (
                  <button
                    key={index}
                    onClick={() => insertSnippet(snippet.code)}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{snippet.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{snippet.preview}</div>
                      </div>
                      <Plus size={16} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">💡 Pro Tips</h3>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Use <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl+B</kbd> for bold, <kbd className="px-1 py-0.5 text-xs bg-gray-100 rounded">Ctrl+I</kbd> for italic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Click elements in visual editor to select and format them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Test emails in different clients (Gmail, Outlook, Apple Mail)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Keep email width under 600px for mobile compatibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Always include alt text for images</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span>Use snippets for consistent, professional layouts</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* Enhanced Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-6xl max-h-[95vh] rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <h3 className="text-xl font-bold text-gray-900">📧 Email Preview</h3>
                
                <div className="flex items-center gap-4">
                  {/* Preview Mode Selector */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setPreviewMode('desktop')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        previewMode === 'desktop' 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Monitor size={16} />
                      Desktop
                    </button>
                    <button
                      onClick={() => setPreviewMode('mobile')}
                      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                        previewMode === 'mobile' 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Smartphone size={16} />
                      Mobile
                    </button>
                  </div>

                  <button
                    onClick={() => setIsPreviewOpen(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>

              <div className="p-8 overflow-auto bg-gray-50" style={{ maxHeight: 'calc(95vh - 100px)' }}>
                <div className="flex justify-center">
                  <div 
                    className={`bg-white rounded-lg overflow-hidden shadow-xl border border-gray-200 transition-all duration-500 ${
                      previewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
                    }`}
                  >
                    {/* Email Client Header Mockup */}
                    <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="ml-4 text-sm font-medium text-gray-700">Email Client</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">From:</span> {emailConfig.from || 'sender@example.com'}</div>
                        <div><span className="font-medium">To:</span> {emailConfig.to || 'recipient@example.com'}</div>
                        <div><span className="font-medium">Subject:</span> {emailConfig.subject || 'Email from Builder'}</div>
                      </div>
                    </div>

                    {/* Email Content */}
                    <div 
                      className="p-6 overflow-auto bg-white"
                      dangerouslySetInnerHTML={{ __html: html }}
                      style={{
                        fontSize: previewMode === 'mobile' ? '14px' : '16px',
                        lineHeight: '1.6'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className={`px-6 py-4 rounded-lg shadow-2xl max-w-md transform transition-all duration-300 ${
              notification.type === 'success' 
                ? 'bg-green-600 text-white' 
                : 'bg-red-600 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  notification.type === 'success' ? 'bg-green-200' : 'bg-red-200'
                }`}></div>
                <p className="font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}