/**
 * CAPETOWN HEIGHTS – Official Website Scripts
 * Developer: NIRALI GROUP
 * Front-end Only Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.contains('active');
      mobileToggle.classList.toggle('active', !isOpen);
      navMenu.classList.toggle('active', !isOpen);
      mobileToggle.setAttribute('aria-expanded', !isOpen);
    });

    // Close mobile menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
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
        // Show front-end confirmation message
        if (successAlert) {
          successAlert.textContent = 'Thank you, ' + nameInput.value.trim() + '. Your inquiry details have been validated successfully. For immediate project assistance, please call directly at 9081464545.';
          successAlert.classList.add('visible');
        }
        contactForm.reset();
      }
    });
  }

  // 6. Project Details Overview Promotional Carousel
  const overviewCarousel = document.getElementById('overviewCarousel');
  if (overviewCarousel) {
    const track = document.getElementById('overviewTrack');
    const slides = track ? track.querySelectorAll('.promo-slide') : [];
    const dots = document.querySelectorAll('.promo-dot');
    const prevBtn = document.getElementById('overviewPrevBtn');
    const nextBtn = document.getElementById('overviewNextBtn');

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;
    const intervalMs = 4500;

    const updateCarousel = (index) => {
      if (totalSlides === 0) return;
      currentIndex = (index + totalSlides) % totalSlides;

      // Smooth horizontal sliding
      if (track) {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
      }

      // Update slide active states & accessibility
      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.classList.toggle('active', isActive);
        slide.setAttribute('aria-hidden', !isActive);
      });

      // Update pagination indicators
      dots.forEach((dot, i) => {
        const isActive = i === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    };

    const nextSlide = () => updateCarousel(currentIndex + 1);
    const prevSlide = () => updateCarousel(currentIndex - 1);

    const startAutoPlay = () => {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, intervalMs);
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    // Manual Arrow Controls
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      });
    }

    // Pagination Dot Controls
    dots.forEach((dot) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(targetIdx)) {
          updateCarousel(targetIdx);
          startAutoPlay();
        }
      });
    });

    // Pause Auto-Rotation on Hover (Desktop)
    overviewCarousel.addEventListener('mouseenter', stopAutoPlay);
    overviewCarousel.addEventListener('mouseleave', startAutoPlay);

    // Touch Swipe Gestures for Mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;

    overviewCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      stopAutoPlay();
    }, { passive: true });

    overviewCarousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Register horizontal swipe if delta exceeds threshold and is primary direction
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Keyboard Arrow Navigation
    overviewCarousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
        startAutoPlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextSlide();
        startAutoPlay();
      }
    });

    // Initial setup
    updateCarousel(0);
    startAutoPlay();
  }

  // 7. Hero Horizontal Sliding Background Track (Home Page Only)
  const heroSection = document.getElementById('heroSection') || document.querySelector('.hero-section');
  const heroTrack = document.getElementById('heroTrack');
  const heroPrevBtn = document.getElementById('heroPrevBtn');
  const heroNextBtn = document.getElementById('heroNextBtn');
  const heroDots = document.querySelectorAll('.hero-dot');

  if (heroSection && heroTrack) {
    const originalSlides = Array.from(heroTrack.querySelectorAll('.hero-slide'));
    const totalOriginal = originalSlides.length;

    if (totalOriginal > 1) {
      const ROTATION_INTERVAL = 5000; // 5 seconds per slide
      const TRANSITION_STYLE = 'transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)';
      let currentIndex = 0;
      let slideTimer = null;
      let isHovered = false;
      let isTransitioning = false;

      // 1. Preload all slide images into browser cache
      originalSlides.forEach((slide) => {
        const bgDiv = slide.querySelector('.hero-slide-bg');
        if (bgDiv) {
          const match = bgDiv.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (match && match[1]) {
            const preloader = new Image();
            preloader.src = match[1];
          }
        }
      });

      // 2. Clone the first slide and append to the track for seamless infinite looping
      const firstClone = originalSlides[0].cloneNode(true);
      firstClone.setAttribute('data-clone', 'true');
      firstClone.classList.remove('active');
      heroTrack.appendChild(firstClone);

      const allSlides = Array.from(heroTrack.querySelectorAll('.hero-slide'));

      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Update dots and active slide class
      const updateUI = (idx) => {
        const normalizedIdx = idx % totalOriginal;
        heroDots.forEach((dot, dIdx) => {
          const isActive = dIdx === normalizedIdx;
          dot.classList.toggle('active', isActive);
          dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        allSlides.forEach((slide, sIdx) => {
          slide.classList.toggle('active', sIdx === idx);
        });
      };

      // Move track to specific index
      const moveToSlide = (targetIndex, animate = true) => {
        if (animate && !prefersReducedMotion) {
          heroTrack.style.transition = TRANSITION_STYLE;
        } else {
          heroTrack.style.transition = 'none';
        }
        heroTrack.style.transform = `translateX(-${targetIndex * 100}%)`;
        currentIndex = targetIndex;
        updateUI(targetIndex);
      };

      // Advance to next slide
      const nextSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;
        moveToSlide(currentIndex + 1, true);
      };

      // Go to previous slide
      const prevSlide = () => {
        if (isTransitioning) return;
        isTransitioning = true;

        if (currentIndex === 0) {
          // Snap instantly to the clone at end, then animate to last original slide
          moveToSlide(totalOriginal, false);
          void heroTrack.offsetHeight; // Force reflow
          moveToSlide(totalOriginal - 1, true);
        } else {
          moveToSlide(currentIndex - 1, true);
        }
      };

      // Handle seamless infinite reset on transitionend
      heroTrack.addEventListener('transitionend', (e) => {
        if (e.target !== heroTrack || e.propertyName !== 'transform') return;
        isTransitioning = false;

        // If at the clone (index totalOriginal), snap back to index 0 instantly
        if (currentIndex === totalOriginal) {
          moveToSlide(0, false);
          void heroTrack.offsetHeight;
          if (!prefersReducedMotion) {
            heroTrack.style.transition = TRANSITION_STYLE;
          }
        }
      });

      // Navigation arrow button clicks
      if (heroPrevBtn) {
        heroPrevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          prevSlide();
          startAutoPlay();
        });
      }

      if (heroNextBtn) {
        heroNextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          nextSlide();
          startAutoPlay();
        });
      }

      // Pagination dot clicks
      heroDots.forEach((dot) => {
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          const target = parseInt(dot.getAttribute('data-index'), 10);
          if (!isNaN(target) && target !== currentIndex) {
            moveToSlide(target, true);
            startAutoPlay();
          }
        });
      });

      // Timer Controls & Mouse Hover
      const startAutoPlay = () => {
        stopAutoPlay();
        if (!isHovered) {
          slideTimer = setInterval(nextSlide, ROTATION_INTERVAL);
        }
      };

      const stopAutoPlay = () => {
        if (slideTimer) {
          clearInterval(slideTimer);
          slideTimer = null;
        }
      };

      // Desktop: pause on mouseenter, resume on mouseleave
      const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (hasFinePointer) {
        heroSection.addEventListener('mouseenter', () => {
          isHovered = true;
          stopAutoPlay();
        });

        heroSection.addEventListener('mouseleave', () => {
          isHovered = false;
          startAutoPlay();
        });
      }

      // Touch Swipe Gestures for Mobile
      let touchStartX = 0;
      let touchStartY = 0;
      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
        stopAutoPlay();
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
        startAutoPlay();
      }, { passive: true });

      // Page visibility handling
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stopAutoPlay();
        } else if (!isHovered) {
          startAutoPlay();
        }
      });

      // Initialize
      moveToSlide(0, false);
      startAutoPlay();
    }
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
