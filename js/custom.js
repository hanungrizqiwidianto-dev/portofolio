(function ($) {

  "use strict";

  // COLOR MODE
  $('.color-mode').click(function () {
    $('.color-mode-icon').toggleClass('active')
    $('body').toggleClass('dark-mode')
  })

  // HEADER
  $(".navbar").headroom();

  // PROJECT CAROUSEL
  $('.owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    margin: 10,
    nav: true
  });

  // PHOTO GALLERY CAROUSEL
  $('.photo-carousel').owlCarousel({
    items: 3,
    loop: true,
    margin: 30,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    smartSpeed: 800,
    responsive: {
      0: {
        items: 1,
        margin: 15
      },
      768: {
        items: 2,
        margin: 20
      },
      992: {
        items: 3,
        margin: 30
      }
    }
  });

  // SMOOTHSCROLL
  $(function () {
    $('.nav-link, .custom-btn-link').on('click', function (event) {
      var $anchor = $(this);
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - 49
      }, 1000);
      event.preventDefault();
    });
  });

  // TOOLTIP
  $('.social-links a').tooltip();

  // PHOTO GALLERY LIGHTBOX
  var modal = document.getElementById("photoModal");
  var modalImg = document.getElementById("modalImage");
  var captionText = document.getElementById("modalCaption");
  var photoItems = [];
  var currentIndex = 0;

  // Collect all photo images
  $('.photo-card img').each(function (index) {
    photoItems.push({
      src: $(this).attr('src'),
      alt: $(this).attr('alt')
    });
  });

  // Open modal when clicking photo
  $('.photo-card').click(function () {
    var clickedImg = $(this).find('img');
    currentIndex = $('.photo-card img').index(clickedImg);

    modal.style.display = "block";
    modalImg.src = clickedImg.attr('src');
    captionText.innerHTML = clickedImg.attr('alt');
    $('body').css('overflow', 'hidden');
  });

  // Close modal
  $('.photo-modal-close').click(function () {
    modal.style.display = "none";
    $('body').css('overflow', 'auto');
  });

  // Close modal when clicking outside image
  $(modal).click(function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      $('body').css('overflow', 'auto');
    }
  });

  // Previous image
  $('.photo-modal-prev').click(function () {
    currentIndex = (currentIndex - 1 + photoItems.length) % photoItems.length;
    modalImg.src = photoItems[currentIndex].src;
    captionText.innerHTML = photoItems[currentIndex].alt;
  });

  // Next image
  $('.photo-modal-next').click(function () {
    currentIndex = (currentIndex + 1) % photoItems.length;
    modalImg.src = photoItems[currentIndex].src;
    captionText.innerHTML = photoItems[currentIndex].alt;
  });

  // Keyboard navigation
  $(document).keydown(function (e) {
    if (modal.style.display === "block") {
      if (e.key === "Escape" || e.key === "Esc") {
        modal.style.display = "none";
        $('body').css('overflow', 'auto');
      } else if (e.key === "ArrowLeft") {
        $('.photo-modal-prev').click();
      } else if (e.key === "ArrowRight") {
        $('.photo-modal-next').click();
      }
    }
  });

})(jQuery);
