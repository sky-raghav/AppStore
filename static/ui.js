var text = $('.desc'),
     btn = $('.btn'),
       h = text[0].scrollHeight;

if(h > 420) {
	btn.addClass('less');
}

btn.click(function(e)
{
  e.stopPropagation();

  if (btn.hasClass('less')) {
      btn.removeClass('less');
      btn.addClass('more');
      btn.text('Read less');

      text.animate({'height': h});
  } else {
      btn.addClass('less');
      btn.removeClass('more');
      btn.text('Read more');
      text.animate({'height': '340px'});
  }
});
