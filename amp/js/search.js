/**
 * Search functionality for simoahava.com
 * Modernized to vanilla JavaScript (no jQuery dependency)
 */

(function() {
  'use strict';

  const endpoint = window.location.hostname === 'localhost' 
    ? 'http://localhost:9080' 
    : 'https://simoahava-com-search.ew.r.appspot.com';

  const header = document.querySelector('h1.searchResults');
  const spinner = document.querySelector('#spinner');
  const main = document.querySelector('#results');
  const numResults = document.querySelector('#numResults');

  /**
   * Extract search query from URL
   * @returns {string|undefined}
   */
  function getQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    return query || undefined;
  }

  /**
   * Build search results HTML
   * @param {Array} results - Search results array
   */
  function buildPage(results) {
    const fragment = document.createDocumentFragment();

    results.forEach(function(result, idx) {
      const article = document.createElement('article');
      article.className = 'postShorten';
      article.innerHTML = `
        <div class="postShorten-wrap">
          <div class="postShorten-header">
            <h2 class="postShorten-title">
              <a class="link-unstyled" href="${escapeHtml(result.uri)}">
                ${idx + 1}. ${escapeHtml(result.title)}
              </a>
            </h2>
            <div class="postShorten-meta post-meta">
              <a href="${escapeHtml(result.uri)}">${escapeHtml(result.uri)}</a>
            </div>
          </div>
          <div class="postShorten-excerpt">${escapeHtml(result.description)}</div>
          <p></p>
        </div>
      `;
      fragment.appendChild(article);
    });

    main.appendChild(fragment);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} str - String to escape
   * @returns {string}
   */
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Display search results
   * @param {Object} results - Results object from API
   */
  function printSearchResults(results) {
    if (spinner) {
      spinner.style.display = 'none';
    }

    if (typeof results === 'undefined') {
      if (header) header.textContent = 'No search entered';
      return;
    }

    if (header) {
      header.textContent = 'Search results for: ' + decodeURIComponent(results.query);
    }

    if (numResults) {
      numResults.textContent = results.results.length;
    }

    if (main) {
      main.style.display = 'block';
      if (results.results.length) {
        buildPage(results.results);
      }
    }
  }

  /**
   * Fetch search results from API
   * @param {string} query - Search query
   */
  async function fetchResults(query) {
    try {
      const response = await fetch(endpoint + '?q=' + encodeURIComponent(query));
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.text();
      printSearchResults(JSON.parse(data));
    } catch (error) {
      console.error('Search error:', error);
      if (header) header.textContent = 'Search failed. Please try again.';
      if (spinner) spinner.style.display = 'none';
    }
  }

  /**
   * Initialize search on page load
   */
  function init() {
    // Only run on search pages
    if (!header && !main) return;

    const query = getQuery();

    if (typeof query === 'undefined') {
      printSearchResults();
    } else {
      fetchResults(query);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
