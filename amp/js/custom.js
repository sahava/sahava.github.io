(function($) {
  var headers = $('.post h2');
  headers.each(function() {
    if (document.queryCommandSupported('copy')) {
      $(this).append(' <a data-type="anchor" href="#' + $(this).attr('id') + '">#</a> <span data-type="top">&#8679;</span>'); 
    } else {
      $(this).append(' <span data-type="top">&#8679;</span>'); 
    }
  });
  $('[data-type="top"]').on('click', function() {
    $('html, body').animate({ scrollTop: 0 }, 'fast');
  });
})(jQuery)