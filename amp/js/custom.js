/**
 * Custom JS for simoahava.com
 * Modernized to vanilla JavaScript (no jQuery dependency)
 */

(function() {
  'use strict';

  /**
   * Add anchor links and scroll-to-top buttons to headings
   */
  function initHeaderAnchors() {
    const headers = document.querySelectorAll('.post h2, .post h3, .post h4');
    const supportsClipboard = document.queryCommandSupported && document.queryCommandSupported('copy');

    headers.forEach(function(header) {
      const id = header.getAttribute('id');
      if (!id) return;

      // Create anchor link
      if (supportsClipboard) {
        const anchor = document.createElement('a');
        anchor.setAttribute('data-type', 'anchor');
        anchor.setAttribute('href', '#' + id);
        anchor.textContent = '#';
        anchor.style.marginLeft = '0.5em';
        header.appendChild(document.createTextNode(' '));
        header.appendChild(anchor);
      }

      // Create scroll-to-top button
      const topBtn = document.createElement('span');
      topBtn.setAttribute('data-type', 'top');
      topBtn.innerHTML = '&#8679;';
      topBtn.style.marginLeft = '0.5em';
      topBtn.style.cursor = 'pointer';
      header.appendChild(document.createTextNode(' '));
      header.appendChild(topBtn);
    });

    // Event delegation for scroll-to-top buttons
    document.addEventListener('click', function(e) {
      if (e.target && e.target.getAttribute('data-type') === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /**
   * Reading progress indicator
   * Shows scroll progress at top of page for article pages
   */
  function initProgressBar() {
    const progressBar = document.getElementById('_progress');
    const commentSection = document.getElementById('comentario-comments') || 
                          document.getElementById('commento') ||
                          document.querySelector('[id*="comment"]');

    if (!progressBar) return;

    function updateProgress() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const winHeight = document.documentElement.clientHeight;
      
      // Subtract comment section height if present
      const commentHeight = commentSection ? commentSection.scrollHeight : 0;
      const scrollableHeight = docHeight - winHeight - commentHeight;
      
      if (scrollableHeight <= 0) {
        progressBar.style.setProperty('--scroll', '100%');
        return;
      }

      const scrollPercent = Math.min((scrollTop / scrollableHeight) * 100, 100);
      progressBar.style.setProperty('--scroll', scrollPercent + '%');
    }

    // Use passive event listener for better scroll performance
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    // Initial call
    updateProgress();
  }

  /**
   * Initialize on DOM ready
   */
  function init() {
    initHeaderAnchors();
    initProgressBar();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
