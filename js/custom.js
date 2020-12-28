(function($) {
  var headers = $('.post h2, .post h3, .post h4');
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

if (!!document.querySelector('#commento')) {
  document.addEventListener(
    "scroll",
    function() {
      var scrollTop =
        document.documentElement["scrollTop"] || document.body["scrollTop"];
      var scrollBottom =
	(document.documentElement["scrollHeight"] || document.body["scrollHeight"]) - document.documentElement.clientHeight - document.querySelector('#commento').scrollHeight;
      scrollPercent = scrollTop / scrollBottom * 100 + "%";
      document
        .getElementById("_progress")
        .style.setProperty("--scroll", scrollPercent);
    },
    { passive: true }
  );
}
