(function($) {
    
    var endpoint = window.location.hostname === 'localhost' ? 'http://localhost:9080' : 'https://search-www-simoahava-com.appspot.com';
    
    var header = document.querySelector('h1.searchResults');
    var spinner = document.querySelector('#spinner');
    var main = document.querySelector('#results');
    var numResults = document.querySelector('#numResults');
    
    var getQuery = function() {
	if (window.location.search.length === 0 || (window.location.search.indexOf('?q=') === -1 && window.location.search.indexOf('&q=') === -1)) {
	    return undefined;
	}

	var parts = window.location.search.substring(1).split('&');
	var query = parts.map(function(part) {
	    var temp = part.split('=');
	    return temp[0] === 'q' ? temp[1] : false;
	});
	return query[0] || undefined;
    };

    var buildPage = function(results) {
        results.forEach(function(result, idx) {
	    var article = document.createElement('article');
	    article.className = 'postShorten';
	    article.innerHTML = '<div class="postShorten-wrap"><div class="postShorten-header"><h2 class="postShorten-title"><a class="link-unstyled" href="' + result.uri + '">' + (idx + 1) + '. ' + result.title + '</a></h2><div class="postShorten-meta post-meta"><a href="' + result.uri + '">' + result.uri + '</a></div></div><div class="postShorten-excerpt">' + result.description + '</div><p></p></div>';
	    main.appendChild(article);
	});
    };
    
    var printSearchResults = function(results) {
        $(spinner).css('display', 'none');
	if (typeof results === 'undefined') {
	    $(header).text('No search entered');
	    return;
	}
	$(header).text('Search results for: ' + decodeURIComponent(results.query));
	$(numResults).text(results.results.length);
	$(main).css('display', 'block');
	if (results.results.length) {
	    buildPage(results.results);
	}
    };

    var getResults = function(query) {
	$.get(endpoint + '?q=' + query, function(data) {
	    return data;
	});
    };

    $(document).ready(function() {
	var query = getQuery();

	if (typeof query === 'undefined') {
	    printSearchResults();
	    return;
	} else {
	    $.get(endpoint + '?q=' + query, function(data) {
		printSearchResults(JSON.parse(data));
	    });
	}
    });
	    
})(window.jQuery);
