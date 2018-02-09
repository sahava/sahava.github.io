(function($) {
    var el = document.querySelector('#linkedincount');
    var count = '';
    var currentUrl = 'https://www.simoahava.com' + window.location.pathname;
    if (document.querySelectorAll('#linkedincount').length === 1 && window.location.hostname.indexOf('localhost') === -1) {
	$.ajax({
	    dataType: 'jsonp',
	    url: 'https://www.linkedin.com/countserv/count/share',
	    data: {'url': currentUrl},
	    jsonpCallback: 'this_is_a_random_name',
	    success: function(data) {
		count += '| ' + data.count + ' Shares';
	        el.innerText = count;
	    }
	});
    }
})(window.jQuery);
