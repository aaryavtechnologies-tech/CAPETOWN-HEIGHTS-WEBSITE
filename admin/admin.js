/**
 * CAPETOWN HEIGHTS - Executive Admin Portal Frontend Logic
 * Multi-Module Dashboard Console & MySQL Database Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Backend API URL: Dynamically handles localhost, LAN IP (e.g. 192.168.x.x for mobile testing), and production
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

  // Global State
  let authToken = localStorage.getItem('capetown_admin_token');
  let currentAdmin = JSON.parse(localStorage.getItem('capetown_admin_user') || 'null');
  let currentFilter = 'all';
  let searchQuery = '';
  let allEnquiries = [];
  let currentActiveView = 'viewDashboard';

  const DEFAULT_LEADS = [
    {
      id: 'enq-101',
      name: 'Rohan Sharma',
      phone: '9876543210',
      email: 'rohan.sharma@example.com',
      projectName: 'Capetown Heights',
      interestType: '3 BHK Luxury Apartment',
      message: 'Interested in high-floor corner unit with terrace garden view.',
      status: 'New',
      source: 'Website Direct',
      notes: 'Requested weekend site visit.',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'enq-102',
      name: 'Priya Patel',
      phone: '9823456789',
      email: 'priya.p@example.com',
      projectName: 'Capetown Heights',
      interestType: '2 BHK Executive Flat',
      message: 'Please share floor plan and financing options with HDFC.',
      status: 'Contacted',
      source: 'Google Search',
      notes: 'Spoke with client. Sent brochure via WhatsApp.',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'enq-103',
      name: 'Amit Verma',
      phone: '9911223344',
      email: 'amit.verma@example.com',
      projectName: 'Capetown Heights',
      interestType: 'Commercial Retail Space',
      message: 'Looking for ground floor retail showroom unit for banking branch.',
      status: 'Completed',
      source: 'Site Visit / Referral',
      notes: 'Token advance received for Phase 1 allotment.',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  function getLocalEnquiries() {
    try {
      const stored = localStorage.getItem('capetown_enquiries');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    localStorage.setItem('capetown_enquiries', JSON.stringify(DEFAULT_LEADS));
    return DEFAULT_LEADS;
  }

  // 40 Verified Project Amenities Catalog
  const projectAmenities = [
  {
    "num": "01",
    "img": "assets/images/amenities/allotted-car-parking.jpg",
    "title": "Allotted Car Parking",
    "desc": "Dedicated, covered private vehicular parking space allocated for residents with organized wide driving aisles."
  },
  {
    "num": "02",
    "img": "assets/images/amenities/double-basement.jpg",
    "title": "Double Basement",
    "desc": "Modern two-level subterranean parking facility with gentle vehicular access ramps and round-the-clock illumination."
  },
  {
    "num": "03",
    "img": "assets/images/amenities/multipurpose-hall.jpg",
    "title": "Fully AC Multipurpose Hall",
    "desc": "Elegant, climate-controlled banquet and community hall designed for social gatherings and private celebrations."
  },
  {
    "num": "04",
    "img": "assets/images/amenities/temple.jpg",
    "title": "Temple",
    "desc": "A serene and exquisitely crafted white marble devotional sanctum within the residential grounds for daily peace and spiritual harmony."
  },
  {
    "num": "05",
    "img": "assets/images/amenities/gym.jpg",
    "title": "Gym",
    "desc": "Contemporary fitness center equipped with premium cardio and strength-training equipment for daily health routines."
  },
  {
    "num": "06",
    "img": "assets/images/amenities/indoor-game.jpg",
    "title": "Indoor Game",
    "desc": "Dedicated indoor recreation lounge featuring table tennis, leisure activities, and engaging tabletop games."
  },
  {
    "num": "07",
    "img": "assets/images/amenities/library.jpg",
    "title": "Library",
    "desc": "Quiet, sophisticated reading enclave and study hall stocked with books and comfortable reading armchairs."
  },
  {
    "num": "08",
    "img": "assets/images/amenities/box-cricket.jpg",
    "title": "Box Cricket",
    "desc": "Enclosed turf box cricket arena with overhead protective netting and floodlights for competitive community play."
  },
  {
    "num": "09",
    "img": "assets/images/amenities/gazebo.jpg",
    "title": "Gazebo",
    "desc": "Classic shaded garden pavilion offering a tranquil retreat amidst landscaped flower beds and lush greenery."
  },
  {
    "num": "10",
    "img": "assets/images/amenities/swimming-pool.jpg",
    "title": "Swimming pool",
    "desc": "Resort-style swimming pool featuring crystal-clear waters and an expansive sun deck for relaxation."
  },
  {
    "num": "11",
    "img": "assets/images/amenities/baby-pool.jpg",
    "title": "Baby Pool",
    "desc": "Dedicated shallow splash pool with child-safe depths and non-slip coping for young children."
  },
  {
    "num": "12",
    "img": "assets/images/amenities/open-stage.jpg",
    "title": "Open Stage",
    "desc": "Elevated open-air amphitheater and performance deck for vibrant community cultural events and celebrations."
  },
  {
    "num": "13",
    "img": "assets/images/amenities/open-projector.jpg",
    "title": "Open Projector",
    "desc": "Outdoor open-sky cinema viewing lawn equipped for weekend community movie screenings under the stars."
  },
  {
    "num": "14",
    "img": "assets/images/amenities/landscape-garden.jpg",
    "title": "Landscape Garden",
    "desc": "Expansive manicured lawns featuring sculptured flora, decorative topiaries, and ambient garden walkways."
  },
  {
    "num": "15",
    "img": "assets/images/amenities/flower-garden.jpg",
    "title": "Flower Garden",
    "desc": "Curated seasonal botanical flower beds creating vibrant color palettes and aromatic natural surroundings."
  },
  {
    "num": "16",
    "img": "assets/images/amenities/terrace-garden.jpg",
    "title": "Terrace Garden",
    "desc": "Landscaped sky garden on the rooftop offering lush greenery and panoramic skyline vistas."
  },
  {
    "num": "17",
    "img": "assets/images/amenities/terrace-gazebo.jpg",
    "title": "Terrace Gazebo",
    "desc": "Elevated rooftop sheltered pavilion designed for relaxed evening seating with panoramic horizon views."
  },
  {
    "num": "18",
    "img": "assets/images/amenities/terrace-walk-way.jpg",
    "title": "Terrace Walk Way",
    "desc": "Paved skywalk promenade on the terrace level for peaceful morning and sunset rooftop walks."
  },
  {
    "num": "19",
    "img": "assets/images/amenities/yoga-deck.jpg",
    "title": "Yoga Deck",
    "desc": "Dedicated open-air wooden meditation and yoga platform set in a tranquil, nature-infused ambiance."
  },
  {
    "num": "20",
    "img": "assets/images/amenities/entry-garden.jpg",
    "title": "Entry Garden",
    "desc": "Grand landscaped gateway garden welcoming residents and guests with curated ornamental foliage."
  },
  {
    "num": "21",
    "img": "assets/images/amenities/guest-room.jpg",
    "title": "Guest Room",
    "desc": "Elegantly appointed on-site hospitality bedroom suites for visiting family members and personal guests."
  },
  {
    "num": "22",
    "img": "assets/images/amenities/kids-play-area.jpg",
    "title": "Kids play Area",
    "desc": "Vibrant, secure playground with child-safe rubberized flooring, modern slides, and recreational activity units."
  },
  {
    "num": "23",
    "img": "assets/images/amenities/senior-citizen-garden.jpg",
    "title": "Senior Citizen Garden",
    "desc": "Peaceful, shaded leisure haven with ergonomic park benches and gentle reflexology walking paths."
  },
  {
    "num": "24",
    "img": "assets/images/amenities/jogging-track.jpg",
    "title": "Jogging Track",
    "desc": "Specially cushioned, all-weather fitness running circuit bordered by fresh greenery and ambient lighting."
  },
  {
    "num": "25",
    "img": "assets/images/amenities/walk-way.jpg",
    "title": "Walk Way",
    "desc": "Continuous paved pedestrian boulevard connecting residential towers, garden zones, and lifestyle amenities."
  },
  {
    "num": "26",
    "img": "assets/images/amenities/cctv.jpg",
    "title": "CCTV",
    "desc": "24/7 high-definition digital surveillance cameras monitoring key community access zones, gates, and perimeter walls."
  },
  {
    "num": "27",
    "img": "assets/images/amenities/video-door-security-system.jpg",
    "title": "Video Door Security System",
    "desc": "Modern two-way audio-video intercom communication linking individual residences with the main security entry."
  },
  {
    "num": "28",
    "img": "assets/images/amenities/main-door-digital-lock.jpg",
    "title": "Main Door (Digital Lock)",
    "desc": "Contemporary smart biometric and digital keypad locking mechanism securing every private apartment entrance."
  },
  {
    "num": "29",
    "img": "assets/images/amenities/gas-line.jpg",
    "title": "Gas Line",
    "desc": "Reticulated piped cooking gas connection delivered directly to every kitchen for maximum safety and convenience."
  },
  {
    "num": "30",
    "img": "assets/images/amenities/internet-connectivity.jpg",
    "title": "Internet Connectivity",
    "desc": "High-speed fiber-optic telecommunication infrastructure pre-wired for seamless connectivity and smart living."
  },
  {
    "num": "31",
    "img": "assets/images/amenities/main-gate-fountain.jpg",
    "title": "Main Gate Fountain",
    "desc": "Majestic architectural cascading water fountain creating a grand, welcoming entrance statement."
  },
  {
    "num": "32",
    "img": "assets/images/amenities/garden-fountain.jpg",
    "title": "Garden Fountain",
    "desc": "Sculpted central water fountain providing soothing aquatic sounds within the landscaped courtyard."
  },
  {
    "num": "33",
    "img": "assets/images/amenities/elevated-main-gate.jpg",
    "title": "Elevated Main Gate",
    "desc": "Imposing modern security portal with controlled vehicular access barriers and visitor management posts."
  },
  {
    "num": "34",
    "img": "assets/images/amenities/fire-safety.jpg",
    "title": "Fire Safety",
    "desc": "Comprehensive multi-tier fire prevention network including hydrants, hose reels, and automated ceiling sprinklers."
  },
  {
    "num": "35",
    "img": "assets/images/amenities/rain-harvesting-system.jpg",
    "title": "Rain Harvesting System",
    "desc": "Integrated environmental recharge pits capturing rainwater runoff for sustainable groundwater replenishment."
  },
  {
    "num": "36",
    "img": "assets/images/amenities/generator-backup.jpg",
    "title": "Generator Backup",
    "desc": "High-capacity industrial standby power generation system ensuring uninterrupted common service operations."
  },
  {
    "num": "37",
    "img": "assets/images/amenities/free-mobile-charging-facility.jpg",
    "title": "Free Mobile Charging Facility",
    "desc": "Convenient, accessible charging kiosks located in public clubhouse lounges and waiting areas."
  },
  {
    "num": "38",
    "img": "assets/images/amenities/visitors-parking.jpg",
    "title": "Visitors Parking",
    "desc": "Specially demarcated, secure on-site parking bays accommodating visiting cars without resident congestion."
  },
  {
    "num": "39",
    "img": "assets/images/amenities/10-yrs-maintenance.jpg",
    "title": "10 Yrs Maintenance",
    "desc": "Comprehensive professional facility maintenance program guaranteeing pristine long-term property upkeep."
  },
  {
    "num": "40",
    "img": "assets/images/amenities/24-hours-water.jpg",
    "title": "24 Hours Water",
    "desc": "Dual-source treated water distribution network with hydro-pneumatic pumping for round-the-clock water pressure."
  }
];

  // DOM Elements - Login View
  const loginView = document.getElementById('loginView');
  const loginForm = document.getElementById('loginForm');
  const adminIdInput = document.getElementById('adminId');
  const adminPasswordInput = document.getElementById('adminPassword');
  const loginAlert = document.getElementById('loginAlert');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');

  // DOM Elements - Dashboard Workspace
  const dashboardView = document.getElementById('dashboardView');
  const appSidebar = document.getElementById('appSidebar');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const breadcrumbTitle = document.getElementById('breadcrumbTitle');
  const currentDateStr = document.getElementById('currentDateStr');
  const sidebarAdminName = document.getElementById('sidebarAdminName');
  const sidebarAdminRole = document.getElementById('sidebarAdminRole');
  const dashWelcomeName = document.getElementById('dashWelcomeName');
  const sidebarNewBadge = document.getElementById('sidebarNewBadge');
  const logoutBtn = document.getElementById('logoutBtn');

  // DOM Elements - KPI Stats
  const kpiTotal = document.getElementById('kpiTotal');
  const kpiNew = document.getElementById('kpiNew');
  const kpiContacted = document.getElementById('kpiContacted');
  const kpiCompleted = document.getElementById('kpiCompleted');

  // DOM Elements - Leads Table & Filter
  const statusTabs = document.getElementById('statusTabs');
  const countAll = document.getElementById('countAll');
  const countNew = document.getElementById('countNew');
  const countContacted = document.getElementById('countContacted');
  const countCompleted = document.getElementById('countCompleted');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const leadsTbody = document.getElementById('leadsTbody');
  const emptyState = document.getElementById('emptyState');
  const leadsRefreshBtn = document.getElementById('leadsRefreshBtn');
  const leadsExportBtn = document.getElementById('leadsExportBtn');
  const dashExportBtn = document.getElementById('dashExportBtn');

  // DOM Elements - Stream & Containers
  const recentLeadsStream = document.getElementById('recentLeadsStream');
  const projectsContainer = document.getElementById('projectsContainer');
  const galleryContainer = document.getElementById('galleryContainer');
  const adminAmenitiesGrid = document.getElementById('adminAmenitiesGrid');
  const dbTablesTbody = document.getElementById('dbTablesTbody');
  const dbServerVersion = document.getElementById('dbServerVersion');

  // DOM Elements - Modals
  const addLeadModal = document.getElementById('addLeadModal');
  const addLeadForm = document.getElementById('addLeadForm');
  const closeAddModalBtn = document.getElementById('closeAddModalBtn');
  const cancelAddModalBtn = document.getElementById('cancelAddModalBtn');

  const notesModal = document.getElementById('notesModal');
  const notesForm = document.getElementById('notesForm');
  const notesLeadId = document.getElementById('notesLeadId');
  const notesLeadDetails = document.getElementById('notesLeadDetails');
  const notesLeadStatus = document.getElementById('notesLeadStatus');
  const notesLeadText = document.getElementById('notesLeadText');
  const closeNotesModalBtn = document.getElementById('closeNotesModalBtn');
  const cancelNotesModalBtn = document.getElementById('cancelNotesModalBtn');

  const toastContainer = document.getElementById('toastContainer');

  // Set Current Date in Header
  if (currentDateStr) {
    const today = new Date();
    currentDateStr.textContent = today.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  // =========================================================================
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================

  async function checkAuth() {
    if (!authToken) {
      showLoginView();
      return;
    }

    try {
      const res = await fetch(API_URL + '/api/admin/me', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        currentAdmin = data.admin;
        localStorage.setItem('capetown_admin_user', JSON.stringify(currentAdmin));
        showDashboardView();
      } else {
        clearAuth();
        showLoginView();
      }
    } catch (err) {
      console.warn('Network issue checking auth, falling back to local session', err);
      if (currentAdmin) {
        showDashboardView();
      } else {
        showLoginView();
      }
    }
  }

  function showLoginView() {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
    if (adminIdInput) adminIdInput.focus();
  }

  function showDashboardView() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'flex';

    if (currentAdmin) {
      const name = currentAdmin.name || 'Capetown Admin';
      const role = currentAdmin.role || 'Super Administrator';
      const email = currentAdmin.email || 'admin@capetownheights.com';

      if (sidebarAdminName) sidebarAdminName.textContent = name;
      if (sidebarAdminRole) sidebarAdminRole.textContent = role;
      if (dashWelcomeName) dashWelcomeName.textContent = name;

      const setAdminName = document.getElementById('settingsAdminName');
      const setAdminEmail = document.getElementById('settingsAdminEmail');
      if (setAdminName) setAdminName.textContent = name;
      if (setAdminEmail) setAdminEmail.textContent = email;
    }

    // Load initial data
    loadDashboardStats();
    loadEnquiries();
    renderAmenities();
  }

  function clearAuth() {
    authToken = null;
    currentAdmin = null;
    localStorage.removeItem('capetown_admin_token');
    localStorage.removeItem('capetown_admin_user');
  }

  // Password Visibility Toggle
  if (togglePasswordBtn && adminPasswordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPwd = adminPasswordInput.getAttribute('type') === 'password';
      adminPasswordInput.setAttribute('type', isPwd ? 'text' : 'password');
      togglePasswordBtn.style.color = isPwd ? 'var(--primary-mocha)' : 'var(--text-light)';
    });
  }

  // Handle Login Submission (Strictly Admin ID & Password)
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginAlert.style.display = 'none';

      const id = adminIdInput.value.trim();
      const password = adminPasswordInput.value.trim();

      if (!id || !password) {
        showLoginAlert('Please enter both Admin ID and Password.');
        return;
      }

      setLoginLoading(true);

      let data = null;
      let networkFailed = false;

      try {
        const res = await fetch(API_URL + '/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, password })
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await res.json();
        } else if (!res.ok) {
          networkFailed = true;
        }
      } catch (err) {
        console.warn('API connection issue, checking local credentials', err);
        networkFailed = true;
      }

      setLoginLoading(false);

      // 1. Backend API returned successful authentication
      if (data && data.success) {
        authToken = data.token;
        currentAdmin = data.admin;
        localStorage.setItem('capetown_admin_token', authToken);
        localStorage.setItem('capetown_admin_user', JSON.stringify(currentAdmin));

        showToast('Welcome back, ' + (currentAdmin.name || 'Admin') + '!');
        loginForm.reset();
        try {
          showDashboardView();
        } catch (uiErr) {
          console.error('Error rendering dashboard view:', uiErr);
        }
        return;
      }

      // 2. Cloudflare Pages / Offline Fallback: If credentials match default admin, log in seamlessly
      const isDefaultAdmin = (id.toLowerCase() === 'admin' || id.toLowerCase() === 'admin@capetownheights.com') && password === 'admin123';
      if (isDefaultAdmin && (networkFailed || !data)) {
        authToken = 'session-' + Date.now();
        currentAdmin = {
          id: 1,
          name: 'Capetown Admin',
          email: 'admin@capetownheights.com',
          role: 'Super Administrator'
        };
        localStorage.setItem('capetown_admin_token', authToken);
        localStorage.setItem('capetown_admin_user', JSON.stringify(currentAdmin));

        showToast('Welcome back, Admin!');
        loginForm.reset();
        try {
          showDashboardView();
        } catch (uiErr) {
          console.error('Error rendering dashboard view:', uiErr);
        }
        return;
      }

      // 3. Invalid credentials
      showLoginAlert(data?.message || 'Invalid Admin ID or Password. Default: admin / admin123');
    });
  }

  function showLoginAlert(msg) {
    loginAlert.innerHTML = msg;
    loginAlert.style.display = 'block';
  }

  function setLoginLoading(loading) {
    if (!loginSubmitBtn) return;
    const btnText = loginSubmitBtn.querySelector('.btn-text');
    const btnSpinner = loginSubmitBtn.querySelector('.btn-spinner');

    if (loading) {
      loginSubmitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Verifying credentials...';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';
    } else {
      loginSubmitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Sign In to Dashboard';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(API_URL + '/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + authToken }
        });
      } catch (e) {}

      clearAuth();
      showLoginView();
      showToast('You have been logged out successfully.');
    });
  }

  // =========================================================================
  // 2. DASHBOARD NAVIGATION & VIEW SWITCHER
  // =========================================================================

  const viewTitles = {
    'viewDashboard': 'Dashboard Overview',
    'viewLeads': 'Leads & Inquiries',
    'viewProjects': 'Projects & Inventory',
    'viewGallery': 'Site Gallery',
    'viewAmenities': '40 Verified Amenities',
    'viewDatabase': 'MySQL: captown',
    'viewSettings': 'Admin Settings'
  };

  function switchView(targetViewId) {
    const targetPanel = document.getElementById(targetViewId);
    if (!targetPanel) return;

    currentActiveView = targetViewId;

    // Update Sidebar Nav active state
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === targetViewId);
    });

    // Update View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === targetViewId);
    });

    // Update Breadcrumb Title
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = viewTitles[targetViewId] || 'Dashboard';
    }

    // Close Mobile Sidebar if open
    if (appSidebar && appSidebar.classList.contains('open')) {
      appSidebar.classList.remove('open');
    }

    // Scroll to top of body
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Lazy load specific view data
    if (targetViewId === 'viewDashboard') {
      loadDashboardStats();
      renderRecentLeadsStream(allEnquiries);
    } else if (targetViewId === 'viewLeads') {
      loadEnquiries();
    } else if (targetViewId === 'viewProjects') {
      loadProjects();
    } else if (targetViewId === 'viewGallery') {
      loadGallery();
    } else if (targetViewId === 'viewAmenities') {
      renderAmenities();
    } else if (targetViewId === 'viewDatabase') {
      loadDatabase();
    }
  }

  // Wire up all sidebar nav buttons
  document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      switchView(targetView);
    });
  });

  // Mobile Sidebar Toggle
  if (sidebarToggleBtn && appSidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('open');
    });
  }

  // Quick action navigation buttons from Dashboard cards
  const gotoLeadsViewBtn = document.getElementById('gotoLeadsViewBtn');
  if (gotoLeadsViewBtn) {
    gotoLeadsViewBtn.addEventListener('click', () => switchView('viewLeads'));
  }

  const gotoAmenitiesBtn = document.getElementById('gotoAmenitiesBtn');
  if (gotoAmenitiesBtn) {
    gotoAmenitiesBtn.addEventListener('click', () => switchView('viewAmenities'));
  }

  const gotoGalleryBtn = document.getElementById('gotoGalleryBtn');
  if (gotoGalleryBtn) {
    gotoGalleryBtn.addEventListener('click', () => switchView('viewGallery'));
  }

  const gotoDbBtn = document.getElementById('gotoDbBtn');
  if (gotoDbBtn) {
    gotoDbBtn.addEventListener('click', () => switchView('viewDatabase'));
  }

  // Quick KPI Card click to filter leads
  document.querySelectorAll('.kpi-card[data-target="viewLeads"]').forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-filter') || 'all';
      switchView('viewLeads');
      setFilter(filter);
    });
  });

  // =========================================================================
  // 3. DASHBOARD METRICS & RECENT STREAM
  // =========================================================================

  async function loadDashboardStats() {
    let s = null;
    try {
      const res = await fetch(API_URL + '/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) s = data.stats;
      }
    } catch (err) {
      console.warn('API stats unavailable, calculating from stored leads', err);
    }

    if (!s) {
      const leads = getLocalEnquiries();
      s = {
        total: leads.length,
        newLeads: leads.filter(l => (l.status || 'New') === 'New').length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        completed: leads.filter(l => l.status === 'Completed').length
      };
    }

    // KPI Numbers
    if (kpiTotal) kpiTotal.textContent = s.total;
    if (kpiNew) kpiNew.textContent = s.newLeads;
    if (kpiContacted) kpiContacted.textContent = s.contacted;
    if (kpiCompleted) kpiCompleted.textContent = s.completed;

    // Sidebar Badges & Tab Counts
    if (sidebarNewBadge) sidebarNewBadge.textContent = s.newLeads;
    if (countAll) countAll.textContent = s.total;
    if (countNew) countNew.textContent = s.newLeads;
    if (countContacted) countContacted.textContent = s.contacted;
    if (countCompleted) countCompleted.textContent = s.completed;
  }

  function renderRecentLeadsStream(leads) {
    if (!recentLeadsStream) return;

    if (!leads || leads.length === 0) {
      recentLeadsStream.innerHTML = '<div class="stream-loading">No inquiries received yet. Submit the contact form on the website to test!</div>';
      return;
    }

    const recent = leads.slice(0, 5);
    recentLeadsStream.innerHTML = recent.map(lead => {
      const name = lead.name || 'Anonymous Client';
      const initial = name.charAt(0).toUpperCase();
      const phone = lead.phone || 'N/A';
      const status = lead.status || 'New';
      const cleanDigits = (lead.phone || '').replace(/\\D/g, '');
      const waNumber = cleanDigits.length === 10 ? ('91' + cleanDigits) : cleanDigits;

      let statusBadge = '<span class="kpi-trend attention">New</span>';
      if (status === 'Contacted') statusBadge = '<span class="kpi-trend neutral">Contacted</span>';
      if (status === 'Completed') statusBadge = '<span class="kpi-trend success">Completed</span>';

      const timeAgo = formatTimeAgo(lead.createdAt);

      return `
        <div class="stream-item">
          <div class="stream-left">
            <div class="stream-avatar">${escapeHtml(initial)}</div>
            <div class="stream-info">
              <span class="stream-name">${escapeHtml(name)}</span>
              <span class="stream-meta">${escapeHtml(phone)} &bull; ${escapeHtml(lead.projectName || 'Capetown Heights')}</span>
            </div>
          </div>
          <div class="stream-right">
            ${statusBadge}
            ${cleanDigits ? `
              <a href="https://wa.me/${waNumber}?text=Hello%20${encodeURIComponent(name)},%20greetings%20from%20Capetown%20Heights." target="_blank" class="btn-wa" title="Open WhatsApp Chat">WA</a>
            ` : ''}
            <span class="stream-time">${escapeHtml(timeAgo)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return Math.floor(diffSec / 60) + 'm ago';
    if (diffSec < 86400) return Math.floor(diffSec / 3600) + 'h ago';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  // =========================================================================
  // 4. LEADS & INQUIRIES MANAGEMENT
  // =========================================================================

  async function loadEnquiries() {
    if (leadsTbody) {
      leadsTbody.innerHTML = `
        <tr>
          <td colspan="7" class="loading-state">
            <div class="spinner"></div>
            <span>Loading inquiries...</span>
          </td>
        </tr>
      `;
    }
    if (emptyState) emptyState.style.display = 'none';

    let loaded = false;
    try {
      let url = API_URL + '/api/admin/enquiries?status=' + encodeURIComponent(currentFilter);
      if (searchQuery) {
        url += '&search=' + encodeURIComponent(searchQuery);
      }

      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.enquiries) {
          allEnquiries = data.enquiries;
          loaded = true;
        }
      }
    } catch (err) {
      console.warn('API enquiries unavailable, reading from local storage', err);
    }

    if (!loaded) {
      let localLeads = getLocalEnquiries();
      if (currentFilter !== 'all') {
        localLeads = localLeads.filter(l => (l.status || 'New').toLowerCase() === currentFilter.toLowerCase());
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        localLeads = localLeads.filter(l => 
          (l.name || '').toLowerCase().includes(q) ||
          (l.phone || '').toLowerCase().includes(q) ||
          (l.message || '').toLowerCase().includes(q)
        );
      }
      allEnquiries = localLeads;
    }

    renderTable(allEnquiries);
    renderRecentLeadsStream(allEnquiries);
  }

  function renderTable(enquiries) {
    if (!leadsTbody) return;

    if (!enquiries || enquiries.length === 0) {
      leadsTbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    leadsTbody.innerHTML = enquiries.map(lead => {
      const formattedDate = lead.createdAt
        ? new Date(lead.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'N/A';

      const cleanDigits = (lead.phone || '').replace(/\\D/g, '');
      const waNumber = cleanDigits.length === 10 ? ('91' + cleanDigits) : cleanDigits;
      const notesPreview = (lead.notes || '').trim();

      return `
        <tr data-id="${lead.id}">
          <!-- 1. Lead ID & Date -->
          <td>
            <div class="lead-id-wrap">
              <span class="lead-id">#${escapeHtml(lead.id)}</span>
              <span class="lead-date">${escapeHtml(formattedDate)}</span>
            </div>
          </td>

          <!-- 2. Client Info -->
          <td>
            <div class="lead-client">
              <span class="client-name">${escapeHtml(lead.name || 'Anonymous Client')}</span>
              <div class="client-contact-row">
                <a href="tel:${escapeHtml(lead.phone)}" class="contact-link" title="Call Client">
                  <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  <span>${escapeHtml(lead.phone)}</span>
                </a>
                ${cleanDigits ? `
                  <a href="https://wa.me/${waNumber}?text=Hello%20${encodeURIComponent(lead.name || '')},%20greetings%20from%20Capetown%20Heights%20by%20Nirali%20Group." target="_blank" class="btn-wa" title="Open WhatsApp Chat">WA</a>
                ` : ''}
              </div>
              ${lead.email ? `<span style="font-size: 0.75rem; color: var(--text-light);">${escapeHtml(lead.email)}</span>` : ''}
            </div>
          </td>

          <!-- 3. Project & Interest -->
          <td>
            <div class="lead-project">
              <span class="project-name">${escapeHtml(lead.projectName || 'Capetown Heights')}</span>
              <span class="interest-tag">${escapeHtml(lead.interestType || 'Direct Inquiry')}</span>
            </div>
          </td>

          <!-- 4. Client Note / Message -->
          <td>
            <div class="lead-message" title="${escapeHtml(lead.message || 'No client message provided')}">
              ${escapeHtml(lead.message || '—')}
            </div>
          </td>

          <!-- 5. Interactive Status Selector -->
          <td>
            <div class="status-select-wrap">
              <select class="lead-status-select" data-id="${lead.id}">
                <option value="New" ${lead.status === 'New' ? 'selected' : ''}>🟡 New</option>
                <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>🔵 Contacted</option>
                <option value="Completed" ${lead.status === 'Completed' ? 'selected' : ''}>🟢 Completed</option>
              </select>
            </div>
          </td>

          <!-- 6. Admin Remarks / Notes -->
          <td>
            <span class="lead-notes ${!notesPreview ? 'empty' : ''}" 
                  data-id="${lead.id}" 
                  title="Click to edit follow-up remarks">
              ${notesPreview ? escapeHtml(notesPreview) : '+ Add remark...'}
            </span>
          </td>

          <!-- 7. Actions -->
          <td>
            <div class="row-actions">
              <button class="btn-icon-action edit-notes-btn" data-id="${lead.id}" title="Edit Remarks & Details">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              </button>
              <button class="btn-icon-action delete delete-lead-btn" data-id="${lead.id}" data-name="${escapeHtml(lead.name || '')}" title="Delete Lead">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachRowEventListeners();
  }

  function attachRowEventListeners() {
    // Status Change
    document.querySelectorAll('.lead-status-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const id = sel.getAttribute('data-id');
        const newStatus = sel.value;
        await updateLeadStatus(id, newStatus);
      });
    });

    // Edit Notes Click
    document.querySelectorAll('.lead-notes, .edit-notes-btn').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const lead = allEnquiries.find(item => item.id === id);
        if (lead) openNotesModal(lead);
      });
    });

    // Delete Lead Click
    document.querySelectorAll('.delete-lead-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (confirm('Are you sure you want to delete inquiry #' + id + ' for ' + name + '?')) {
          await deleteLead(id);
        }
      });
    });
  }

  async function updateLeadStatus(id, status) {
    try {
      await fetch(API_URL + '/api/admin/enquiries/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {}

    // Update local cache as well
    const leads = getLocalEnquiries();
    const target = leads.find(l => l.id === id);
    if (target) {
      target.status = status;
      localStorage.setItem('capetown_enquiries', JSON.stringify(leads));
    }
    showToast('Status updated to ' + status);
    loadDashboardStats();
    loadEnquiries();
  }

  async function deleteLead(id) {
    try {
      await fetch(API_URL + '/api/admin/enquiries/' + id, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
    } catch (err) {}

    const leads = getLocalEnquiries().filter(l => l.id !== id);
    localStorage.setItem('capetown_enquiries', JSON.stringify(leads));
    showToast('Inquiry #' + id + ' deleted successfully');
    loadDashboardStats();
    loadEnquiries();
  }

  // Filter Tabs Handler
  if (statusTabs) {
    statusTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const status = btn.getAttribute('data-status');
        setFilter(status);
      });
    });
  }

  function setFilter(status) {
    currentFilter = status;
    if (statusTabs) {
      statusTabs.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-status') === status);
      });
    }
    loadEnquiries();
  }

  // Search Handler (with debounce)
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (clearSearchBtn) clearSearchBtn.style.display = val ? 'block' : 'none';

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = val;
        loadEnquiries();
      }, 300);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      searchQuery = '';
      loadEnquiries();
      searchInput.focus();
    });
  }

  // Refresh Buttons
  if (leadsRefreshBtn) {
    leadsRefreshBtn.addEventListener('click', () => {
      loadDashboardStats();
      loadEnquiries();
      showToast('Data refreshed from MySQL');
    });
  }

  // Export CSV Buttons
  [leadsExportBtn, dashExportBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        window.location.href = API_URL + '/api/admin/export?token=' + authToken;
        showToast('Downloading leads CSV export...');
      });
    }
  });

  // =========================================================================
  // 5. PROJECTS & INVENTORY MODULE
  // =========================================================================

  async function loadProjects() {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading projects from database...</span></div>';

    try {
      const res = await fetch(API_URL + '/api/admin/projects', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      const data = await res.json();

      let projects = (res.ok && data.success && data.projects && data.projects.length > 0)
        ? data.projects
        : [
            {
              id: 1,
              name: 'Capetown Heights',
              developer: 'Nirali Group',
              location: 'Silvassa, Dadra & Nagar Haveli',
              type: '2 & 3 BHK Duplex Apartments',
              carpetArea: '950 – 1850 sq.ft.',
              elevation: 'G + 14 Storeys',
              totalUnits: '120 Units Planned',
              status: 'Under Construction (RERA Verified)',
              image: '../assets/images/building-exterior.jpg',
              description: 'Capetown Heights represents the pinnacle of luxury residential living in Silvassa, meticulously developed by Nirali Group with 40 lifestyle amenities, double basement parking, and landscaped sky gardens.'
            }
          ];

      projectsContainer.innerHTML = projects.map(proj => `
        <div class="project-card-full">
          <div class="proj-full-img-wrap">
            <img src="${proj.image || '../assets/images/building-exterior.jpg'}" alt="${escapeHtml(proj.name)}" class="proj-full-img">
          </div>
          <div class="proj-full-content">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span class="auth-dev-badge">${escapeHtml(proj.developer || 'NIRALI GROUP')}</span>
              <span class="badge-status-online">${escapeHtml(proj.status || 'Verified')}</span>
            </div>
            <h3 class="proj-full-title">${escapeHtml(proj.name)}</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">
              ${escapeHtml(proj.description || '')}
            </p>

            <div class="proj-full-meta">
              <div class="spec-item">
                <span class="spec-label">Configurations</span>
                <span class="spec-val">${escapeHtml(proj.type || '2 & 3 BHK Duplex')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Location</span>
                <span class="spec-val">${escapeHtml(proj.location || 'Silvassa')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Carpet Area</span>
                <span class="spec-val">${escapeHtml(proj.carpetArea || '950 – 1850 sq.ft.')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Elevation</span>
                <span class="spec-val">${escapeHtml(proj.elevation || 'G + 14 Storeys')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Total Units</span>
                <span class="spec-val">${escapeHtml(proj.totalUnits || '120 Units')}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Amenities</span>
                <span class="spec-val">40 Lifestyle Facilities</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.85rem; margin-top: auto;">
              <a href="../project-details.html" target="_blank" class="btn-action secondary">
                <span>View Public Project Details &rarr;</span>
              </a>
              <button class="btn-action primary" onclick="document.querySelector('[data-view=viewAmenities]').click()">
                <span>Inspect 40 Amenities</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('Error loading projects', err);
      projectsContainer.innerHTML = '<div style="color: #C53030; padding: 2rem;">Error loading project data.</div>';
    }
  }

  // =========================================================================
  // 6. SITE GALLERY MODULE
  // =========================================================================

  async function loadGallery() {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><span>Loading gallery from database...</span></div>';

    try {
      const res = await fetch(API_URL + '/api/admin/gallery', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      const data = await res.json();

      let items = (res.ok && data.success && data.gallery && data.gallery.length > 0)
        ? data.gallery
        : [
            {
              id: 1,
              title: 'Building Architectural Elevation',
              category: 'Architecture',
              image: '../assets/images/building-exterior.jpg',
              description: 'Modern elevation facade showcasing glass balconies, clean lines, and earth-tone textures.'
            },
            {
              id: 2,
              title: 'Grand Entrance & Landscaped Driveway',
              category: 'Site Atmosphere',
              image: '../assets/images/entrance-view.jpg',
              description: 'Welcoming entrance gates with security barriers, fountain, and tree-lined avenues.'
            },
            {
              id: 3,
              title: 'Double Basement & Covered Parking',
              category: 'Infrastructure',
              image: '../assets/images/amenities/double-basement.jpg',
              description: 'Two-tier subterranean residential parking with dedicated bays and wide turning aisles.'
            },
            {
              id: 4,
              title: 'AC Multipurpose Banquet Hall',
              category: 'Clubhouse',
              image: '../assets/images/amenities/multipurpose-hall.jpg',
              description: 'Climate-controlled social hall designed for family celebrations and community gatherings.'
            },
            {
              id: 5,
              title: 'Marble Temple Devotional Sanctum',
              category: 'Spiritual',
              image: '../assets/images/amenities/temple.jpg',
              description: 'Serene white marble sanctum inside residential grounds for peaceful daily worship.'
            },
            {
              id: 6,
              title: 'Rooftop Gazebo & Sky Garden',
              category: 'Leisure',
              image: '../assets/images/amenities/terrace-gazebo.jpg',
              description: 'Terrace garden with sunset viewing deck, sit-outs, and panoramic Silvassa skyline views.'
            }
          ];

      galleryContainer.innerHTML = items.map(g => `
        <div class="gallery-admin-card">
          <div class="gallery-admin-img-wrap">
            <img src="${g.image}" alt="${escapeHtml(g.title)}" class="gallery-admin-img" loading="lazy">
            <span class="admin-amenity-badge">${escapeHtml(g.category || 'Gallery')}</span>
          </div>
          <div class="gallery-admin-body">
            <h4 class="gallery-admin-title">${escapeHtml(g.title)}</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">
              ${escapeHtml(g.description || '')}
            </p>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('Error loading gallery', err);
      galleryContainer.innerHTML = '<div style="color: #C53030; padding: 2rem;">Error loading gallery images.</div>';
    }
  }

  // =========================================================================
  // 7. 40 VERIFIED AMENITIES MODULE
  // =========================================================================

  function renderAmenities() {
    if (!adminAmenitiesGrid) return;
    if (adminAmenitiesGrid.children.length > 0) return; // Already rendered

    adminAmenitiesGrid.innerHTML = projectAmenities.map(am => `
      <div class="admin-amenity-card">
        <div class="admin-amenity-img-wrap">
          <img src="../${am.img}" alt="${escapeHtml(am.title)}" class="admin-amenity-img" loading="lazy">
          <span class="admin-amenity-badge">#${escapeHtml(am.num)}</span>
        </div>
        <div class="admin-amenity-content">
          <h4 class="admin-amenity-title">${escapeHtml(am.title)}</h4>
          <p class="admin-amenity-desc">${escapeHtml(am.desc)}</p>
        </div>
      </div>
    `).join('');
  }

  // =========================================================================
  // 8. MYSQL DATABASE CONSOLE MODULE
  // =========================================================================

  async function loadDatabase() {
    if (!dbTablesTbody) return;
    dbTablesTbody.innerHTML = '<tr><td colspan="5" class="loading-state"><div class="spinner"></div><span>Inspecting MySQL captown database...</span></td></tr>';

    try {
      const res = await fetch(API_URL + '/api/admin/database', {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (dbServerVersion && data.serverVersion) {
          dbServerVersion.textContent = data.serverVersion;
        }

        const tables = data.tables || [];
        if (tables.length === 0) {
          dbTablesTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No tables found in captown database.</td></tr>';
          return;
        }

        dbTablesTbody.innerHTML = tables.map(t => {
          const tableName = t.table_name || t.TABLE_NAME;
          const engine = t.engine || t.ENGINE || 'InnoDB';
          const rows = t.table_rows !== undefined ? t.table_rows : (t.TABLE_ROWS || 0);
          const dataLength = t.data_length !== undefined ? t.data_length : (t.DATA_LENGTH || 0);
          const sizeKb = (dataLength / 1024).toFixed(1);

          return `
            <tr>
              <td><strong style="color: var(--primary-mocha); font-family: monospace;">${escapeHtml(tableName)}</strong></td>
              <td><span style="font-size: 0.82rem; color: var(--text-muted);">${escapeHtml(engine)}</span></td>
              <td><strong>${escapeHtml(rows)}</strong> records</td>
              <td>${escapeHtml(sizeKb)} KB</td>
              <td><span class="badge-status-online">● Ready</span></td>
            </tr>
          `;
        }).join('');
      } else {
        dbTablesTbody.innerHTML = '<tr><td colspan="5" style="color: #C53030; text-align: center; padding: 2rem;">' + (data.message || 'Database inspection failed.') + '</td></tr>';
      }
    } catch (err) {
      console.error('Error loading database diagnostics', err);
      dbTablesTbody.innerHTML = '<tr><td colspan="5" style="color: #C53030; text-align: center; padding: 2rem;">Unable to inspect database tables.</td></tr>';
    }
  }

  // =========================================================================
  // 9. MODALS (ADD LEAD & EDIT NOTES)
  // =========================================================================

  // Add Lead Modal Triggering
  const openAddLeadBtnTop = document.getElementById('openAddLeadBtnTop');
  const openAddLeadBtn = document.getElementById('openAddLeadBtn');
  const dashAddLeadBtn = document.getElementById('dashAddLeadBtn');

  [openAddLeadBtnTop, openAddLeadBtn, dashAddLeadBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (addLeadForm) addLeadForm.reset();
        if (addLeadModal) {
          addLeadModal.style.display = 'flex';
          const nameInput = document.getElementById('addName');
          if (nameInput) nameInput.focus();
        }
      });
    }
  });

  [closeAddModalBtn, cancelAddModalBtn].forEach(b => {
    if (b) b.addEventListener('click', () => {
      if (addLeadModal) addLeadModal.style.display = 'none';
    });
  });

  if (addLeadForm) {
    addLeadForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('addName').value.trim();
      const phone = document.getElementById('addPhone').value.trim();
      const email = document.getElementById('addEmail').value.trim();
      const projectName = document.getElementById('addProject').value.trim();
      const interestType = document.getElementById('addInterest').value;
      const status = document.getElementById('addStatus').value;
      const message = document.getElementById('addMessage').value.trim();
      const notes = document.getElementById('addNotes').value.trim();

      if (!name || !phone) {
        alert('Please fill Name and Contact Number.');
        return;
      }

      try {
        const res = await fetch(API_URL + '/api/admin/enquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify({
            name, phone, email, projectName, interestType, status, message, notes
          })
        });

        try {
          await fetch(API_URL + '/api/admin/enquiries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
              name, phone, email, projectName, interestType, status, message, notes
            })
          });
        } catch (e) {}

        const newLead = {
          id: 'enq-' + Date.now().toString().slice(-4),
          name, phone, email, projectName: projectName || 'Capetown Heights',
          interestType: interestType || 'Direct Inquiry',
          status: status || 'New',
          message: message || '',
          notes: notes || '',
          source: 'Admin Console',
          createdAt: new Date().toISOString()
        };
        const local = getLocalEnquiries();
        local.unshift(newLead);
        localStorage.setItem('capetown_enquiries', JSON.stringify(local));

        addLeadModal.style.display = 'none';
        showToast('New lead added successfully!');
        loadDashboardStats();
        loadEnquiries();
      } catch (err) {
        alert('Error processing lead.');
      }
    });
  }

  // Edit Notes Modal
  function openNotesModal(lead) {
    if (!notesModal) return;
    notesLeadId.value = lead.id;
    notesLeadDetails.innerHTML = '<strong>' + escapeHtml(lead.name) + '</strong> &bull; ' + escapeHtml(lead.phone) + ' &bull; ' + escapeHtml(lead.projectName || 'Capetown Heights');
    notesLeadStatus.value = lead.status || 'New';
    notesLeadText.value = lead.notes || '';
    notesModal.style.display = 'flex';
    notesLeadText.focus();
  }

  [closeNotesModalBtn, cancelNotesModalBtn].forEach(b => {
    if (b) b.addEventListener('click', () => {
      if (notesModal) notesModal.style.display = 'none';
    });
  });

  if (notesForm) {
    notesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = notesLeadId.value;
      const status = notesLeadStatus.value;
      const notes = notesLeadText.value.trim();

      try {
        try {
          await fetch(API_URL + '/api/admin/enquiries/' + id, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({ status, notes })
          });
        } catch (e) {}

        const local = getLocalEnquiries();
        const target = local.find(l => l.id === id);
        if (target) {
          target.status = status;
          target.notes = notes;
          localStorage.setItem('capetown_enquiries', JSON.stringify(local));
        }

        notesModal.style.display = 'none';
        showToast('Remarks updated successfully!');
        loadDashboardStats();
        loadEnquiries();
      } catch (err) {
        alert('Error updating remarks.');
      }
    });
  }

  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target === addLeadModal) addLeadModal.style.display = 'none';
    if (e.target === notesModal) notesModal.style.display = 'none';
  });

  // =========================================================================
  // 10. HELPER UTILITIES
  // =========================================================================

  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    if (type === 'error') {
      toast.style.borderLeftColor = '#E53E3E';
    }

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start Auth Check on load
  checkAuth();
});
