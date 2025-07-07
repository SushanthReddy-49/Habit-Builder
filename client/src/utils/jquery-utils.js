// jQuery utility functions for Habit Builder

// Get jQuery reference
const getJQuery = () => {
  if (typeof window !== 'undefined' && window.$) {
    return window.$;
  }
  return null;
};

// Fade in/out animations
export const fadeInElement = (selector, duration = 400) => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).fadeIn(duration);
};

export const fadeOutElement = (selector, duration = 400) => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).fadeOut(duration);
};

// Slide animations
export const slideDownElement = (selector, duration = 400) => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).slideDown(duration);
};

export const slideUpElement = (selector, duration = 400) => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).slideUp(duration);
};

// Form validation helpers
export const validateForm = (formSelector) => {
  const $ = getJQuery();
  if (!$) return false;
  
  const $form = $(formSelector);
  let isValid = true;
  
  $form.find('[required]').each(function() {
    const $field = $(this);
    const value = $field.val().trim();
    
    if (!value) {
      $field.addClass('border-red-500');
      isValid = false;
    } else {
      $field.removeClass('border-red-500');
    }
  });
  
  return isValid;
};

// Show/hide loading spinner
export const showLoading = (selector = '#loading-spinner') => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).fadeIn(200);
};

export const hideLoading = (selector = '#loading-spinner') => {
  const $ = getJQuery();
  if (!$) return;
  $(selector).fadeOut(200);
};

// Toast notifications with jQuery
export const showToast = (message, type = 'info', duration = 3000) => {
  const $ = getJQuery();
  if (!$) return;
  
  const toastClass = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  const $toast = $(`
    <div class="fixed top-4 right-4 z-50 ${toastClass} text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300">
      ${message}
    </div>
  `);
  
  $('body').append($toast);
  
  // Animate in
  setTimeout(() => {
    $toast.removeClass('translate-x-full');
  }, 100);
  
  // Animate out and remove
  setTimeout(() => {
    $toast.addClass('translate-x-full');
    setTimeout(() => {
      $toast.remove();
    }, 300);
  }, duration);
};

// Animate counter
export const animateCounter = (selector, targetValue, duration = 1000) => {
  const $ = getJQuery();
  if (!$) return;
  
  const $element = $(selector);
  const startValue = parseInt($element.text()) || 0;
  
  $({ count: startValue }).animate({ count: targetValue }, {
    duration: duration,
    easing: 'swing',
    step: function() {
      $element.text(Math.floor(this.count));
    },
    complete: function() {
      $element.text(targetValue);
    }
  });
};

// Progress bar animation
export const animateProgressBar = (selector, percentage, duration = 1000) => {
  const $ = getJQuery();
  if (!$) return;
  
  const $progressBar = $(selector);
  const $fill = $progressBar.find('.progress-fill');
  
  $fill.animate({ width: percentage + '%' }, {
    duration: duration,
    easing: 'easeOutQuart'
  });
};

// Auto-hide element after delay
export const autoHideElement = (selector, delay = 3000) => {
  const $ = getJQuery();
  if (!$) return;
  
  setTimeout(() => {
    $(selector).fadeOut(500);
  }, delay);
};

// Debounced search input
export const debouncedSearch = (inputSelector, callback, delay = 300) => {
  const $ = getJQuery();
  if (!$) return;
  
  let timeoutId;
  $(inputSelector).on('input', function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback($(this).val());
    }, delay);
  });
};

// Scroll to top with smooth animation
export const scrollToTop = () => {
  const $ = getJQuery();
  if (!$) return;
  
  $('html, body').animate({ scrollTop: 0 }, 800);
};

// Highlight element temporarily
export const highlightElement = (selector, duration = 2000) => {
  const $ = getJQuery();
  if (!$) return;
  
  const $element = $(selector);
  $element.addClass('bg-yellow-200 border-yellow-400');
  
  setTimeout(() => {
    $element.removeClass('bg-yellow-200 border-yellow-400');
  }, duration);
};

// Enhanced localStorage utilities with jQuery
export const setLocalStorage = (key, value) => {
  const $ = getJQuery();
  if (!$) {
    localStorage.setItem(key, JSON.stringify(value));
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger custom event for jQuery listeners
    $(window).trigger('localStorage:set', { key, value });
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  const $ = getJQuery();
  if (!$) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
  
  try {
    const item = localStorage.getItem(key);
    const value = item ? JSON.parse(item) : defaultValue;
    // Trigger custom event for jQuery listeners
    $(window).trigger('localStorage:get', { key, value });
    return value;
  } catch (error) {
    console.error('Error getting localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  const $ = getJQuery();
  if (!$) {
    localStorage.removeItem(key);
    return;
  }
  
  localStorage.removeItem(key);
  // Trigger custom event for jQuery listeners
  $(window).trigger('localStorage:remove', { key });
};

// Enhanced form utilities
export const focusFirstInput = (formSelector) => {
  const $ = getJQuery();
  if (!$) return;
  
  $(formSelector).find('input:visible:first').focus();
};

export const copyToClipboard = (text) => {
  const $ = getJQuery();
  if (!$) return;
  
  const $temp = $('<textarea>');
  $('body').append($temp);
  $temp.val(text).select();
  document.execCommand('copy');
  $temp.remove();
  
  showToast('Copied to clipboard!', 'success');
};

// Enhanced event utilities
export const onEnterKey = (selector, callback) => {
  const $ = getJQuery();
  if (!$) return;
  
  $(selector).on('keypress', function(e) {
    if (e.which === 13) {
      callback.call(this, e);
    }
  });
};

export const onEscapeKey = (selector, callback) => {
  const $ = getJQuery();
  if (!$) return;
  
  $(selector).on('keydown', function(e) {
    if (e.which === 27) {
      callback.call(this, e);
    }
  });
};

// Enhanced UI utilities
export const showConfirmationDialog = (message, onConfirm, onCancel) => {
  const $ = getJQuery();
  if (!$) {
    const confirmed = window.confirm(message);
    if (confirmed && onConfirm) onConfirm();
    if (!confirmed && onCancel) onCancel();
    return;
  }
  
  const $dialog = $(`
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
        <p class="text-gray-900 mb-4">${message}</p>
        <div class="flex space-x-3">
          <button class="btn-secondary flex-1" id="confirm-btn">Yes</button>
          <button class="btn-primary flex-1" id="cancel-btn">No</button>
        </div>
      </div>
    </div>
  `);
  
  $('body').append($dialog);
  
  $('#confirm-btn').on('click', function() {
    $dialog.fadeOut(300, function() {
      $(this).remove();
      if (onConfirm) onConfirm();
    });
  });
  
  $('#cancel-btn').on('click', function() {
    $dialog.fadeOut(300, function() {
      $(this).remove();
      if (onCancel) onCancel();
    });
  });
};

// Initialize jQuery utilities
export const initializeJQueryUtils = () => {
  const $ = getJQuery();
  if (!$) return;
  
  // Set up global jQuery configurations
  $.fn.extend({
    // Custom method to animate text change
    animateText: function(newText, duration = 500) {
      return this.each(function() {
        const $this = $(this);
        $this.fadeOut(duration / 2, function() {
          $this.text(newText).fadeIn(duration / 2);
        });
      });
    },
    
    // Custom method to shake element
    shake: function() {
      return this.each(function() {
        const $this = $(this);
        $this.addClass('animate-shake');
        setTimeout(() => {
          $this.removeClass('animate-shake');
        }, 500);
      });
    }
  });
  
  // Add CSS for shake animation
  if (!$('#jquery-utils-styles').length) {
    $('head').append(`
      <style id="jquery-utils-styles">
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      </style>
    `);
  }
};

// Export jQuery reference for direct use
export const $ = (selector) => {
  const jQuery = getJQuery();
  return jQuery ? jQuery(selector) : null;
}; 