// content.js - Main functionality for the ColorSnatch extension

// Check if script is already running to prevent duplicate injection
if (window.colorSnatchAlreadyInjected) {
  // If already injected, just activate the color snatch functionality
  if (typeof activateColorSnatch === 'function') {
    activateColorSnatch();
  }
} else {
  // Set flag to prevent re-injection
  window.colorSnatchAlreadyInjected = true;

  // Flag to track if color snatch mode is active
  let colorSnatchActive = false;
  let originalCursor = '';
  let clickHandler = null;

  // Create and inject the toast element
  const toast = document.createElement('div');
  toast.id = 'color-snatch-toast';
  document.body.appendChild(toast);

  // Inject CSS file
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL('toast.css');
  document.head.appendChild(link);

  // Function to activate color snatch mode
  function activateColorSnatch() {
    if (colorSnatchActive) return;
    
    colorSnatchActive = true;
    originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'crosshair';
    
    showToast('Click on any element to pick its color');
    
    // Add click event listener to document
    clickHandler = function(e) {
      // Immediately remove the event listener to prevent double triggers
      document.removeEventListener('click', clickHandler);
      
      // Wait a moment to ensure the click completes and toast is fully visible
      setTimeout(() => {
        handleColorSnatch(e);
      }, 50);
    };
    
    document.addEventListener('click', clickHandler);
    
    // Add keydown event listener to allow canceling with Escape key
    document.addEventListener('keydown', handleKeyDown);
  }

  // Function to handle keydown events
  function handleKeyDown(e) {
    if (e.key === 'Escape' && colorSnatchActive) {
      deactivateColorSnatch();
      showToast('❌ Color picking cancelled');
    }
  }

  // Function to handle color snatching logic
  function handleColorSnatch(e) {
    // Don't prevent the default behavior or stop propagation initially
    // This ensures we get the actual element the user clicked on
    
    // Get element at clicked position
    const element = document.elementFromPoint(e.clientX, e.clientY);
    
    // Make sure we're not picking our own toast
    if (element && (element.id === 'color-snatch-toast' || element.closest('#color-snatch-toast'))) {
      // If we clicked on our own toast, reactivate color snatch
      document.addEventListener('click', clickHandler);
      return;
    }
    
    if (!element) {
      showToast('❌ No element found at this position');
      deactivateColorSnatch();
      return;
    }
    
    console.log('ColorSnatch: Clicked element', element.tagName, element.className);
    
    // Create an array of elements to check (current and parents)
    const elementsToCheck = [];
    let currentEl = element;
    
    // Add clicked element and up to 3 parents to the array
    for (let i = 0; i < 4 && currentEl; i++) {
      elementsToCheck.push(currentEl);
      currentEl = currentEl.parentElement;
    }
    
    // Try each element for any valid color
    let colorResult = { color: null, type: null };
    
    // First try background colors on all elements
    for (const el of elementsToCheck) {
      const style = window.getComputedStyle(el);
      console.log(`Element ${el.tagName}.${el.className}:`, {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage
      });
      
      // Check background image first (gradients)
      if (style.backgroundImage && 
          style.backgroundImage !== 'none' && 
          (style.backgroundImage.includes('gradient') || 
           style.backgroundImage.includes('linear') || 
           style.backgroundImage.includes('radial'))) {
        colorResult = { color: style.backgroundImage, type: 'gradient' };
        break;
      }
      
      // Then check background color
      if (style.backgroundColor && 
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          style.backgroundColor !== 'transparent' &&
          style.backgroundColor !== 'rgba(0, 0, 0, 0.0)') {
        colorResult = { color: style.backgroundColor, type: 'backgroundColor' };
        break;
      }
    }
    
    // If no background colors found, try other properties on the clicked element
    if (!colorResult.color) {
      const style = window.getComputedStyle(element);
      
      // Check text color
      if (style.color && 
          style.color !== 'rgba(0, 0, 0, 0)' && 
          style.color !== 'transparent') {
        colorResult = { color: style.color, type: 'textColor' };
      }
      // Check border color
      else if (style.borderColor && 
               style.borderColor !== 'rgba(0, 0, 0, 0)' && 
               style.borderColor !== 'transparent' &&
               style.borderWidth !== '0px') {
        colorResult = { color: style.borderColor, type: 'borderColor' };
      }
    }
    
    if (colorResult.color) {
      copyToClipboard(colorResult.color);
      
      let colorTypeLabel = '';
      switch(colorResult.type) {
        case 'gradient':
          colorTypeLabel = 'Gradient';
          break;
        case 'backgroundColor':
          colorTypeLabel = 'BG Color';
          break;
        case 'textColor':
          colorTypeLabel = 'Text Color';
          break;
        case 'borderColor':
          colorTypeLabel = 'Border Color';
          break;
        default:
          colorTypeLabel = 'Color';
      }
      
      // Create color preview based on type
      const colorPreview = document.createElement('span');
      colorPreview.style.cssText = `
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 3px;
        margin-right: 8px;
        vertical-align: middle;
        border: 1px solid rgba(255,255,255,0.3);
      `;
      
      if (colorResult.type === 'gradient') {
        colorPreview.style.backgroundImage = colorResult.color;
      } else {
        colorPreview.style.backgroundColor = colorResult.color;
      }
      
      // Clear toast and add preview and text
      toast.textContent = '';
      toast.appendChild(colorPreview);
      toast.appendChild(document.createTextNode(`✅ Copied ${colorTypeLabel}: ${truncateText(colorResult.color, 28)}`));
      toast.classList.add('show');
    } else {
      showToast('❌ No color found');
    }
    
    // Deactivate color snatch mode
    deactivateColorSnatch();
  }

  // Function to truncate long text
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Function to deactivate color snatch mode
  function deactivateColorSnatch() {
    document.body.style.cursor = originalCursor;
    document.removeEventListener('click', clickHandler);
    document.removeEventListener('keydown', handleKeyDown);
    colorSnatchActive = false;
  }

  // Function to copy text to clipboard
  function copyToClipboard(text) {
    // Use the Clipboard API
    navigator.clipboard.writeText(text)
      .catch(err => {
        console.error('Failed to copy to clipboard:', err);
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copying failed:', err);
        }
        
        document.body.removeChild(textarea);
      });
  }

  // Function to show toast message
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 2 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // Start the color snatch functionality
  activateColorSnatch();
} 