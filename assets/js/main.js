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
      const item = e.target.closest('.gallery-item');
      if (!item) return;

      const fullSrc = item.getAttribute('data-full') || item.querySelector('img')?.src;
      const caption = item.getAttribute('data-title') || item.querySelector('.gallery-title')?.textContent || '';

      if (fullSrc && lightboxImg) {
        lightboxImg.src = fullSrc;
        lightboxImg.alt = caption;
        if (lightboxCaption) {
          lightboxCaption.textContent = caption;
        }
        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
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

  // 8b. Dynamic Amenities Synchronization with Admin & Database Updates
  async function loadDynamicAmenities() {
    const cards = document.querySelectorAll('.amenity-bg-card');
    if (cards.length === 0) return;

    function applyAmenities(amenities) {
      if (!Array.isArray(amenities) || amenities.length === 0) return;

      const map = new Map();
      amenities.forEach(a => {
        const rawNum = String(a.num || '').replace(/[^0-9]/g, '');
        const parsed = parseInt(rawNum, 10);
        if (!isNaN(parsed)) {
          map.set(parsed, a);
          map.set(String(parsed).padStart(2, '0'), a);
        }
        if (a.num) map.set(String(a.num).trim(), a);
      });

      const currentCards = document.querySelectorAll('.amenity-bg-card');
      const seenNums = new Set();

      currentCards.forEach(card => {
        const badgeEl = card.querySelector('.amenity-badge-num');
        if (!badgeEl) return;
        const numText = badgeEl.textContent.trim().replace(/[^0-9]/g, '');
        const numVal = parseInt(numText, 10);
        if (isNaN(numVal)) return;

        const item = map.get(numVal) || map.get(numText) || map.get(String(numVal).padStart(2, '0'));
        if (!item) {
          // If deleted in admin, hide card
          card.style.display = 'none';
          return;
        }

        seenNums.add(numVal);
        card.style.display = '';

        // Update Title
        const titleEl = card.querySelector('.amenity-bg-title');
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

      // Handle any newly added amenities that don't have cards yet
      const lastGrid = document.querySelector('.amenities-group-wrapper[data-batch="batch-4"] .amenities-card-grid') ||
                       document.querySelector('.amenities-card-grid');
      if (lastGrid) {
        amenities.forEach(a => {
          const rawNum = String(a.num || '').replace(/[^0-9]/g, '');
          const parsed = parseInt(rawNum, 10);
          if (!isNaN(parsed) && !seenNums.has(parsed)) {
            const existing = document.querySelector(`[data-dynamic-num="${parsed}"]`);
            if (!existing) {
              const newCard = document.createElement('div');
              newCard.className = 'amenity-bg-card';
              newCard.setAttribute('data-dynamic-num', String(parsed));
              const numStr = String(parsed).padStart(2, '0');
              const imgSrc = (a.img || '').trim().replace(/^\.\.\//, '') || 'assets/images/amenities/multipurpose-hall.jpg';
              newCard.innerHTML = `
                <img src="${imgSrc}" alt="${(a.title || '').replace(/"/g, '&quot;')}" class="amenity-bg-img" loading="lazy">
                <div class="amenity-bg-overlay"></div>
                <span class="amenity-badge-num">${numStr}</span>
                <div class="amenity-bg-content">
                  <span class="amenity-gold-accent" aria-hidden="true"></span>
                  <h4 class="amenity-bg-title">${(a.title || '').replace(/</g, '&lt;')}</h4>
                  <p class="amenity-bg-desc">${(a.desc || a.description || '').replace(/</g, '&lt;')}</p>
                </div>
              `;
              lastGrid.appendChild(newCard);
              seenNums.add(parsed);
            }
          }
        });
      }
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
        document.querySelectorAll('#footerAddress, .site-footer .footer-contact-item:nth-child(2) div').forEach(el => {
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

      // Email
      if (c.email) {
        const cleanEmail = String(c.email).trim();
        if (emailLinkEl) emailLinkEl.href = 'mailto:' + cleanEmail;
        if (emailTextEl) emailTextEl.textContent = cleanEmail;
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

  loadDynamicAmenities();
  loadDynamicContactInfo();
  loadDynamicGallery();
});
