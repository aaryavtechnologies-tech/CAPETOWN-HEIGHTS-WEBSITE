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

  // 3. Gallery Lightbox Functionality (Event Delegation for Dynamic & Static Items)
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightboxModal) {
    document.addEventListener('click', (e) => {
      // 1. Gallery Items
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem) {
        const fullSrc = galleryItem.getAttribute('data-full') || galleryItem.querySelector('img')?.src;
        const caption = galleryItem.getAttribute('data-title') || galleryItem.querySelector('.gallery-title')?.textContent || '';

        if (fullSrc && lightboxImg) {
          lightboxImg.src = fullSrc;
          lightboxImg.alt = caption;
          if (lightboxCaption) {
            lightboxCaption.textContent = caption;
          }
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        return;
      }

      // 2. Amenity Cards (Project Details & Home page)
      const amenityCard = e.target.closest('.amenity-bg-card');
      if (amenityCard) {
        const img = amenityCard.querySelector('.amenity-bg-img');
        const title = amenityCard.getAttribute('data-title') || amenityCard.querySelector('.amenity-bg-title')?.textContent || '';
        const desc = amenityCard.querySelector('.amenity-bg-desc')?.textContent || '';
        const fullSrc = amenityCard.getAttribute('data-full') || img?.src;

        if (fullSrc && lightboxImg) {
          lightboxImg.src = fullSrc;
          lightboxImg.alt = title;
          if (lightboxCaption) {
            lightboxCaption.innerHTML = `<strong>${title}</strong>${desc ? `<span style="display:block; font-size:0.875rem; opacity:0.85; margin-top:0.35rem; font-family:var(--font-sans, sans-serif); font-weight:normal;">${desc}</span>` : ''}`;
          }
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        return;
      }

      // 3. Generic Lightbox Triggers or Zoomable Images
      const trigger = e.target.closest('.lightbox-trigger, .zoomable-img');
      if (trigger) {
        const img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
        const fullSrc = trigger.getAttribute('data-full') || img?.src;
        const caption = trigger.getAttribute('data-title') || trigger.getAttribute('data-caption') || img?.alt || '';

        if (fullSrc && lightboxImg) {
          lightboxImg.src = fullSrc;
          lightboxImg.alt = caption;
          if (lightboxCaption) {
            lightboxCaption.textContent = caption;
          }
          lightboxModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
        return;
      }
    });

    const closeLightbox = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (lightboxImg) lightboxImg.src = '';
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
        const filterVal = (btn.getAttribute('data-filter') || 'all').toLowerCase();

        const currentItems = document.querySelectorAll('.gallery-grid .gallery-item');
        currentItems.forEach(item => {
          const category = (item.getAttribute('data-category') || '').toLowerCase();
          if (filterVal === 'all') {
            item.style.display = 'block';
          } else if (
            category === filterVal ||
            category.includes(filterVal) ||
            (filterVal === 'overview' && (category.includes('overview') || category.includes('project'))) ||
            (filterVal === 'construction' && (category.includes('construction') || category.includes('prep') || category.includes('excavation'))) ||
            (filterVal === 'site' && (category.includes('site') || category.includes('infrastructure') || category.includes('amenities') || category.includes('office'))) ||
            (filterVal === 'exterior' && (category.includes('exterior') || category.includes('architecture') || category.includes('elevation') || category.includes('interior'))) ||
            (filterVal === 'surroundings' && (category.includes('surroundings') || category.includes('signage') || category.includes('road') || category.includes('billboard') || category.includes('location')))
          ) {
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

        // Cache locally for instant multi-tab visibility in Admin Console
        const localEnquiry = {
          id: `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: nameInput.value.trim(),
          phone: phoneVal,
          email: '',
          projectName: 'Capetown Heights',
          interestType: 'Direct Website Form',
          message: noteInput.value.trim(),
          status: 'New',
          source: 'Website Direct',
          notes: '',
          createdAt: new Date().toISOString()
        };

        const payload = {
          id: localEnquiry.id,
          name: localEnquiry.name,
          phone: localEnquiry.phone,
          message: localEnquiry.message,
          projectName: localEnquiry.projectName,
          interestType: localEnquiry.interestType
        };

        try {
          const stored = localStorage.getItem('capetown_enquiries');
          let leads = stored ? JSON.parse(stored) : [];
          if (!Array.isArray(leads)) leads = [];
          leads.unshift(localEnquiry);
          localStorage.setItem('capetown_enquiries', JSON.stringify(leads));
        } catch (e) {}

        const API_URL = (function() {
          if (typeof window === 'undefined') return 'http://localhost:8000';
          if (window.location.protocol === 'file:') return 'http://localhost:8000';
          if (window.location.port === '8000') return '';
          const host = window.location.hostname || 'localhost';
          const proto = window.location.protocol || 'http:';
          if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
            return proto + '//' + host + ':8000';
          }
          return '';
        })();

        fetch(API_URL + '/api/enquiries', {
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
        url: 'assets/images/hero-carousel/hero-slide-1.jpg',
        alt: 'Capetown Heights Iconic High-Rise Residential Tower Elevation',
        positionClass: 'pos-center-25'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-2.jpg',
        alt: 'Capetown Heights Grand Entrance Gate & Cascading Water Fountain',
        positionClass: 'pos-center'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-3.jpg',
        alt: 'Capetown Heights Modern Architectural Tower Perspective View',
        positionClass: 'pos-center-30'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-4.jpg',
        alt: 'Capetown Heights Ground Floor Commercial High-Street Retail Arcade',
        positionClass: 'pos-center'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-5.jpg',
        alt: 'Capetown Heights Air-Conditioned Multi-Purpose Banquet & Celebration Hall',
        positionClass: 'pos-center'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-6.jpg',
        alt: 'Capetown Heights Luxury Master Bedroom Suite with Designer Wood Paneling',
        positionClass: 'pos-center'
      },
      {
        url: 'assets/images/hero-carousel/hero-slide-7.jpg',
        alt: 'Capetown Heights Premium Bedroom Suite with Contemporary Ambient Niche Lighting',
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

  // 8b. Dynamic Amenities Synchronization with Admin & Database Updates
  async function loadDynamicAmenities() {
    const cards = document.querySelectorAll('.amenity-bg-card');
    if (cards.length === 0) return;

    function applyAmenities(amenities) {
      if (!Array.isArray(amenities) || amenities.length === 0) return;

      const currentCards = document.querySelectorAll('.amenity-bg-card');

      currentCards.forEach(card => {
        const titleEl = card.querySelector('.amenity-bg-title');
        const cardTitle = titleEl ? titleEl.textContent.trim().toLowerCase() : '';
        const badgeEl = card.querySelector('.amenity-badge-num');
        const numText = badgeEl ? badgeEl.textContent.trim().replace(/[^0-9]/g, '') : '';
        const dynNum = card.getAttribute('data-dynamic-num');

        // Match amenity item by title or num identifier
        const item = amenities.find(a => {
          if (a.title && a.title.trim().toLowerCase() === cardTitle) return true;
          if (dynNum && String(a.num).replace(/[^0-9]/g, '') === String(dynNum).replace(/[^0-9]/g, '')) return true;
          if (numText && String(a.num).replace(/[^0-9]/g, '') === numText) return true;
          return false;
        });

        if (!item) return;

        // Update Title
        if (titleEl && item.title) {
          titleEl.textContent = item.title;
        }

        // Update Description
        const descEl = card.querySelector('.amenity-bg-desc');
        const descText = item.desc || item.description || '';
        if (descEl && descText) {
          descEl.textContent = descText;
        }

        // Update Image
        const imgEl = card.querySelector('.amenity-bg-img');
        if (imgEl && item.img) {
          let resolved = item.img.trim().replace(/^\.\.\//, '');
          if (imgEl.getAttribute('src') !== resolved) {
            imgEl.src = resolved;
          }
          if (item.title) {
            imgEl.alt = item.title;
          }
        }
      });
    }

    // 1. Instantly apply from localStorage (immediate, zero waiting)
    try {
      const cached = localStorage.getItem('capetown_amenities');
      if (cached) {
        const list = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          applyAmenities(list);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh from backend API
    const apiUrl = (function() {
      if (typeof window === 'undefined') return '';
      if (window.location.port === '8000') return '';
      const host = window.location.hostname || 'localhost';
      const proto = window.location.protocol || 'http:';
      if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return proto + '//' + host + ':8000';
      }
      return '';
    })();

    try {
      const res = await fetch(apiUrl + '/api/amenities');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.amenities) && data.amenities.length > 0) {
          applyAmenities(data.amenities);
          try {
            localStorage.setItem('capetown_amenities', JSON.stringify(data.amenities));
          } catch (e) {}
        }
      }
    } catch (err) {}

    // 3. Listen to cross-tab storage changes so updates are instant across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'capetown_amenities' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          applyAmenities(list);
        } catch (err) {}
      }
    });
  }

  // 9. Dynamic Contact Page Details Synchronization
  async function loadDynamicContactInfo() {
    const titleEl = document.getElementById('projectOfficeTitle');
    const phoneLinkEl = document.getElementById('projectOfficePhoneLink');
    const phoneDeskEl = document.getElementById('projectOfficePhoneDesk');
    const phoneSubEl = document.getElementById('projectOfficePhoneSub');
    const addressEl = document.getElementById('projectOfficeAddress');
    const plusCodeEl = document.getElementById('projectOfficePlusCode');
    const devNameEl = document.getElementById('projectOfficeDevName');
    const devDescEl = document.getElementById('projectOfficeDevDesc');
    const ratingEl = document.getElementById('projectOfficeRating');
    const dirLinkEl = document.getElementById('projectOfficeDirectionsLink');
    const mapBtnEl = document.getElementById('projectOfficeMapBtn');
    const revLinkEl = document.getElementById('projectOfficeReviewsLink');
    const igLinkEl = document.getElementById('projectOfficeInstagramLink');
    const fbLinkEl = document.getElementById('projectOfficeFacebookLink');
    const emailLinkEl = document.getElementById('projectOfficeEmailLink');
    const emailTextEl = document.getElementById('projectOfficeEmailText');

    function applyContact(c) {
      if (!c) return;

      // Title
      if (titleEl && c.title) titleEl.textContent = c.title;

      // Phone Number
      if (c.phone) {
        const cleanPhone = String(c.phone).trim();
        const telHref = 'tel:' + cleanPhone.replace(/\s+/g, '');
        if (phoneLinkEl) {
          phoneLinkEl.textContent = cleanPhone;
          phoneLinkEl.href = telHref;
        }
        if (phoneDeskEl) {
          phoneDeskEl.textContent = cleanPhone;
        }
        // Footer phone links
        document.querySelectorAll('a#footerPhoneLink, .footer-contact-item a[href^="tel:"]').forEach(el => {
          el.textContent = cleanPhone;
          el.href = telHref;
        });
      }

      // Phone Subtitle
      if (phoneSubEl && c.phone_subtitle) {
        phoneSubEl.textContent = c.phone_subtitle;
      }

      // Address
      if (c.address) {
        const cleanAddr = String(c.address).trim();
        if (addressEl) addressEl.textContent = cleanAddr;
        document.querySelectorAll('#footerAddress').forEach(el => {
          el.textContent = cleanAddr;
        });
      }

      // Plus Code
      if (plusCodeEl && c.plus_code) {
        plusCodeEl.textContent = c.plus_code;
      }

      // Developer Info
      if (devNameEl && c.developer_name) devNameEl.textContent = c.developer_name;
      if (devDescEl && c.developer_desc) devDescEl.textContent = c.developer_desc;

      // Google Rating
      if (ratingEl && c.google_rating) ratingEl.textContent = c.google_rating;

      // Directions / Google Maps
      if (c.directions_url) {
        if (dirLinkEl) dirLinkEl.href = c.directions_url;
        if (mapBtnEl) mapBtnEl.href = c.directions_url;
        document.querySelectorAll('.footer-links-list a[href*="maps.app.goo.gl"]').forEach(el => {
          el.href = c.directions_url;
        });
      }

      // Google Reviews
      if (c.reviews_url) {
        if (revLinkEl) revLinkEl.href = c.reviews_url;
        document.querySelectorAll('a#footerReviewsLink, .footer-social-btn[aria-label="Google Reviews"], .footer-links-list a[href*="g.page"]').forEach(el => {
          el.href = c.reviews_url;
        });
      }

      // Instagram
      if (c.instagram_url) {
        if (igLinkEl) igLinkEl.href = c.instagram_url;
        document.querySelectorAll('a#footerInstagramLink, .footer-social-btn[aria-label="Instagram"]').forEach(el => {
          el.href = c.instagram_url;
        });
      }

      // Facebook
      if (c.facebook_url) {
        if (fbLinkEl) fbLinkEl.href = c.facebook_url;
        document.querySelectorAll('a#footerFacebookLink, .footer-social-btn[aria-label="Facebook"]').forEach(el => {
          el.href = c.facebook_url;
        });
      }

      // LinkedIn
      if (c.linkedin_url) {
        document.querySelectorAll('a#footerLinkedInLink, .footer-social-btn[aria-label="LinkedIn"]').forEach(el => {
          el.href = c.linkedin_url;
        });
      }

      // Email
      if (c.email) {
        const cleanEmail = String(c.email).trim();
        if (emailLinkEl) emailLinkEl.href = 'mailto:' + cleanEmail;
        if (emailTextEl) emailTextEl.textContent = cleanEmail;
        document.querySelectorAll('a#footerEmailLink, .footer-contact-item a[href^="mailto:"]').forEach(el => {
          el.textContent = cleanEmail;
          el.href = 'mailto:' + cleanEmail;
        });
      }
    }

    // 1. Instantly apply from localStorage
    try {
      const stored = localStorage.getItem('capetown_contacts');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          const primary = list.find(c => c.is_primary == 1 || c.is_primary === true) || list[0];
          applyContact(primary);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh from backend API
    const apiUrl = (function() {
      if (typeof window === 'undefined') return '';
      if (window.location.port === '8000') return '';
      const host = window.location.hostname || 'localhost';
      const proto = window.location.protocol || 'http:';
      if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return proto + '//' + host + ':8000';
      }
      return '';
    })();

    try {
      const res = await fetch(apiUrl + '/api/contact');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.contacts && data.contacts.length > 0) {
          const primary = data.primaryContact || data.contacts.find(c => c.is_primary == 1 || c.is_primary === true) || data.contacts[0];
          applyContact(primary);
          try {
            localStorage.setItem('capetown_contacts', JSON.stringify(data.contacts));
          } catch (e) {}
        }
      }
    } catch (err) {}

    // 3. Listen to cross-tab storage changes for instant real-time live sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'capetown_contacts' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            const primary = list.find(c => c.is_primary == 1 || c.is_primary === true) || list[0];
            applyContact(primary);
          }
        } catch (err) {}
      }
    });
  }

  // 10. Dynamic Gallery Synchronization with Admin & Database
  async function loadDynamicGallery() {
    const galleryGrids = document.querySelectorAll('.gallery-grid');
    if (galleryGrids.length === 0) return;

    function resolvePublicImg(url) {
      if (!url) return 'assets/images/hero-site.jpg';
      url = url.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
      return url.replace(/^\.\.\//, '');
    }

    function escapeAttr(str) {
      return String(str || '').replace(/"/g, '&quot;');
    }
    function escapeHtml(str) {
      return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderGallery(photos) {
      if (!Array.isArray(photos) || photos.length === 0) return;

      galleryGrids.forEach(grid => {
        const isPreview = !document.querySelector('.gallery-filter-nav');
        const displayPhotos = isPreview ? photos.slice(0, 6) : photos;

        grid.innerHTML = '';
        displayPhotos.forEach(p => {
          const title = p.title || 'Capetown Heights Photograph';
          const cat = p.category || 'Site';
          const img = resolvePublicImg(p.image || p.img || '');
          const desc = p.caption || p.description || title;

          const itemEl = document.createElement('div');
          itemEl.className = 'gallery-item';
          itemEl.setAttribute('data-category', cat.toLowerCase());
          itemEl.setAttribute('data-full', img);
          itemEl.setAttribute('data-title', desc);

          itemEl.innerHTML = `
            <div class="gallery-img-container">
              <img src="${img}" alt="${escapeAttr(title)}" class="gallery-img" loading="lazy" onerror="this.src='assets/images/building-exterior.jpg'">
            </div>
            <div class="gallery-caption-overlay">
              <div>
                <span class="gallery-tag">${escapeHtml(cat)}</span>
                <h4 class="gallery-title">${escapeHtml(title)}</h4>
              </div>
              <div class="gallery-zoom-icon">
                <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </div>
            </div>
          `;
          grid.appendChild(itemEl);
        });

        // Re-apply current category filter if on gallery page
        const activeFilterBtn = document.querySelector('.gallery-filter-btn.active');
        if (activeFilterBtn) {
          const filterVal = (activeFilterBtn.getAttribute('data-filter') || 'all').toLowerCase();
          if (filterVal !== 'all') {
            activeFilterBtn.click();
          }
        }
      });
    }

    // 1. Instantly apply from localStorage (zero delay)
    try {
      const stored = localStorage.getItem('capetown_gallery');
      if (stored) {
        const list = JSON.parse(stored);
        if (Array.isArray(list) && list.length > 0) {
          renderGallery(list);
        }
      }
    } catch (e) {}

    // 2. Fetch fresh from backend API
    const apiUrl = (function() {
      if (typeof window === 'undefined') return '';
      if (window.location.port === '8000') return '';
      const host = window.location.hostname || 'localhost';
      const proto = window.location.protocol || 'http:';
      if (host === 'localhost' || host === '127.0.0.1' || /^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
        return proto + '//' + host + ':8000';
      }
      return '';
    })();

    try {
      const res = await fetch(apiUrl + '/api/gallery');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.gallery) && data.gallery.length > 0) {
          renderGallery(data.gallery);
          try {
            localStorage.setItem('capetown_gallery', JSON.stringify(data.gallery));
          } catch (e) {}
        }
      }
    } catch (err) {}

    // 3. Listen to cross-tab storage changes for instant real-time live sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'capetown_gallery' && e.newValue) {
        try {
          const list = JSON.parse(e.newValue);
          if (Array.isArray(list) && list.length > 0) {
            renderGallery(list);
          }
        } catch (err) {}
      }
    });
  }

  // =========================================================================
  // 9. Interactive Home Loan EMI Calculator
  // =========================================================================
  function initEmiCalculator() {
    const loanSlider = document.getElementById('loanAmountSlider');
    const interestSlider = document.getElementById('interestRateSlider');
    const tenureSlider = document.getElementById('tenureSlider');

    if (!loanSlider || !interestSlider || !tenureSlider) return;

    const loanBadge = document.getElementById('loanAmountBadge');
    const interestBadge = document.getElementById('interestRateBadge');
    const tenureBadge = document.getElementById('tenureBadge');

    const emiDisplay = document.getElementById('emiDisplay');
    const principalDisplay = document.getElementById('principalDisplay');
    const interestDisplay = document.getElementById('interestDisplay');
    const totalDisplay = document.getElementById('totalDisplay');

    const ratioPrincipalBar = document.getElementById('ratioPrincipalBar');
    const ratioInterestBar = document.getElementById('ratioInterestBar');
    const principalPercent = document.getElementById('principalPercent');
    const interestPercent = document.getElementById('interestPercent');

    function formatIndianCurrency(num) {
      const rounded = Math.round(num);
      return '₹' + rounded.toLocaleString('en-IN');
    }

    function updateSliderTrack(slider) {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #C69A64 0%, #C69A64 ${pct}%, #EADCC9 ${pct}%, #EADCC9 100%)`;
    }

    function calculate() {
      const P = parseFloat(loanSlider.value) || 0;
      const annualR = parseFloat(interestSlider.value) || 0;
      const years = parseFloat(tenureSlider.value) || 0;

      // Update badges
      if (loanBadge) loanBadge.textContent = formatIndianCurrency(P);
      if (interestBadge) interestBadge.textContent = annualR.toFixed(1) + '%';
      if (tenureBadge) tenureBadge.textContent = years + (years === 1 ? ' Year' : ' Years');

      // Update slider fill gradients
      updateSliderTrack(loanSlider);
      updateSliderTrack(interestSlider);
      updateSliderTrack(tenureSlider);

      // Calculations:
      const n = years * 12; // total months
      const r = (annualR / 12) / 100; // monthly interest rate

      let emi = 0;
      if (r > 0 && n > 0 && P > 0) {
        const factor = Math.pow(1 + r, n);
        emi = P * r * (factor / (factor - 1));
      } else if (n > 0) {
        emi = P / n;
      }

      const totalAmount = emi * n;
      const totalInterest = Math.max(0, totalAmount - P);

      // Display results
      if (emiDisplay) emiDisplay.textContent = formatIndianCurrency(emi);
      if (principalDisplay) principalDisplay.textContent = formatIndianCurrency(P);
      if (interestDisplay) interestDisplay.textContent = formatIndianCurrency(totalInterest);
      if (totalDisplay) totalDisplay.textContent = formatIndianCurrency(totalAmount);

      // Percentage breakdown
      let principalPct = 50;
      let interestPct = 50;
      if (totalAmount > 0) {
        principalPct = Math.round((P / totalAmount) * 100);
        interestPct = Math.max(0, 100 - principalPct);
      }

      if (ratioPrincipalBar) ratioPrincipalBar.style.width = principalPct + '%';
      if (ratioInterestBar) ratioInterestBar.style.width = interestPct + '%';
      if (principalPercent) principalPercent.textContent = principalPct + '%';
      if (interestPercent) interestPercent.textContent = interestPct + '%';
    }

    // Attach real-time listeners for instant responsive calculation
    [loanSlider, interestSlider, tenureSlider].forEach(slider => {
      slider.addEventListener('input', calculate);
      slider.addEventListener('change', calculate);
    });

    // Initial calculation on load
    calculate();
  }

  // =========================================================================
  // 10. Customer Reviews & Ratings Slider
  // =========================================================================
  function initReviewsSlider() {
    const track = document.getElementById('reviewsSliderTrack');
    const prevBtn = document.getElementById('reviewsPrevBtn');
    const nextBtn = document.getElementById('reviewsNextBtn');
    const dotsContainer = document.getElementById('reviewsDots');

    if (!track) return;

    const cards = track.querySelectorAll('.review-card');
    if (cards.length === 0) return;

    // Create pagination dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'reviews-dot' + (idx === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to review slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          scrollToCard(idx);
        });
        dotsContainer.appendChild(dot);
      });
    }

    function getCardWidth() {
      const firstCard = cards[0];
      if (!firstCard) return 320;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 28;
      return firstCard.offsetWidth + gap;
    }

    function scrollToCard(index) {
      const cardWidth = getCardWidth();
      track.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      updateActiveDot(index);
    }

    function updateActiveDot(index) {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.reviews-dot');
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const cardWidth = getCardWidth();
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 15) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      });
    }

    // Update active dot on scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardWidth = getCardWidth();
        const activeIndex = Math.round(track.scrollLeft / cardWidth);
        updateActiveDot(Math.min(activeIndex, cards.length - 1));
      }, 50);
    }, { passive: true });

    // Subtle auto-slide every 5 seconds (pauses on hover)
    let autoPlayTimer = setInterval(() => {
      if (track.matches(':hover')) return;
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 20) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const cardWidth = getCardWidth();
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    track.addEventListener('mouseleave', () => {
      clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        if (track.matches(':hover')) return;
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 20) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const cardWidth = getCardWidth();
          track.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
      }, 5000);
    });
  }

  loadDynamicAmenities();
  loadDynamicContactInfo();
  loadDynamicGallery();
  initEmiCalculator();
  initReviewsSlider();
});
