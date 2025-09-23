// htmlUtils.js
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

export const getCurrentSelection = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
};