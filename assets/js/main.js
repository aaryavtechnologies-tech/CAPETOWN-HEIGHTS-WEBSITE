/**
 * CAPETOWN HEIGHTS – Official Website Scripts
 * Developer: Nirali infra
 * Front-end Only Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    const setMenuState = (isOpen) => {
      mobileToggle.classList.toggle('active', isOpen);
      navMenu.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.classList.toggle('menu-open', isOpen);
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('active');
      setMenuState(!isOpen);
    });

    // Close mobile menu on link click
    navMenu.querySelectorAll('.nav-link, .mobile-menu-cta').forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
        setMenuState(false);
      }
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setMenuState(false);
      }
    });
  }

  // 2. Active Page Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 3. Gallery Lightbox Functionality
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxModal && galleryItems.length > 0) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const fullSrc = item.getAttribute('data-full') || item.querySelector('img').src;
        const caption = item.getAttribute('data-title') || item.querySelector('.gallery-title')?.textContent || '';
        
        lightboxImg.src = fullSrc;
        lightboxImg.alt = caption;
        if (lightboxCaption) {
          lightboxCaption.textContent = caption;
        }
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal || e.target.classList.contains('lightbox-content')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // 4. Gallery Category Filter
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterVal = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filterVal === 'all' || category === filterVal) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // 5. Strict Contact Form Validation (Name, Contact Number, Note ONLY)
  const contactForm = document.getElementById('projectContactForm');
  if (contactForm) {
    const nameInput = document.getElementById('userName');
    const phoneInput = document.getElementById('userPhone');
    const noteInput = document.getElementById('userNote');
    const successAlert = document.getElementById('formSuccessAlert');

    // Real-time error clearing on input
    [nameInput, phoneInput, noteInput].forEach(field => {
      if (field) {
        field.addEventListener('input', () => {
          field.classList.remove('error');
          const errSpan = document.getElementById(`${field.id}Error`);
          if (errSpan) errSpan.classList.remove('visible');
        });
      }
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Clear previous error states
      [nameInput, phoneInput, noteInput].forEach(field => {
        if (field) {
          field.classList.remove('error');
          const errSpan = document.getElementById(`${field.id}Error`);
          if (errSpan) errSpan.classList.remove('visible');
        }
      });
      if (successAlert) successAlert.classList.remove('visible');

      // Validate Name (Required, at least 2 characters)
      if (!nameInput || !nameInput.value.trim() || nameInput.value.trim().length < 2) {
        isValid = false;
        if (nameInput) {
          nameInput.classList.add('error');
          const errSpan = document.getElementById('userNameError');
          if (errSpan) {
            errSpan.textContent = 'Please enter your full name (minimum 2 characters).';
            errSpan.classList.add('visible');
          }
        }
      }

      // Validate Contact Number (Required, standard 10-digit mobile number)
      const phoneVal = phoneInput ? phoneInput.value.trim().replace(/\D/g, '') : '';
      if (!phoneVal || phoneVal.length < 10) {
        isValid = false;
        if (phoneInput) {
          phoneInput.classList.add('error');
          const errSpan = document.getElementById('userPhoneError');
          if (errSpan) {
            errSpan.textContent = 'Please enter a valid 10-digit contact number.';
            errSpan.classList.add('visible');
          }
        }
      }

      // Validate Note (Required, at least 5 characters)
      if (!noteInput || !noteInput.value.trim() || noteInput.value.trim().length < 5) {
        isValid = false;
        if (noteInput) {
          noteInput.classList.add('error');
          const errSpan = document.getElementById('userNoteError');
          if (errSpan) {
            errSpan.textContent = 'Please enter a brief note or message (minimum 5 characters).';
            errSpan.classList.add('visible');
          }
        }
      }

      if (isValid) {
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const origBtnText = submitBtn ? submitBtn.textContent : 'Submit Enquiry';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting Enquiry...';
        }

        const payload = {
          name: nameInput.value.trim(),
          phone: phoneVal,
          message: noteInput.value.trim(),
          projectName: 'Capetown Heights',
          interestType: 'Direct Website Form'
        };

        const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '8000'))
          ? 'http://localhost:8000'
          : '';

        fetch(API_BASE + '/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
          if (successAlert) {
            successAlert.textContent = 'Thank you, ' + nameInput.value.trim() + '! Your inquiry has been saved into our system. For immediate project assistance, please call 9081464545.';
            successAlert.classList.add('visible');
          }
          contactForm.reset();
        })
        .catch(err => {
          console.error('Submission fallback:', err);
          if (successAlert) {
            successAlert.textContent = 'Thank you, ' + nameInput.value.trim() + '. Your inquiry has been noted. For immediate assistance, please call directly at 9081464545.';
            successAlert.classList.add('visible');
          }
          contactForm.reset();
        })
        .finally(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = origBtnText;
          }
        });
      }
    });
  }

  // 6. Project Details Overview Section (Static Cards Layout - Carousel Removed)

  // 7. Full-Bleed 7-Image Architectural Carousel Hero (Gemini Reference Integration)
  const heroEl = document.getElementById('hero-carousel');
  const trackEl = document.getElementById('carousel-track');
  const dotsEl = document.getElementById('carousel-dots');
  const prevSlideBtn = document.getElementById('prev-slide-btn');
  const nextSlideBtn = document.getElementById('next-slide-btn');

  if (heroEl && trackEl && dotsEl) {
    const architecturalSlides = [
      {
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Cantilevered Modern White Villa',
        positionClass: 'pos-center'
      },
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Modern Luxury Residential Apartment Building Towers',
        positionClass: 'pos-center-25'
      },
      {
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Poolside Courtyard & Lounge Terrace',
        positionClass: 'pos-center'
      },
      {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Contemporary Multi-Story Residential Tower Facade',
        positionClass: 'pos-center-30'
      },
      {
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Double-Height Glass Pavilion',
        positionClass: 'pos-center'
      },
      {
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Contemporary Sunset Architecture',
        positionClass: 'pos-center'
      },
      {
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=90',
        alt: 'Capetown Heights Landscaped Residence Facade',
        positionClass: 'pos-center'
      }
    ];

    let currentSlide = 0;
    let isPaused = false;
    let autoSlideTimer = null;

    function initHeroCarousel() {
      trackEl.innerHTML = '';
      dotsEl.innerHTML = '';

      architecturalSlides.forEach((slide, idx) => {
        // Create Slide Container
        const slideDiv = document.createElement('div');
        slideDiv.className = `carousel-slide ${idx === 0 ? 'is-active' : ''}`;

        const img = document.createElement('img');
        img.src = slide.url;
        img.alt = slide.alt;
        img.className = slide.positionClass;
        img.loading = idx === 0 ? 'eager' : 'lazy';
        img.onerror = function () {
          this.onerror = null;
          this.src = `https://placehold.co/1920x1080/261C14/DFC08E?text=Capetown+Heights+Architecture+${idx + 1}`;
        };

        slideDiv.appendChild(img);
        trackEl.appendChild(slideDiv);

        // Create Dot Indicator
        const dotBtn = document.createElement('button');
        dotBtn.type = 'button';
        dotBtn.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dotBtn.className = idx === 0 ? 'is-active' : 'is-inactive';
        dotBtn.addEventListener('click', () => {
          goToSlide(idx);
          resetAutoTimer();
        });
        dotsEl.appendChild(dotBtn);
      });

      startAutoTimer();
    }

    function goToSlide(index) {
      const total = architecturalSlides.length;
      currentSlide = ((index % total) + total) % total;

      const slides = trackEl.querySelectorAll('.carousel-slide');
      const dots = dotsEl.querySelectorAll('button');

      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('is-active');
        } else {
          slide.classList.remove('is-active');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.remove('is-inactive');
          dot.classList.add('is-active');
        } else {
          dot.classList.remove('is-active');
          dot.classList.add('is-inactive');
        }
      });
    }

    function stepSlide(delta) {
      goToSlide(currentSlide + delta);
      resetAutoTimer();
    }

    function startAutoTimer() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
      autoSlideTimer = setInterval(() => {
        if (!isPaused && !document.hidden) {
          goToSlide(currentSlide + 1);
        }
      }, 5500);
    }

    function resetAutoTimer() {
      startAutoTimer();
    }

    // Desktop Arrow Controls
    if (prevSlideBtn) {
      prevSlideBtn.addEventListener('click', () => stepSlide(-1));
    }
    if (nextSlideBtn) {
      nextSlideBtn.addEventListener('click', () => stepSlide(1));
    }

    // Pause autoplay on hover
    heroEl.addEventListener('mouseenter', () => {
      isPaused = true;
    });
    heroEl.addEventListener('mouseleave', () => {
      isPaused = false;
    });

    // Keyboard Arrow Navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') stepSlide(-1);
      if (e.key === 'ArrowRight') stepSlide(1);
    });

    // Touch Swipe Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;

    heroEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    heroEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        stepSlide(diff > 0 ? 1 : -1);
      }
    }, { passive: true });

    // Handle document visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (autoSlideTimer) clearInterval(autoSlideTimer);
      } else {
        startAutoTimer();
      }
    });

    // Initialize Hero Carousel
    initHeroCarousel();
  }

  // 8. Amenities Batch Filter Navigation (All 40 Amenities Showcase)
  const amenityFilterBtns = document.querySelectorAll('.amenity-filter-btn');
  const amenityBatches = document.querySelectorAll('.amenities-group-wrapper[data-batch]');

  if (amenityFilterBtns.length > 0 && amenityBatches.length > 0) {
    amenityFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        amenityFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterBatch = btn.getAttribute('data-batch');
        amenityBatches.forEach(batch => {
          if (filterBatch === 'all' || batch.getAttribute('data-batch') === filterBatch) {
            batch.style.display = 'block';
          } else {
            batch.style.display = 'none';
          }
        });
      });
    });
  }
});
