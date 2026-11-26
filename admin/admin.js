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
  let liveAmenities = [];

  const DEFAULT_LEADS = [
    {
      id: 'enq-1795689834183',
      name: 'Himanshu Manoj Singh',
      phone: '919328603748',
      email: '',
      projectName: 'Capetown Heights',
      interestType: 'Direct Website Form',
      message: 'fxnvxcnxcvn',
      status: 'New',
      source: 'Website Direct',
      notes: '',
      createdAt: '2026-11-26T10:43:00.000Z'
    },
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

  function getDeletedEnquiryIds() {
    try {
      const stored = localStorage.getItem('capetown_deleted_enquiries');
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {}
    return new Set();
  }

  function markEnquiryDeleted(id) {
    try {
      const deleted = getDeletedEnquiryIds();
      deleted.add(String(id));
      localStorage.setItem('capetown_deleted_enquiries', JSON.stringify([...deleted]));
    } catch (e) {}
  }

  function getLocalEnquiries() {
    const deletedIds = getDeletedEnquiryIds();
    let leads = [];
    try {
      const stored = localStorage.getItem('capetown_enquiries');
      if (stored) leads = JSON.parse(stored);
    } catch (e) {}

    const leadMap = new Map();
    DEFAULT_LEADS.forEach(l => {
      if (l && l.id && !deletedIds.has(String(l.id))) {
        leadMap.set(String(l.id), l);
      }
    });
    leads.forEach(l => {
      if (l && l.id && !deletedIds.has(String(l.id))) {
        const existing = leadMap.get(String(l.id));
        leadMap.set(String(l.id), existing ? { ...existing, ...l } : l);
      }
    });

    const combined = Array.from(leadMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    try {
      localStorage.setItem('capetown_enquiries', JSON.stringify(combined));
    } catch (e) {}
    return combined;
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
    "title": "Big Gym",
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

  // DOM Elements - Amenities Modals & Controls
  const openAddAmenityBtn = document.getElementById('openAddAmenityBtn');
  const addAmenityModal = document.getElementById('addAmenityModal');
  const addAmenityForm = document.getElementById('addAmenityForm');
  const addAmenityNum = document.getElementById('addAmenityNum');
  const addAmenityTitle = document.getElementById('addAmenityTitle');
  const addAmenityImg = document.getElementById('addAmenityImg');
  const addAmenityDesc = document.getElementById('addAmenityDesc');
  const addAmenityFileInput = document.getElementById('addAmenityFileInput');
  const addAmenityChangeBtn = document.getElementById('addAmenityChangeBtn');
  const addAmenityBtnText = document.getElementById('addAmenityBtnText');
  const addAmenityPreviewImg = document.getElementById('addAmenityPreviewImg');
  const addAmenityStatusText = document.getElementById('addAmenityStatusText');
  const closeAddAmenityModalBtn = document.getElementById('closeAddAmenityModalBtn');
  const cancelAddAmenityModalBtn = document.getElementById('cancelAddAmenityModalBtn');

  const editAmenityModal = document.getElementById('editAmenityModal');
  const editAmenityForm = document.getElementById('editAmenityForm');
  const editAmenityOriginalNum = document.getElementById('editAmenityOriginalNum');
  const editAmenityNum = document.getElementById('editAmenityNum');
  const editAmenityTitle = document.getElementById('editAmenityTitle');
  const editAmenityImg = document.getElementById('editAmenityImg');
  const editAmenityDesc = document.getElementById('editAmenityDesc');
  const editAmenityFileInput = document.getElementById('editAmenityFileInput');
  const editAmenityChangeBtn = document.getElementById('editAmenityChangeBtn');
  const editAmenityPreviewImg = document.getElementById('editAmenityPreviewImg');
  const editAmenityStatusText = document.getElementById('editAmenityStatusText');
  const closeEditAmenityModalBtn = document.getElementById('closeEditAmenityModalBtn');
  const cancelEditAmenityModalBtn = document.getElementById('cancelEditAmenityModalBtn');

  // DOM Elements - Gallery Modals & Controls
  const openAddGalleryBtn = document.getElementById('openAddGalleryBtn');
  const addGalleryModal = document.getElementById('addGalleryModal');
  const addGalleryForm = document.getElementById('addGalleryForm');
  const addGalleryTitle = document.getElementById('addGalleryTitle');
  const addGalleryCategory = document.getElementById('addGalleryCategory');
  const addGalleryImg = document.getElementById('addGalleryImg');
  const addGalleryCaption = document.getElementById('addGalleryCaption');
  const addGalleryFileInput = document.getElementById('addGalleryFileInput');
  const addGalleryChangeBtn = document.getElementById('addGalleryChangeBtn');
  const addGalleryBtnText = document.getElementById('addGalleryBtnText');
  const addGalleryPreviewImg = document.getElementById('addGalleryPreviewImg');
  const addGalleryStatusText = document.getElementById('addGalleryStatusText');
  const closeAddGalleryModalBtn = document.getElementById('closeAddGalleryModalBtn');
  const cancelAddGalleryModalBtn = document.getElementById('cancelAddGalleryModalBtn');

  const editGalleryModal = document.getElementById('editGalleryModal');
  const editGalleryForm = document.getElementById('editGalleryForm');
  const editGalleryId = document.getElementById('editGalleryId');
  const editGalleryTitle = document.getElementById('editGalleryTitle');
  const editGalleryCategory = document.getElementById('editGalleryCategory');
  const editGalleryImg = document.getElementById('editGalleryImg');
  const editGalleryCaption = document.getElementById('editGalleryCaption');
  const editGalleryFileInput = document.getElementById('editGalleryFileInput');
  const editGalleryChangeBtn = document.getElementById('editGalleryChangeBtn');
  const editGalleryPreviewImg = document.getElementById('editGalleryPreviewImg');
  const editGalleryStatusText = document.getElementById('editGalleryStatusText');
  const closeEditGalleryModalBtn = document.getElementById('closeEditGalleryModalBtn');
  const cancelEditGalleryModalBtn = document.getElementById('cancelEditGalleryModalBtn');

  // DOM Elements - Contact Modals & Controls
  const contactsContainer = document.getElementById('contactsContainer');
  const openAddContactBtn = document.getElementById('openAddContactBtn');
  const addContactModal = document.getElementById('addContactModal');
  const addContactForm = document.getElementById('addContactForm');
  const addContactTitle = document.getElementById('addContactTitle');
  const addContactIsPrimary = document.getElementById('addContactIsPrimary');
  const addContactPhone = document.getElementById('addContactPhone');
  const addContactPhoneSub = document.getElementById('addContactPhoneSub');
  const addContactEmail = document.getElementById('addContactEmail');
  const addContactAddress = document.getElementById('addContactAddress');
  const addContactPlusCode = document.getElementById('addContactPlusCode');
  const addContactGoogleRating = document.getElementById('addContactGoogleRating');
  const addContactDevName = document.getElementById('addContactDevName');
  const addContactDevDesc = document.getElementById('addContactDevDesc');
  const addContactDirectionsUrl = document.getElementById('addContactDirectionsUrl');
  const addContactReviewsUrl = document.getElementById('addContactReviewsUrl');
  const addContactInstagramUrl = document.getElementById('addContactInstagramUrl');
  const addContactFacebookUrl = document.getElementById('addContactFacebookUrl');
  const closeAddContactModalBtn = document.getElementById('closeAddContactModalBtn');
  const cancelAddContactModalBtn = document.getElementById('cancelAddContactModalBtn');

  const editContactModal = document.getElementById('editContactModal');
  const editContactForm = document.getElementById('editContactForm');
  const editContactId = document.getElementById('editContactId');
  const editContactTitle = document.getElementById('editContactTitle');
  const editContactIsPrimary = document.getElementById('editContactIsPrimary');
  const editContactPhone = document.getElementById('editContactPhone');
  const editContactPhoneSub = document.getElementById('editContactPhoneSub');
  const editContactEmail = document.getElementById('editContactEmail');
  const editContactAddress = document.getElementById('editContactAddress');
  const editContactPlusCode = document.getElementById('editContactPlusCode');
  const editContactGoogleRating = document.getElementById('editContactGoogleRating');
  const editContactDevName = document.getElementById('editContactDevName');
  const editContactDevDesc = document.getElementById('editContactDevDesc');
  const editContactDirectionsUrl = document.getElementById('editContactDirectionsUrl');
  const editContactReviewsUrl = document.getElementById('editContactReviewsUrl');
  const editContactInstagramUrl = document.getElementById('editContactInstagramUrl');
  const editContactFacebookUrl = document.getElementById('editContactFacebookUrl');
  const closeEditContactModalBtn = document.getElementById('closeEditContactModalBtn');
  const cancelEditContactModalBtn = document.getElementById('cancelEditContactModalBtn');

  // DOM Elements - Projects Modals & Controls
  const sidebarProjectsBadge = document.getElementById('sidebarProjectsBadge');
  const openAddProjectBtn = document.getElementById('openAddProjectBtn');
  const addProjectModal = document.getElementById('addProjectModal');
  const addProjectForm = document.getElementById('addProjectForm');
  const addProjectTitle = document.getElementById('addProjectTitle');
  const addProjectDev = document.getElementById('addProjectDev');
  const addProjectStatus = document.getElementById('addProjectStatus');
  const addProjectLocation = document.getElementById('addProjectLocation');
  const addProjectConfig = document.getElementById('addProjectConfig');
  const addProjectCarpet = document.getElementById('addProjectCarpet');
  const addProjectElevation = document.getElementById('addProjectElevation');
  const addProjectUnits = document.getElementById('addProjectUnits');
  const addProjectAmenities = document.getElementById('addProjectAmenities');
  const addProjectImg = document.getElementById('addProjectImg');
  const addProjectFileInput = document.getElementById('addProjectFileInput');
  const addProjectChangeBtn = document.getElementById('addProjectChangeBtn');
  const addProjectPreviewImg = document.getElementById('addProjectPreviewImg');
  const addProjectDesc = document.getElementById('addProjectDesc');
  const closeAddProjectModalBtn = document.getElementById('closeAddProjectModalBtn');
  const cancelAddProjectModalBtn = document.getElementById('cancelAddProjectModalBtn');

  const editProjectModal = document.getElementById('editProjectModal');
  const editProjectForm = document.getElementById('editProjectForm');
  const editProjectId = document.getElementById('editProjectId');
  const editProjectTitle = document.getElementById('editProjectTitle');
  const editProjectDev = document.getElementById('editProjectDev');
  const editProjectStatus = document.getElementById('editProjectStatus');
  const editProjectLocation = document.getElementById('editProjectLocation');
  const editProjectConfig = document.getElementById('editProjectConfig');
  const editProjectCarpet = document.getElementById('editProjectCarpet');
  const editProjectElevation = document.getElementById('editProjectElevation');
  const editProjectUnits = document.getElementById('editProjectUnits');
  const editProjectAmenities = document.getElementById('editProjectAmenities');
  const editProjectImg = document.getElementById('editProjectImg');
  const editProjectFileInput = document.getElementById('editProjectFileInput');
  const editProjectChangeBtn = document.getElementById('editProjectChangeBtn');
  const editProjectPreviewImg = document.getElementById('editProjectPreviewImg');
  const editProjectDesc = document.getElementById('editProjectDesc');
  const closeEditProjectModalBtn = document.getElementById('closeEditProjectModalBtn');
  const cancelEditProjectModalBtn = document.getElementById('cancelEditProjectModalBtn');

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
    loadAmenities();
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
    'viewContact': 'Contact & Offices',
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
      loadAmenities();
    } else if (targetViewId === 'viewContact') {
      loadContacts();
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

    const leads = getLocalEnquiries();
    if (!s) {
      s = {
        total: leads.length,
        newLeads: leads.filter(l => (l.status || 'New') === 'New').length,
        contacted: leads.filter(l => l.status === 'Contacted').length,
        completed: leads.filter(l => l.status === 'Completed').length
      };
    } else {
      const localTotal = leads.length;
      if (localTotal > s.total) {
        s.total = localTotal;
        s.newLeads = leads.filter(l => (l.status || 'New') === 'New').length;
        s.contacted = leads.filter(l => l.status === 'Contacted').length;
        s.completed = leads.filter(l => l.status === 'Completed').length;
      }
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

    const deletedIds = getDeletedEnquiryIds();
    let localLeads = getLocalEnquiries();
    let serverLeads = [];

    try {
      let url = API_URL + '/api/admin/enquiries?status=all';
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.enquiries)) {
          serverLeads = data.enquiries;
        }
      }
    } catch (err) {
      console.warn('API enquiries unavailable, reading from local storage', err);
    }

    // Merge server leads and local leads by ID
    const mergedMap = new Map();
    DEFAULT_LEADS.forEach(lead => {
      if (lead && lead.id && !deletedIds.has(String(lead.id))) {
        mergedMap.set(String(lead.id), lead);
      }
    });
    serverLeads.forEach(lead => {
      if (lead && lead.id && !deletedIds.has(String(lead.id))) {
        mergedMap.set(String(lead.id), lead);
      }
    });
    localLeads.forEach(lead => {
      if (lead && lead.id && !deletedIds.has(String(lead.id))) {
        const existing = mergedMap.get(String(lead.id));
        mergedMap.set(String(lead.id), existing ? { ...existing, ...lead } : lead);
      }
    });

    let combined = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    try {
      localStorage.setItem('capetown_enquiries', JSON.stringify(combined));
    } catch (e) {}

    let filtered = combined;
    if (currentFilter !== 'all') {
      filtered = filtered.filter(l => (l.status || 'New').toLowerCase() === currentFilter.toLowerCase());
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q) ||
        (l.message || '').toLowerCase().includes(q)
      );
    }

    allEnquiries = filtered;
    renderTable(allEnquiries);
    renderRecentLeadsStream(combined);
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
                  <a href="https://wa.me/${waNumber}?text=Hello%20${encodeURIComponent(lead.name || '')},%20greetings%20from%20Capetown%20Heights%20by%20Nirali%20infra." target="_blank" class="btn-wa" title="Open WhatsApp Chat">WA</a>
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
    const targetAll = allEnquiries.find(l => String(l.id) === String(id));
    if (targetAll) targetAll.status = status;

    const leads = getLocalEnquiries();
    const target = leads.find(l => String(l.id) === String(id));
    if (target) {
      target.status = status;
      localStorage.setItem('capetown_enquiries', JSON.stringify(leads));
    }
    showToast('Status updated to ' + status);

    try {
      await fetch(API_URL + '/api/admin/enquiries/' + encodeURIComponent(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + authToken
        },
        body: JSON.stringify({ status })
      });
    } catch (err) {}

    loadDashboardStats();
    loadEnquiries();
  }

  async function deleteLead(id) {
    markEnquiryDeleted(id);
    allEnquiries = allEnquiries.filter(l => String(l.id) !== String(id));
    const leads = getLocalEnquiries().filter(l => String(l.id) !== String(id));
    localStorage.setItem('capetown_enquiries', JSON.stringify(leads));

    renderTable(allEnquiries);
    renderRecentLeadsStream(allEnquiries);
    showToast('Inquiry #' + id + ' deleted successfully');

    try {
      await fetch(API_URL + '/api/admin/enquiries/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + authToken }
      });
    } catch (err) {}

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
  // 5. PROJECTS & INVENTORY MODULE (CRUD)
  // =========================================================================

  const defaultProjectsList = [
    {
      id: 'proj-capetown-heights',
      name: 'Capetown Heights',
      title: 'Capetown Heights',
      developer: 'NIRALI GROUP',
      status: 'Under Construction',
      type: 'Luxury Residential & Commercial Development',
      configurations: 'Luxury Residential & Commercial Development',
      location: 'Silvassa, Dadra & Nagar Haveli',
      carpetArea: '950 – 1850 sq.ft.',
      elevation: 'G + 14 Storeys',
      totalUnits: '180',
      amenitiesCount: '40 Lifestyle Facilities',
      amenities: '40 Lifestyle Facilities',
      image: 'assets/images/building-exterior.jpg',
      description: 'Capetown Heights represents the pinnacle of luxury residential living in Silvassa, meticulously developed by Nirali infra with 40 lifestyle amenities, double basement parking, and landscaped sky gardens.'
    }
  ];

  let liveProjects = [];

  function updateProjectsBadge(count) {
    if (sidebarProjectsBadge) sidebarProjectsBadge.textContent = count;
  }

  function resolveProjectImg(img) {
    if (!img) return '../assets/images/building-exterior.jpg';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:image/')) return img;
    if (img.startsWith('../')) return img;
    if (img.startsWith('assets/')) return '../' + img;
    if (img.startsWith('/')) return '..' + img;
    return '../' + img;
  }

  function renderProjectsList(projects) {
    if (!projectsContainer) return;
    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No projects currently registered in inventory.</p>
          <button type="button" class="btn-action primary" onclick="document.getElementById('openAddProjectBtn')?.click()">+ Add First Project</button>
        </div>
      `;
      return;
    }

    projectsContainer.innerHTML = projects.map(proj => {
      const pId = escapeHtml(String(proj.id));
      const pTitle = escapeHtml(proj.title || proj.name || 'Capetown Heights');
      const pDev = escapeHtml(proj.developer || 'NIRALI GROUP');
      const pStatus = escapeHtml(proj.status || 'Under Construction');
      const pConfig = escapeHtml(proj.configurations || proj.type || 'Luxury Residential & Commercial Development');
      const pLoc = escapeHtml(proj.location || 'Silvassa, Dadra & Nagar Haveli');
      const pCarpet = escapeHtml(proj.carpetArea || '950 – 1850 sq.ft.');
      const pElev = escapeHtml(proj.elevation || 'G + 14 Storeys');
      const pUnits = escapeHtml(String(proj.totalUnits || '180'));
      const pAmenities = escapeHtml(proj.amenities || proj.amenitiesCount || '40 Lifestyle Facilities');
      const pImg = resolveProjectImg(proj.image);
      const pDesc = escapeHtml(proj.description || '');

      return `
        <div class="project-card-full" data-project-id="${pId}">
          <div class="proj-full-img-wrap">
            <img src="${pImg}" alt="${pTitle}" class="proj-full-img" loading="lazy" onerror="this.src='../assets/images/building-exterior.jpg'">
          </div>
          <div class="proj-full-content">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
              <span class="auth-dev-badge">${pDev}</span>
              <span class="badge-status-online" style="background: #EBF8FF; color: #2B6CB0; border-color: #BEE3F8;">${pStatus}</span>
            </div>
            <h3 class="proj-full-title">${pTitle}</h3>
            ${pDesc ? `<p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 1rem;">${pDesc}</p>` : ''}

            <div class="proj-full-meta">
              <div class="spec-item">
                <span class="spec-label">Configurations</span>
                <span class="spec-val">${pConfig}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Location</span>
                <span class="spec-val">${pLoc}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Carpet Area</span>
                <span class="spec-val">${pCarpet}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Elevation</span>
                <span class="spec-val">${pElev}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Total Units</span>
                <span class="spec-val">${pUnits}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Amenities</span>
                <span class="spec-val">${pAmenities}</span>
              </div>
            </div>

            <div class="proj-card-actions">
              <a href="../project-details.html" target="_blank" class="btn-action secondary">
                <span>View Public Project Details &rarr;</span>
              </a>
              <button type="button" class="btn-action secondary" onclick="document.querySelector('[data-view=viewAmenities]').click()">
                <span>Inspect 40 Amenities</span>
              </button>
              <button type="button" class="btn-action primary" data-action="edit-project" data-id="${pId}">
                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <span>Edit Project</span>
              </button>
              <button type="button" class="btn-action danger" data-action="delete-project" data-id="${pId}">
                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadProjects() {
    if (!projectsContainer) return;

    // Load from cache or defaults first
    try {
      const cached = localStorage.getItem('capetown_projects');
      if (cached) {
        liveProjects = JSON.parse(cached);
      } else {
        liveProjects = defaultProjectsList;
      }
    } catch (e) {
      liveProjects = defaultProjectsList;
    }

    renderProjectsList(liveProjects);
    updateProjectsBadge(liveProjects.length);

    try {
      const res = await fetch(API_URL + '/api/admin/projects', {
        headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.projects) && data.projects.length > 0) {
        liveProjects = data.projects;
        try {
          localStorage.setItem('capetown_projects', JSON.stringify(liveProjects));
        } catch (e) {}
        renderProjectsList(liveProjects);
        updateProjectsBadge(liveProjects.length);
      }
    } catch (err) {
      console.warn('Unable to reach server for projects, using cached:', err);
    }
  }

  // Helper for Project Image Upload
  async function processProjectImageFile(file, imgInputEl, previewImgEl) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      if (previewImgEl) {
        previewImgEl.src = dataUrl;
        previewImgEl.style.display = 'block';
      }
      if (imgInputEl) imgInputEl.value = dataUrl;

      try {
        const res = await fetch(API_URL + '/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({ image: dataUrl, name: file.name })
        });
        const d = await res.json();
        if (res.ok && d.success && d.url) {
          if (imgInputEl) imgInputEl.value = d.url;
          showToast('Image uploaded successfully!', 'success');
        }
      } catch (uploadErr) {
        console.warn('Fallback to Data URL:', uploadErr);
      }
    };
    reader.readAsDataURL(file);
  }

  // Open Add Project Modal
  if (openAddProjectBtn && addProjectModal) {
    openAddProjectBtn.addEventListener('click', () => {
      if (addProjectForm) addProjectForm.reset();
      if (addProjectPreviewImg) addProjectPreviewImg.style.display = 'none';
      if (addProjectDev) addProjectDev.value = 'NIRALI GROUP';
      if (addProjectStatus) addProjectStatus.value = 'Under Construction';
      if (addProjectLocation) addProjectLocation.value = 'Silvassa, Dadra & Nagar Haveli';
      if (addProjectElevation) addProjectElevation.value = 'G + 14 Storeys';
      if (addProjectAmenities) addProjectAmenities.value = '40 Lifestyle Facilities';
      addProjectModal.style.display = 'flex';
      if (addProjectTitle) addProjectTitle.focus();
    });
  }

  if (closeAddProjectModalBtn && addProjectModal) {
    closeAddProjectModalBtn.addEventListener('click', () => addProjectModal.style.display = 'none');
  }
  if (cancelAddProjectModalBtn && addProjectModal) {
    cancelAddProjectModalBtn.addEventListener('click', () => addProjectModal.style.display = 'none');
  }

  // Add Project Image File Picker
  if (addProjectChangeBtn && addProjectFileInput) {
    addProjectChangeBtn.addEventListener('click', () => addProjectFileInput.click());
  }
  if (addProjectFileInput) {
    addProjectFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processProjectImageFile(e.target.files[0], addProjectImg, addProjectPreviewImg);
      }
    });
  }

  // Add Project Form Submission
  if (addProjectForm) {
    addProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = addProjectTitle ? addProjectTitle.value.trim() : '';
      const dev = addProjectDev ? addProjectDev.value.trim() : 'NIRALI GROUP';
      const status = addProjectStatus ? addProjectStatus.value.trim() : 'Under Construction';
      const location = addProjectLocation ? addProjectLocation.value.trim() : '';
      const config = addProjectConfig ? addProjectConfig.value.trim() : '';
      const carpet = addProjectCarpet ? addProjectCarpet.value.trim() : '';
      const elevation = addProjectElevation ? addProjectElevation.value.trim() : 'G + 14 Storeys';
      const units = addProjectUnits ? addProjectUnits.value.trim() : '';
      const amenities = addProjectAmenities ? addProjectAmenities.value.trim() : '40 Lifestyle Facilities';
      const img = addProjectImg ? addProjectImg.value.trim() : 'assets/images/building-exterior.jpg';
      const desc = addProjectDesc ? addProjectDesc.value.trim() : '';

      if (!title || !config) {
        showToast('Please fill in Project Name and Configurations.', 'error');
        return;
      }

      const newProj = {
        id: `proj-${Date.now()}`,
        name: title,
        title: title,
        developer: dev,
        status: status,
        type: config,
        configurations: config,
        location: location,
        carpetArea: carpet,
        elevation: elevation,
        totalUnits: units,
        amenitiesCount: amenities,
        amenities: amenities,
        image: img,
        description: desc
      };

      liveProjects.unshift(newProj);
      try {
        localStorage.setItem('capetown_projects', JSON.stringify(liveProjects));
      } catch (err) {}

      renderProjectsList(liveProjects);
      updateProjectsBadge(liveProjects.length);
      addProjectModal.style.display = 'none';
      showToast('Project added successfully!', 'success');

      try {
        await fetch(API_URL + '/api/admin/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify(newProj)
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, saved locally:', apiErr);
      }
    });
  }

  // Close Edit Project Modal
  if (closeEditProjectModalBtn && editProjectModal) {
    closeEditProjectModalBtn.addEventListener('click', () => editProjectModal.style.display = 'none');
  }
  if (cancelEditProjectModalBtn && editProjectModal) {
    cancelEditProjectModalBtn.addEventListener('click', () => editProjectModal.style.display = 'none');
  }

  // Edit Project Image File Picker
  if (editProjectChangeBtn && editProjectFileInput) {
    editProjectChangeBtn.addEventListener('click', () => editProjectFileInput.click());
  }
  if (editProjectFileInput) {
    editProjectFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processProjectImageFile(e.target.files[0], editProjectImg, editProjectPreviewImg);
      }
    });
  }

  // Edit Project Form Submission
  if (editProjectForm) {
    editProjectForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editProjectId ? editProjectId.value : '';
      const title = editProjectTitle ? editProjectTitle.value.trim() : '';
      const dev = editProjectDev ? editProjectDev.value.trim() : 'NIRALI GROUP';
      const status = editProjectStatus ? editProjectStatus.value.trim() : 'Under Construction';
      const location = editProjectLocation ? editProjectLocation.value.trim() : '';
      const config = editProjectConfig ? editProjectConfig.value.trim() : '';
      const carpet = editProjectCarpet ? editProjectCarpet.value.trim() : '';
      const elevation = editProjectElevation ? editProjectElevation.value.trim() : 'G + 14 Storeys';
      const units = editProjectUnits ? editProjectUnits.value.trim() : '';
      const amenities = editProjectAmenities ? editProjectAmenities.value.trim() : '40 Lifestyle Facilities';
      const img = editProjectImg ? editProjectImg.value.trim() : 'assets/images/building-exterior.jpg';
      const desc = editProjectDesc ? editProjectDesc.value.trim() : '';

      if (!title || !config) {
        showToast('Please fill in Project Name and Configurations.', 'error');
        return;
      }

      const idx = liveProjects.findIndex(p => String(p.id) === String(id));
      if (idx !== -1) {
        liveProjects[idx] = {
          ...liveProjects[idx],
          name: title,
          title: title,
          developer: dev,
          status: status,
          type: config,
          configurations: config,
          location: location,
          carpetArea: carpet,
          elevation: elevation,
          totalUnits: units,
          amenitiesCount: amenities,
          amenities: amenities,
          image: img,
          description: desc
        };
      }

      try {
        localStorage.setItem('capetown_projects', JSON.stringify(liveProjects));
      } catch (err) {}

      renderProjectsList(liveProjects);
      editProjectModal.style.display = 'none';
      showToast('Project updated successfully!', 'success');

      try {
        await fetch(API_URL + '/api/admin/projects/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({
            title,
            name: title,
            developer: dev,
            status,
            configurations: config,
            type: config,
            location,
            carpetArea: carpet,
            elevation,
            totalUnits: units,
            amenities,
            amenitiesCount: amenities,
            image: img,
            description: desc
          })
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, updated locally:', apiErr);
      }
    });
  }

  // Event Delegation for Edit & Delete on #projectsContainer
  if (projectsContainer) {
    projectsContainer.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit-project"]');
      const deleteBtn = e.target.closest('[data-action="delete-project"]');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const proj = liveProjects.find(p => String(p.id) === String(id));
        if (!proj) return;

        if (editProjectId) editProjectId.value = proj.id;
        if (editProjectTitle) editProjectTitle.value = proj.title || proj.name || '';
        if (editProjectDev) editProjectDev.value = proj.developer || 'NIRALI GROUP';
        if (editProjectStatus) editProjectStatus.value = proj.status || 'Under Construction';
        if (editProjectLocation) editProjectLocation.value = proj.location || 'Silvassa, Dadra & Nagar Haveli';
        if (editProjectConfig) editProjectConfig.value = proj.configurations || proj.type || '';
        if (editProjectCarpet) editProjectCarpet.value = proj.carpetArea || '';
        if (editProjectElevation) editProjectElevation.value = proj.elevation || 'G + 14 Storeys';
        if (editProjectUnits) editProjectUnits.value = proj.totalUnits || '';
        if (editProjectAmenities) editProjectAmenities.value = proj.amenities || proj.amenitiesCount || '40 Lifestyle Facilities';
        if (editProjectImg) editProjectImg.value = proj.image || '';
        if (editProjectPreviewImg) {
          if (proj.image) {
            editProjectPreviewImg.src = resolveProjectImg(proj.image);
            editProjectPreviewImg.style.display = 'block';
          } else {
            editProjectPreviewImg.style.display = 'none';
          }
        }
        if (editProjectDesc) editProjectDesc.value = proj.description || '';

        editProjectModal.style.display = 'flex';
        return;
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (liveProjects.length <= 1) {
          showToast('Cannot delete the only remaining project.', 'error');
          return;
        }

        const proj = liveProjects.find(p => String(p.id) === String(id));
        const projTitle = proj ? (proj.title || proj.name) : id;

        if (!confirm('Are you sure you want to delete "' + projTitle + '" from inventory?')) {
          return;
        }

        liveProjects = liveProjects.filter(p => String(p.id) !== String(id));
        try {
          localStorage.setItem('capetown_projects', JSON.stringify(liveProjects));
        } catch (err) {}

        renderProjectsList(liveProjects);
        updateProjectsBadge(liveProjects.length);
        showToast('Project deleted successfully!', 'success');

        try {
          await fetch(API_URL + '/api/admin/projects/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
          });
        } catch (apiErr) {
          console.warn('Backend delete failed, deleted locally:', apiErr);
        }
      }
    });
  }

  // =========================================================================
  // 6. SITE GALLERY MODULE (CRUD)
  // =========================================================================

  const defaultSiteGallery = [
    {
      id: "gal-01",
      title: "Actual Project Billboard & Entrance",
      category: "Surroundings",
      image: "assets/images/site-billboard.jpg",
      caption: "Prominent project billboard installed along the main access road."
    },
    {
      id: "gal-02",
      title: "Boundary Sign & Security Enclosure",
      category: "Site",
      image: "assets/images/boundary-sign.jpg",
      caption: "Project demarcation board identifying Capetown Heights site."
    },
    {
      id: "gal-03",
      title: "Ground Level Preparation & Excavation",
      category: "Construction",
      image: "assets/images/ground-prep.jpg",
      caption: "Ongoing earthwork and ground preparation works at site."
    },
    {
      id: "gal-04",
      title: "Site Office & Customer Experience Center",
      category: "Amenities",
      image: "assets/images/site-office-building.jpg",
      caption: "On-site facility building for site visits and engineering coordination."
    },
    {
      id: "gal-05",
      title: "Main Access Road & Approach Connectivity",
      category: "Surroundings",
      image: "assets/images/site-road-view.jpg",
      caption: "Wide paved municipal approach road connecting to Silvassa."
    },
    {
      id: "gal-06",
      title: "High-Rise Architectural Elevation",
      category: "Exterior",
      image: "assets/images/building-exterior.jpg",
      caption: "Architectural rendering showcasing the complete building elevation."
    }
  ];

  let liveGallery = [];

  function resolveGalleryImg(url) {
    if (!url) return '../assets/images/building-exterior.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('../')) return url;
    if (url.startsWith('/')) return '..' + url;
    return '../' + url;
  }

  function updateGalleryCounters(count) {
    const heading = document.getElementById('galleryHeading');
    if (heading) heading.textContent = `Verified Site Gallery & Surroundings (${count})`;
    const sidebarBadge = document.getElementById('sidebarGalleryBadge');
    if (sidebarBadge) sidebarBadge.textContent = String(count);
  }

  function renderGalleryList(items) {
    if (!galleryContainer) return;
    if (!items || items.length === 0) {
      galleryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No gallery photos currently registered.</p>
          <button type="button" class="btn-action primary" onclick="document.getElementById('openAddGalleryBtn')?.click()">+ Add First Photo</button>
        </div>
      `;
      return;
    }

    galleryContainer.innerHTML = items.map(g => {
      const idStr = escapeHtml(String(g.id || ''));
      const titleStr = escapeHtml(g.title || 'Untitled Photo');
      const catStr = escapeHtml(g.category || 'Site');
      const captionStr = escapeHtml(g.caption || g.description || '');
      const imgPath = resolveGalleryImg(g.image || g.img || '');

      return `
        <div class="gallery-admin-card" data-id="${idStr}">
          <div class="gallery-admin-img-wrap">
            <img src="${imgPath}" alt="${titleStr}" class="gallery-admin-img" loading="lazy" onerror="this.src='../assets/images/building-exterior.jpg'">
            <span class="admin-amenity-badge">${catStr}</span>
          </div>
          <div class="gallery-admin-body">
            <h4 class="gallery-admin-title">${titleStr}</h4>
            <p class="gallery-admin-desc">${captionStr}</p>
          </div>
          <div class="gallery-admin-footer">
            <button type="button" class="btn-amenity-action edit" data-action="edit-gallery" data-id="${idStr}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-amenity-action delete" data-action="delete-gallery" data-id="${idStr}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadGallery() {
    if (!galleryContainer) return;

    // First load from localStorage or defaults
    if (!liveGallery || liveGallery.length === 0) {
      try {
        const stored = localStorage.getItem('capetown_gallery');
        if (stored) {
          liveGallery = JSON.parse(stored);
        }
      } catch (e) {}

      if (!liveGallery || liveGallery.length === 0) {
        liveGallery = JSON.parse(JSON.stringify(defaultSiteGallery));
      }

      renderGalleryList(liveGallery);
      updateGalleryCounters(liveGallery.length);
    }

    // Attempt to fetch fresh from server
    try {
      const res = await fetch(API_URL + '/api/admin/gallery', {
        headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.gallery) && data.gallery.length > 0) {
          liveGallery = data.gallery.map(g => ({
            id: String(g.id),
            title: g.title,
            category: g.category || 'Site',
            project: g.project || 'Capetown Heights',
            image: g.image || g.img || '',
            caption: g.caption || g.description || ''
          }));
          try {
            localStorage.setItem('capetown_gallery', JSON.stringify(liveGallery));
          } catch(e) {}
          renderGalleryList(liveGallery);
          updateGalleryCounters(liveGallery.length);
        }
      }
    } catch (err) {
      console.warn('Unable to reach server for gallery, using cached data:', err);
    }
  }

  // Gallery Image Picker Handler
  async function processGalleryImageFile(file, imgInputEl, previewImgEl, statusTextEl, isAddModal) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    if (statusTextEl) {
      statusTextEl.textContent = `Reading ${file.name} (${fileSizeKb} KB)...`;
      statusTextEl.classList.remove('success');
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      if (previewImgEl) {
        previewImgEl.src = dataUrl;
        previewImgEl.style.display = 'block';
      }

      if (isAddModal && addGalleryBtnText) {
        addGalleryBtnText.textContent = 'Change Image';
      }

      if (imgInputEl) imgInputEl.value = dataUrl;

      try {
        if (statusTextEl) statusTextEl.textContent = `Saving ${file.name}...`;
        const res = await fetch(API_URL + '/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({ image: dataUrl, name: file.name })
        });
        const d = await res.json();
        if (res.ok && d.success && d.url) {
          if (imgInputEl) imgInputEl.value = d.url;
          if (statusTextEl) {
            statusTextEl.textContent = `✓ Image selected: ${file.name}`;
            statusTextEl.classList.add('success');
          }
          showToast('Image updated successfully!', 'success');
          return;
        }
      } catch (err) {
        console.warn('Backend image upload fallback to Data URL:', err);
      }

      if (statusTextEl) {
        statusTextEl.textContent = `✓ Image selected: ${file.name} (${fileSizeKb} KB)`;
        statusTextEl.classList.add('success');
      }
      showToast('Image updated!', 'success');
    };

    reader.onerror = () => {
      showToast('Failed to read image file from device.', 'error');
    };
    reader.readAsDataURL(file);
  }

  // Open Add Gallery Modal
  if (openAddGalleryBtn && addGalleryModal) {
    openAddGalleryBtn.addEventListener('click', () => {
      if (addGalleryForm) addGalleryForm.reset();
      if (addGalleryPreviewImg) {
        addGalleryPreviewImg.src = '';
        addGalleryPreviewImg.style.display = 'none';
      }
      if (addGalleryImg) addGalleryImg.value = '';
      if (addGalleryBtnText) addGalleryBtnText.textContent = 'Choose Image';
      if (addGalleryStatusText) {
        addGalleryStatusText.textContent = 'No photo selected';
        addGalleryStatusText.classList.remove('success');
      }
      addGalleryModal.style.display = 'flex';
      if (addGalleryTitle) addGalleryTitle.focus();
    });
  }

  // Close Add Gallery Modal
  if (closeAddGalleryModalBtn && addGalleryModal) {
    closeAddGalleryModalBtn.addEventListener('click', () => {
      addGalleryModal.style.display = 'none';
    });
  }
  if (cancelAddGalleryModalBtn && addGalleryModal) {
    cancelAddGalleryModalBtn.addEventListener('click', () => {
      addGalleryModal.style.display = 'none';
    });
  }

  // Add Gallery - Image Picker (Single Click)
  if (addGalleryChangeBtn && addGalleryFileInput) {
    addGalleryChangeBtn.addEventListener('click', () => addGalleryFileInput.click());
  }
  if (addGalleryPreviewImg && addGalleryFileInput) {
    addGalleryPreviewImg.addEventListener('click', () => addGalleryFileInput.click());
  }
  if (addGalleryFileInput) {
    addGalleryFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processGalleryImageFile(e.target.files[0], addGalleryImg, addGalleryPreviewImg, addGalleryStatusText, true);
      }
    });
  }

  // Save New Gallery Photo Form Submission
  if (addGalleryForm) {
    addGalleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = addGalleryTitle ? addGalleryTitle.value.trim() : '';
      const category = addGalleryCategory ? addGalleryCategory.value.trim() : 'Site';
      const img = addGalleryImg ? addGalleryImg.value.trim() : '';
      const caption = addGalleryCaption ? addGalleryCaption.value.trim() : '';

      if (!title) {
        showToast('Please enter a photo title.', 'error');
        return;
      }
      if (!img) {
        showToast('Please choose an image for the photo.', 'error');
        if (addGalleryFileInput) addGalleryFileInput.click();
        return;
      }

      const id = 'gal-' + Date.now();
      const newPhoto = { id, title, category, project: 'Capetown Heights', image: img, img, caption, description: caption };

      liveGallery.unshift(newPhoto);

      try {
        localStorage.setItem('capetown_gallery', JSON.stringify(liveGallery));
      } catch (err) {}

      renderGalleryList(liveGallery);
      updateGalleryCounters(liveGallery.length);
      addGalleryModal.style.display = 'none';
      showToast('Gallery photo added successfully!', 'success');

      // Persist to Backend API
      try {
        await fetch(API_URL + '/api/admin/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify(newPhoto)
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, saved locally:', apiErr);
      }
    });
  }

  // Close Edit Gallery Modal
  if (closeEditGalleryModalBtn && editGalleryModal) {
    closeEditGalleryModalBtn.addEventListener('click', () => {
      editGalleryModal.style.display = 'none';
    });
  }
  if (cancelEditGalleryModalBtn && editGalleryModal) {
    cancelEditGalleryModalBtn.addEventListener('click', () => {
      editGalleryModal.style.display = 'none';
    });
  }

  // Edit Gallery - Image Picker (Single Click)
  if (editGalleryChangeBtn && editGalleryFileInput) {
    editGalleryChangeBtn.addEventListener('click', () => editGalleryFileInput.click());
  }
  if (editGalleryPreviewImg && editGalleryFileInput) {
    editGalleryPreviewImg.addEventListener('click', () => editGalleryFileInput.click());
  }
  if (editGalleryFileInput) {
    editGalleryFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processGalleryImageFile(e.target.files[0], editGalleryImg, editGalleryPreviewImg, editGalleryStatusText, false);
      }
    });
  }

  // Update Gallery Photo Form Submission
  if (editGalleryForm) {
    editGalleryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editGalleryId ? editGalleryId.value : '';
      const title = editGalleryTitle ? editGalleryTitle.value.trim() : '';
      const category = editGalleryCategory ? editGalleryCategory.value.trim() : 'Site';
      const img = editGalleryImg ? editGalleryImg.value.trim() : '';
      const caption = editGalleryCaption ? editGalleryCaption.value.trim() : '';

      if (!id || !title || !img) {
        showToast('Please fill in title and select an image.', 'error');
        return;
      }

      const idx = liveGallery.findIndex(g => String(g.id) === String(id));
      if (idx !== -1) {
        liveGallery[idx] = {
          ...liveGallery[idx],
          title,
          category,
          image: img,
          img,
          caption,
          description: caption
        };
      }

      try {
        localStorage.setItem('capetown_gallery', JSON.stringify(liveGallery));
      } catch (err) {}

      renderGalleryList(liveGallery);
      updateGalleryCounters(liveGallery.length);
      editGalleryModal.style.display = 'none';
      showToast('Gallery photo updated successfully!', 'success');

      // Persist to Backend API
      try {
        await fetch(API_URL + '/api/admin/gallery/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({ title, category, project: 'Capetown Heights', image: img, caption })
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, updated locally:', apiErr);
      }
    });
  }

  // Event Delegation on Gallery Container for Edit & Delete buttons
  if (galleryContainer) {
    galleryContainer.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit-gallery"]');
      const deleteBtn = e.target.closest('[data-action="delete-gallery"]');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const item = liveGallery.find(g => String(g.id) === String(id));
        if (!item) return;

        if (editGalleryId) editGalleryId.value = item.id;
        if (editGalleryTitle) editGalleryTitle.value = item.title;
        if (editGalleryCategory) editGalleryCategory.value = item.category || 'Site';
        if (editGalleryImg) editGalleryImg.value = item.image || item.img || '';
        if (editGalleryCaption) editGalleryCaption.value = item.caption || item.description || '';

        if (editGalleryPreviewImg) {
          editGalleryPreviewImg.src = resolveGalleryImg(item.image || item.img || '');
          editGalleryPreviewImg.style.display = 'block';
        }
        if (editGalleryStatusText) {
          editGalleryStatusText.textContent = 'Current photo loaded';
          editGalleryStatusText.classList.remove('success');
        }

        if (editGalleryModal) editGalleryModal.style.display = 'flex';
        return;
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        const item = liveGallery.find(g => String(g.id) === String(id));
        const itemTitle = item ? item.title : id;

        if (!confirm('Are you sure you want to delete "' + itemTitle + '" from the gallery?')) {
          return;
        }

        liveGallery = liveGallery.filter(g => String(g.id) !== String(id));
        try {
          localStorage.setItem('capetown_gallery', JSON.stringify(liveGallery));
        } catch (err) {}

        renderGalleryList(liveGallery);
        updateGalleryCounters(liveGallery.length);
        showToast('Photo deleted successfully!', 'success');

        // Persist to Backend API
        try {
          await fetch(API_URL + '/api/admin/gallery/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
          });
        } catch (apiErr) {
          console.warn('Backend sync failed, deleted locally:', apiErr);
        }
      }
    });
  }

  // =========================================================================
  // 7. AMENITIES MANAGEMENT MODULE (CRUD)
  // =========================================================================

  function resolveAmenityImg(url) {
    if (!url) return '../assets/images/building-exterior.jpg';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    if (url.startsWith('../')) return url;
    if (url.startsWith('/')) return '..' + url;
    return '../' + url;
  }

  function updateAmenitiesCounters(count) {
    const heading = document.getElementById('amenitiesHeading');
    if (heading) heading.textContent = `All ${count} Verified Project Amenities`;
    const sub = document.getElementById('amenitiesSubtitle');
    if (sub) sub.textContent = `Complete catalog of ${count} lifestyle, wellness, and infrastructure facilities provided by Nirali infra.`;
    const sidebarBadge = document.getElementById('sidebarAmenitiesBadge');
    if (sidebarBadge) sidebarBadge.textContent = String(count);
    const sidebarLabel = document.getElementById('sidebarAmenitiesLabel');
    if (sidebarLabel) sidebarLabel.textContent = `${count} Verified Amenities`;
  }

  function renderAmenitiesList(items) {
    if (!adminAmenitiesGrid) return;
    if (!items || items.length === 0) {
      adminAmenitiesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No project amenities currently registered.</p>
          <button type="button" class="btn-action primary" onclick="document.getElementById('openAddAmenityBtn')?.click()">+ Add First Amenity</button>
        </div>
      `;
      return;
    }

    adminAmenitiesGrid.innerHTML = items.map(am => {
      const numStr = escapeHtml(String(am.num || ''));
      const titleStr = escapeHtml(am.title || 'Untitled Amenity');
      const descStr = escapeHtml(am.desc || am.description || '');
      const rawImg = am.img || '';
      const imgPath = resolveAmenityImg(rawImg);

      return `
        <div class="admin-amenity-card" data-num="${numStr}">
          <div class="admin-amenity-img-wrap">
            <img src="${imgPath}" alt="${titleStr}" class="admin-amenity-img" loading="lazy" onerror="this.src='../assets/images/building-exterior.jpg'">
            <span class="admin-amenity-badge">#${numStr}</span>
          </div>
          <div class="admin-amenity-content">
            <h4 class="admin-amenity-title">${titleStr}</h4>
            <p class="admin-amenity-desc">${descStr}</p>
          </div>
          <div class="admin-amenity-footer">
            <button type="button" class="btn-amenity-action edit" data-action="edit" data-num="${numStr}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="btn-amenity-action delete" data-action="delete" data-num="${numStr}">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadAmenities() {
    if (!adminAmenitiesGrid) return;

    // First load from localStorage or defaults
    if (!liveAmenities || liveAmenities.length === 0) {
      try {
        const stored = localStorage.getItem('capetown_amenities');
        if (stored) {
          liveAmenities = JSON.parse(stored);
        }
      } catch (e) {}

      if (!liveAmenities || liveAmenities.length === 0) {
        liveAmenities = JSON.parse(JSON.stringify(projectAmenities));
      }

      renderAmenitiesList(liveAmenities);
      updateAmenitiesCounters(liveAmenities.length);
    }

    // Attempt to fetch fresh from server
    try {
      const res = await fetch(API_URL + '/api/admin/amenities', {
        headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.amenities) && data.amenities.length > 0) {
          liveAmenities = data.amenities.map(a => ({
            id: a.id,
            num: String(a.num),
            title: a.title,
            img: a.img,
            desc: a.description || a.desc || ''
          }));
          try {
            localStorage.setItem('capetown_amenities', JSON.stringify(liveAmenities));
          } catch(e) {}
          renderAmenitiesList(liveAmenities);
          updateAmenitiesCounters(liveAmenities.length);
        }
      }
    } catch (err) {
      console.warn('Unable to reach server for amenities, using cached data:', err);
    }
  }

  // Process and Upload Image File
  async function processAmenityImageFile(file, imgInputEl, previewImgEl, statusTextEl, isAddModal) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP).', 'error');
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    if (statusTextEl) {
      statusTextEl.textContent = `Reading ${file.name} (${fileSizeKb} KB)...`;
      statusTextEl.classList.remove('success');
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      if (previewImgEl) {
        previewImgEl.src = dataUrl;
        previewImgEl.style.display = 'block';
      }

      if (isAddModal && addAmenityBtnText) {
        addAmenityBtnText.textContent = 'Change Image';
      }

      // Pre-set dataUrl into input so form is valid even if backend is offline
      if (imgInputEl) imgInputEl.value = dataUrl;

      // Upload to backend API to store in uploads directory
      try {
        if (statusTextEl) statusTextEl.textContent = `Saving ${file.name}...`;
        const res = await fetch(API_URL + '/api/admin/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({ image: dataUrl, name: file.name })
        });
        const d = await res.json();
        if (res.ok && d.success && d.url) {
          if (imgInputEl) imgInputEl.value = d.url;
          if (statusTextEl) {
            statusTextEl.textContent = `✓ Image selected: ${file.name}`;
            statusTextEl.classList.add('success');
          }
          showToast('Image updated successfully!', 'success');
          return;
        }
      } catch (err) {
        console.warn('Backend image upload fallback to Data URL:', err);
      }

      if (statusTextEl) {
        statusTextEl.textContent = `✓ Image selected: ${file.name} (${fileSizeKb} KB)`;
        statusTextEl.classList.add('success');
      }
      showToast('Image updated!', 'success');
    };

    reader.onerror = () => {
      showToast('Failed to read image file from device.', 'error');
    };
    reader.readAsDataURL(file);
  }

  // Open Add Amenity Modal
  if (openAddAmenityBtn && addAmenityModal) {
    openAddAmenityBtn.addEventListener('click', () => {
      if (addAmenityForm) addAmenityForm.reset();
      if (addAmenityPreviewImg) {
        addAmenityPreviewImg.src = '';
        addAmenityPreviewImg.style.display = 'none';
      }
      if (addAmenityImg) {
        addAmenityImg.value = '';
      }
      if (addAmenityBtnText) {
        addAmenityBtnText.textContent = 'Choose Image';
      }
      if (addAmenityStatusText) {
        addAmenityStatusText.textContent = 'No photo selected';
        addAmenityStatusText.classList.remove('success');
      }

      let nextNum = 1;
      if (liveAmenities && liveAmenities.length > 0) {
        const numericValues = liveAmenities
          .map(a => parseInt(a.num, 10))
          .filter(n => !isNaN(n));
        if (numericValues.length > 0) {
          nextNum = Math.max(...numericValues) + 1;
        } else {
          nextNum = liveAmenities.length + 1;
        }
      }
      if (addAmenityNum) {
        addAmenityNum.value = nextNum < 10 ? '0' + nextNum : String(nextNum);
      }
      addAmenityModal.style.display = 'flex';
      if (addAmenityTitle) addAmenityTitle.focus();
    });
  }

  // Close Add Amenity Modal
  if (closeAddAmenityModalBtn && addAmenityModal) {
    closeAddAmenityModalBtn.addEventListener('click', () => {
      addAmenityModal.style.display = 'none';
    });
  }
  if (cancelAddAmenityModalBtn && addAmenityModal) {
    cancelAddAmenityModalBtn.addEventListener('click', () => {
      addAmenityModal.style.display = 'none';
    });
  }

  // Add Amenity - Image Picker (Single Click)
  if (addAmenityChangeBtn && addAmenityFileInput) {
    addAmenityChangeBtn.addEventListener('click', () => addAmenityFileInput.click());
  }
  if (addAmenityPreviewImg && addAmenityFileInput) {
    addAmenityPreviewImg.addEventListener('click', () => addAmenityFileInput.click());
  }
  if (addAmenityFileInput) {
    addAmenityFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processAmenityImageFile(e.target.files[0], addAmenityImg, addAmenityPreviewImg, addAmenityStatusText, true);
      }
    });
  }

  // Save New Amenity Form Submission
  if (addAmenityForm) {
    addAmenityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const num = addAmenityNum ? addAmenityNum.value.trim() : '';
      const title = addAmenityTitle ? addAmenityTitle.value.trim() : '';
      const img = addAmenityImg ? addAmenityImg.value.trim() : '';
      const desc = addAmenityDesc ? addAmenityDesc.value.trim() : '';

      if (!num || !title) {
        showToast('Please fill in Amenity Number and Title.', 'error');
        return;
      }
      if (!img) {
        showToast('Please choose an image for the amenity.', 'error');
        if (addAmenityFileInput) addAmenityFileInput.click();
        return;
      }

      // Check duplicate number
      if (liveAmenities.some(a => String(a.num).toLowerCase() === num.toLowerCase())) {
        showToast('An amenity with number #' + num + ' already exists. Please choose another number.', 'error');
        return;
      }

      const newAmenity = { num, title, img, desc, description: desc };

      // Local update
      liveAmenities.push(newAmenity);
      liveAmenities.sort((a, b) => {
        const na = parseInt(a.num, 10);
        const nb = parseInt(b.num, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a.num).localeCompare(String(b.num));
      });

      try {
        localStorage.setItem('capetown_amenities', JSON.stringify(liveAmenities));
      } catch (err) {}

      renderAmenitiesList(liveAmenities);
      updateAmenitiesCounters(liveAmenities.length);
      addAmenityModal.style.display = 'none';
      showToast('Amenity #' + num + ' added successfully!', 'success');

      // Persist to Backend API
      try {
        await fetch(API_URL + '/api/admin/amenities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify(newAmenity)
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, saved locally:', apiErr);
      }
    });
  }

  // Close Edit Amenity Modal
  if (closeEditAmenityModalBtn && editAmenityModal) {
    closeEditAmenityModalBtn.addEventListener('click', () => {
      editAmenityModal.style.display = 'none';
    });
  }
  if (cancelEditAmenityModalBtn && editAmenityModal) {
    cancelEditAmenityModalBtn.addEventListener('click', () => {
      editAmenityModal.style.display = 'none';
    });
  }

  // Edit Amenity - Image Picker (Single Click)
  if (editAmenityChangeBtn && editAmenityFileInput) {
    editAmenityChangeBtn.addEventListener('click', () => editAmenityFileInput.click());
  }
  if (editAmenityPreviewImg && editAmenityFileInput) {
    editAmenityPreviewImg.addEventListener('click', () => editAmenityFileInput.click());
  }
  if (editAmenityFileInput) {
    editAmenityFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processAmenityImageFile(e.target.files[0], editAmenityImg, editAmenityPreviewImg, editAmenityStatusText, false);
      }
    });
  }

  // Update Amenity Form Submission
  if (editAmenityForm) {
    editAmenityForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const origNum = editAmenityOriginalNum ? editAmenityOriginalNum.value : '';
      const num = editAmenityNum ? editAmenityNum.value.trim() : '';
      const title = editAmenityTitle ? editAmenityTitle.value.trim() : '';
      const img = editAmenityImg ? editAmenityImg.value.trim() : '';
      const desc = editAmenityDesc ? editAmenityDesc.value.trim() : '';

      if (!num || !title || !img) {
        showToast('Please fill in Amenity Number, Title, and select an Image.', 'error');
        return;
      }

      // Check duplicate number if changed
      if (num.toLowerCase() !== origNum.toLowerCase() &&
          liveAmenities.some(a => String(a.num).toLowerCase() === num.toLowerCase())) {
        showToast('Another amenity with number #' + num + ' already exists.', 'error');
        return;
      }

      const idx = liveAmenities.findIndex(a => String(a.num).toLowerCase() === origNum.toLowerCase());
      if (idx !== -1) {
        liveAmenities[idx] = { ...liveAmenities[idx], num, title, img, desc, description: desc };
      }

      liveAmenities.sort((a, b) => {
        const na = parseInt(a.num, 10);
        const nb = parseInt(b.num, 10);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a.num).localeCompare(String(b.num));
      });

      try {
        localStorage.setItem('capetown_amenities', JSON.stringify(liveAmenities));
      } catch (err) {}

      renderAmenitiesList(liveAmenities);
      updateAmenitiesCounters(liveAmenities.length);
      editAmenityModal.style.display = 'none';
      showToast('Amenity #' + num + ' updated successfully!', 'success');

      // Persist to Backend API
      try {
        await fetch(API_URL + '/api/admin/amenities/' + encodeURIComponent(origNum), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({ num, title, img, desc, description: desc })
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, updated locally:', apiErr);
      }
    });
  }

  // Event Delegation on Amenities Grid for Edit & Delete buttons
  if (adminAmenitiesGrid) {
    adminAmenitiesGrid.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const deleteBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        const num = editBtn.getAttribute('data-num');
        const item = liveAmenities.find(a => String(a.num) === String(num));
        if (!item) return;

        if (editAmenityOriginalNum) editAmenityOriginalNum.value = item.num;
        if (editAmenityNum) editAmenityNum.value = item.num;
        if (editAmenityTitle) editAmenityTitle.value = item.title;
        if (editAmenityImg) editAmenityImg.value = item.img;
        if (editAmenityDesc) editAmenityDesc.value = item.desc || item.description || '';

        if (editAmenityPreviewImg) {
          editAmenityPreviewImg.src = resolveAmenityImg(item.img);
          editAmenityPreviewImg.style.display = 'block';
        }
        if (editAmenityStatusText) {
          editAmenityStatusText.textContent = 'Current photo loaded';
          editAmenityStatusText.classList.remove('success');
        }

        if (editAmenityModal) editAmenityModal.style.display = 'flex';
        return;
      }

      if (deleteBtn) {
        const num = deleteBtn.getAttribute('data-num');
        const item = liveAmenities.find(a => String(a.num) === String(num));
        const itemTitle = item ? item.title : '#' + num;

        if (!confirm('Are you sure you want to delete Amenity #' + num + ' (' + itemTitle + ')? This will remove it from the catalog.')) {
          return;
        }

        // Optimistic delete
        liveAmenities = liveAmenities.filter(a => String(a.num) !== String(num));
        try {
          localStorage.setItem('capetown_amenities', JSON.stringify(liveAmenities));
        } catch (err) {}

        renderAmenitiesList(liveAmenities);
        updateAmenitiesCounters(liveAmenities.length);
        showToast('Amenity #' + num + ' deleted successfully!', 'success');

        // Persist to Backend API
        try {
          await fetch(API_URL + '/api/admin/amenities/' + encodeURIComponent(num), {
            method: 'DELETE',
            headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
          });
        } catch (apiErr) {
          console.warn('Backend delete failed, updated locally:', apiErr);
        }
      }
    });
  }

  // =========================================================================
  // 8. CONTACT & PROJECT OFFICES MODULE (CRUD)
  // =========================================================================

  const defaultProjectContacts = [
    {
      id: "contact-01",
      title: "Capetown Heights Project Office",
      is_primary: 1,
      phone: "9081464545",
      phone_subtitle: "Available for direct inquiries & site visit coordination",
      email: "info@niraliinfra.com",
      address: "Ultan Faliya Road, Police Line Road, Silvassa, Dadra and Nagar Haveli and Daman and Diu – 396230.",
      plus_code: "7XGW+V9, Silvassa",
      developer_name: "Nirali infra",
      developer_desc: "Real Estate Builders & Construction Company",
      google_rating: "4.6 / 5 Rating (19 Customer Reviews)",
      directions_url: "https://maps.app.goo.gl/NA9WehdJfaJx9NKr7?g_st=ac",
      reviews_url: "https://g.page/r/CZH57F8d6TNIEAE/review",
      instagram_url: "https://www.instagram.com/niraliinfrasilvassa?utm_source=ig_web_button_share_sheet&lqvp=ZDNlZDc0MzIxNw%3D%3D",
      facebook_url: "https://www.facebook.com/niraliinfrasilvassa"
    }
  ];

  let liveContacts = [];

  function updateContactCounters(count) {
    const heading = document.getElementById('contactHeading');
    if (heading) heading.textContent = `Project Offices & Contact Details (${count})`;
    const sidebarBadge = document.getElementById('sidebarContactBadge');
    if (sidebarBadge) sidebarBadge.textContent = String(count);
  }

  function renderContactsList(items) {
    if (!contactsContainer) return;
    if (!items || items.length === 0) {
      contactsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 8px; border: 1px dashed var(--border-color);">
          <p style="color: var(--text-muted); margin-bottom: 1rem;">No contact offices registered.</p>
          <button type="button" class="btn-action primary" onclick="document.getElementById('openAddContactBtn')?.click()">+ Add First Contact Office</button>
        </div>
      `;
      return;
    }

    contactsContainer.innerHTML = items.map(c => {
      const idStr = escapeHtml(String(c.id || ''));
      const titleStr = escapeHtml(c.title || 'Project Office');
      const isPrimary = c.is_primary == 1 || c.is_primary === true;
      const phoneStr = escapeHtml(c.phone || '');
      const phoneSub = escapeHtml(c.phone_subtitle || 'Available for direct inquiries & site visit coordination');
      const emailStr = escapeHtml(c.email || '');
      const addressStr = escapeHtml(c.address || '');
      const plusCode = escapeHtml(c.plus_code || '');
      const devName = escapeHtml(c.developer_name || 'Nirali infra');
      const devDesc = escapeHtml(c.developer_desc || 'Real Estate Builders & Construction Company');
      const ratingStr = escapeHtml(c.google_rating || '4.6 / 5 Rating');

      return `
        <div class="contact-admin-card" data-id="${idStr}">
          <div class="contact-admin-header">
            <div>
              <h3 class="contact-admin-title">${titleStr}</h3>
              ${isPrimary ? '<span class="status-badge new" style="margin-top: 4px; display: inline-block;">★ Primary Contact Office</span>' : ''}
            </div>
            <div style="font-size: 0.82rem; color: var(--accent-gold); font-weight: 700;">
              ID: ${idStr}
            </div>
          </div>

          <div class="contact-admin-body">
            <!-- Phone -->
            <div class="contact-admin-item">
              <div class="contact-admin-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
              </div>
              <div>
                <div class="contact-admin-label">Primary Contact Number</div>
                <div class="contact-admin-val"><a href="tel:${phoneStr}">${phoneStr}</a></div>
                <div class="contact-admin-sub">${phoneSub}</div>
              </div>
            </div>

            <!-- Address -->
            <div class="contact-admin-item">
              <div class="contact-admin-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div>
                <div class="contact-admin-label">Project Site Address</div>
                <div class="contact-admin-val">${addressStr}</div>
                ${plusCode ? `<div class="contact-admin-sub">Google Plus Code: <strong>${plusCode}</strong></div>` : ''}
              </div>
            </div>

            <!-- Developer -->
            <div class="contact-admin-item">
              <div class="contact-admin-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              </div>
              <div>
                <div class="contact-admin-label">Developer</div>
                <div class="contact-admin-val">${devName}</div>
                <div class="contact-admin-sub">${devDesc}</div>
              </div>
            </div>

            <!-- Rating -->
            <div class="contact-admin-item">
              <div class="contact-admin-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </div>
              <div>
                <div class="contact-admin-label">Google Business Profile</div>
                <div class="contact-admin-val">${ratingStr}</div>
              </div>
            </div>

            <!-- Links -->
            <div class="contact-admin-links">
              ${c.directions_url ? `<a href="${escapeHtml(c.directions_url)}" target="_blank" class="contact-admin-link-pill">📍 Get Directions</a>` : ''}
              ${c.reviews_url ? `<a href="${escapeHtml(c.reviews_url)}" target="_blank" class="contact-admin-link-pill">★ Google Reviews</a>` : ''}
              ${c.instagram_url ? `<a href="${escapeHtml(c.instagram_url)}" target="_blank" class="contact-admin-link-pill">📸 Instagram</a>` : ''}
              ${c.facebook_url ? `<a href="${escapeHtml(c.facebook_url)}" target="_blank" class="contact-admin-link-pill">👍 Facebook</a>` : ''}
              ${emailStr ? `<a href="mailto:${emailStr}" class="contact-admin-link-pill">✉ ${emailStr}</a>` : ''}
            </div>
          </div>

          <div class="contact-admin-footer">
            <span style="font-size: 0.78rem; color: var(--text-muted);">
              ${isPrimary ? 'Active on Contact Page' : 'Secondary Office'}
            </span>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn-amenity-action edit" data-action="edit-contact" data-id="${idStr}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                <span>Edit</span>
              </button>
              <button type="button" class="btn-amenity-action delete" data-action="delete-contact" data-id="${idStr}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function loadContacts() {
    if (!contactsContainer) return;

    if (!liveContacts || liveContacts.length === 0) {
      try {
        const stored = localStorage.getItem('capetown_contacts');
        if (stored) {
          liveContacts = JSON.parse(stored);
        }
      } catch (e) {}

      if (!liveContacts || liveContacts.length === 0) {
        liveContacts = JSON.parse(JSON.stringify(defaultProjectContacts));
      }

      renderContactsList(liveContacts);
      updateContactCounters(liveContacts.length);
    }

    try {
      const res = await fetch(API_URL + '/api/admin/contacts', {
        headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.contacts) && data.contacts.length > 0) {
          liveContacts = data.contacts;
          try {
            localStorage.setItem('capetown_contacts', JSON.stringify(liveContacts));
          } catch(e) {}
          renderContactsList(liveContacts);
          updateContactCounters(liveContacts.length);
        }
      }
    } catch (err) {
      console.warn('Unable to reach server for contacts, using cached data:', err);
    }
  }

  // Open Add Contact Modal
  if (openAddContactBtn && addContactModal) {
    openAddContactBtn.addEventListener('click', () => {
      if (addContactForm) addContactForm.reset();
      if (addContactIsPrimary) addContactIsPrimary.checked = liveContacts.length === 0;
      addContactModal.style.display = 'flex';
      if (addContactTitle) addContactTitle.focus();
    });
  }

  // Close Add Contact Modal
  if (closeAddContactModalBtn && addContactModal) {
    closeAddContactModalBtn.addEventListener('click', () => {
      addContactModal.style.display = 'none';
    });
  }
  if (cancelAddContactModalBtn && addContactModal) {
    cancelAddContactModalBtn.addEventListener('click', () => {
      addContactModal.style.display = 'none';
    });
  }

  // Add Contact Form Submit
  if (addContactForm) {
    addContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = addContactTitle ? addContactTitle.value.trim() : '';
      const is_primary = addContactIsPrimary ? (addContactIsPrimary.checked ? 1 : 0) : 0;
      const phone = addContactPhone ? addContactPhone.value.trim() : '';
      const phone_subtitle = addContactPhoneSub ? addContactPhoneSub.value.trim() : '';
      const email = addContactEmail ? addContactEmail.value.trim() : '';
      const address = addContactAddress ? addContactAddress.value.trim() : '';
      const plus_code = addContactPlusCode ? addContactPlusCode.value.trim() : '';
      const google_rating = addContactGoogleRating ? addContactGoogleRating.value.trim() : '';
      const developer_name = addContactDevName ? addContactDevName.value.trim() : '';
      const developer_desc = addContactDevDesc ? addContactDevDesc.value.trim() : '';
      const directions_url = addContactDirectionsUrl ? addContactDirectionsUrl.value.trim() : '';
      const reviews_url = addContactReviewsUrl ? addContactReviewsUrl.value.trim() : '';
      const instagram_url = addContactInstagramUrl ? addContactInstagramUrl.value.trim() : '';
      const facebook_url = addContactFacebookUrl ? addContactFacebookUrl.value.trim() : '';

      if (!title || !phone || !address) {
        showToast('Please fill in Title, Contact Number, and Address.', 'error');
        return;
      }

      const id = 'contact-' + Date.now();
      const newContact = {
        id, title, is_primary, phone, phone_subtitle, email, address, plus_code,
        google_rating, developer_name, developer_desc,
        directions_url, reviews_url, instagram_url, facebook_url
      };

      if (is_primary === 1) {
        liveContacts.forEach(c => c.is_primary = 0);
      }

      liveContacts.unshift(newContact);

      try {
        localStorage.setItem('capetown_contacts', JSON.stringify(liveContacts));
      } catch (err) {}

      renderContactsList(liveContacts);
      updateContactCounters(liveContacts.length);
      addContactModal.style.display = 'none';
      showToast('Contact office added successfully!', 'success');

      try {
        await fetch(API_URL + '/api/admin/contacts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify(newContact)
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, saved locally:', apiErr);
      }
    });
  }

  // Close Edit Contact Modal
  if (closeEditContactModalBtn && editContactModal) {
    closeEditContactModalBtn.addEventListener('click', () => {
      editContactModal.style.display = 'none';
    });
  }
  if (cancelEditContactModalBtn && editContactModal) {
    cancelEditContactModalBtn.addEventListener('click', () => {
      editContactModal.style.display = 'none';
    });
  }

  // Edit Contact Form Submit
  if (editContactForm) {
    editContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editContactId ? editContactId.value : '';
      const title = editContactTitle ? editContactTitle.value.trim() : '';
      const is_primary = editContactIsPrimary ? (editContactIsPrimary.checked ? 1 : 0) : 0;
      const phone = editContactPhone ? editContactPhone.value.trim() : '';
      const phone_subtitle = editContactPhoneSub ? editContactPhoneSub.value.trim() : '';
      const email = editContactEmail ? editContactEmail.value.trim() : '';
      const address = editContactAddress ? editContactAddress.value.trim() : '';
      const plus_code = editContactPlusCode ? editContactPlusCode.value.trim() : '';
      const google_rating = editContactGoogleRating ? editContactGoogleRating.value.trim() : '';
      const developer_name = editContactDevName ? editContactDevName.value.trim() : '';
      const developer_desc = editContactDevDesc ? editContactDevDesc.value.trim() : '';
      const directions_url = editContactDirectionsUrl ? editContactDirectionsUrl.value.trim() : '';
      const reviews_url = editContactReviewsUrl ? editContactReviewsUrl.value.trim() : '';
      const instagram_url = editContactInstagramUrl ? editContactInstagramUrl.value.trim() : '';
      const facebook_url = editContactFacebookUrl ? editContactFacebookUrl.value.trim() : '';

      if (!id || !title || !phone || !address) {
        showToast('Please fill in Title, Contact Number, and Address.', 'error');
        return;
      }

      if (is_primary === 1) {
        liveContacts.forEach(c => {
          if (String(c.id) !== String(id)) c.is_primary = 0;
        });
      }

      const idx = liveContacts.findIndex(c => String(c.id) === String(id));
      if (idx !== -1) {
        liveContacts[idx] = {
          ...liveContacts[idx],
          title, is_primary, phone, phone_subtitle, email, address, plus_code,
          google_rating, developer_name, developer_desc,
          directions_url, reviews_url, instagram_url, facebook_url
        };
      }

      try {
        localStorage.setItem('capetown_contacts', JSON.stringify(liveContacts));
      } catch (err) {}

      renderContactsList(liveContacts);
      updateContactCounters(liveContacts.length);
      editContactModal.style.display = 'none';
      showToast('Contact office updated successfully!', 'success');

      try {
        await fetch(API_URL + '/api/admin/contacts/' + encodeURIComponent(id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': 'Bearer ' + authToken } : {})
          },
          body: JSON.stringify({
            title, is_primary, phone, phone_subtitle, email, address, plus_code,
            google_rating, developer_name, developer_desc,
            directions_url, reviews_url, instagram_url, facebook_url
          })
        });
      } catch (apiErr) {
        console.warn('Backend sync failed, updated locally:', apiErr);
      }
    });
  }

  // Event Delegation on Contacts Container for Edit & Delete buttons
  if (contactsContainer) {
    contactsContainer.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit-contact"]');
      const deleteBtn = e.target.closest('[data-action="delete-contact"]');

      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const item = liveContacts.find(c => String(c.id) === String(id));
        if (!item) return;

        if (editContactId) editContactId.value = item.id;
        if (editContactTitle) editContactTitle.value = item.title || '';
        if (editContactIsPrimary) editContactIsPrimary.checked = item.is_primary == 1 || item.is_primary === true;
        if (editContactPhone) editContactPhone.value = item.phone || '';
        if (editContactPhoneSub) editContactPhoneSub.value = item.phone_subtitle || '';
        if (editContactEmail) editContactEmail.value = item.email || '';
        if (editContactAddress) editContactAddress.value = item.address || '';
        if (editContactPlusCode) editContactPlusCode.value = item.plus_code || '';
        if (editContactGoogleRating) editContactGoogleRating.value = item.google_rating || '';
        if (editContactDevName) editContactDevName.value = item.developer_name || '';
        if (editContactDevDesc) editContactDevDesc.value = item.developer_desc || '';
        if (editContactDirectionsUrl) editContactDirectionsUrl.value = item.directions_url || '';
        if (editContactReviewsUrl) editContactReviewsUrl.value = item.reviews_url || '';
        if (editContactInstagramUrl) editContactInstagramUrl.value = item.instagram_url || '';
        if (editContactFacebookUrl) editContactFacebookUrl.value = item.facebook_url || '';

        if (editContactModal) editContactModal.style.display = 'flex';
        return;
      }

      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        if (liveContacts.length <= 1) {
          showToast('Cannot delete the only remaining contact office.', 'error');
          return;
        }

        const item = liveContacts.find(c => String(c.id) === String(id));
        const itemTitle = item ? item.title : id;

        if (!confirm('Are you sure you want to delete "' + itemTitle + '" from contact offices?')) {
          return;
        }

        liveContacts = liveContacts.filter(c => String(c.id) !== String(id));
        try {
          localStorage.setItem('capetown_contacts', JSON.stringify(liveContacts));
        } catch (err) {}

        renderContactsList(liveContacts);
        updateContactCounters(liveContacts.length);
        showToast('Contact office deleted successfully!', 'success');

        try {
          await fetch(API_URL + '/api/admin/contacts/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: authToken ? { 'Authorization': 'Bearer ' + authToken } : {}
          });
        } catch (apiErr) {
          console.warn('Backend sync failed, deleted locally:', apiErr);
        }
      }
    });
  }

  // =========================================================================
  // 9. MYSQL DATABASE CONSOLE MODULE
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

      const leadId = `enq-${Date.now()}`;
      const newLead = {
        id: leadId,
        name,
        phone,
        email: email || '',
        projectName: projectName || 'Capetown Heights',
        interestType: interestType || 'Direct Inquiry',
        status: status || 'New',
        message: message || '',
        notes: notes || '',
        source: 'Admin Console',
        createdAt: new Date().toISOString()
      };

      try {
        const res = await fetch(API_URL + '/api/admin/enquiries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify(newLead)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.id) newLead.id = data.id;
          else if (data && data.enquiry && data.enquiry.id) newLead.id = data.enquiry.id;
        }
      } catch (err) {
        console.warn('API error saving lead:', err);
      }

      const local = getLocalEnquiries();
      local.unshift(newLead);
      localStorage.setItem('capetown_enquiries', JSON.stringify(local));

      addLeadModal.style.display = 'none';
      showToast('New lead added successfully!');
      loadDashboardStats();
      loadEnquiries();
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

  // Real-time Cross-tab Sync for New Enquiries submitted from Public Website
  window.addEventListener('storage', (e) => {
    if (e.key === 'capetown_enquiries') {
      try {
        loadDashboardStats();
        loadEnquiries();
      } catch (err) {}
    }
  });

  // Start Auth Check on load
  checkAuth();
});
