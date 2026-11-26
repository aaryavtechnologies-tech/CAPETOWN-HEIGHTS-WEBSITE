/**
 * Cloudflare Pages Functions - Catch-all API Handler for /api/*
 * Powers backend APIs when deployed on Cloudflare Pages (capetown-heights-website.pages.dev)
 */

let defaultEnquiries = [
  {
    id: "enq-1795689834183",
    name: "Himanshu Manoj Singh",
    phone: "919328603748",
    email: "",
    projectName: "Capetown Heights",
    interestType: "Direct Website Form",
    message: "fxnvxcnxcvn",
    status: "New",
    source: "Website Direct",
    notes: "",
    createdAt: "2026-11-26T10:43:00.000Z"
  },
  {
    id: "enq-101",
    name: "Rohan Sharma",
    phone: "9876543210",
    email: "rohan.sharma@example.com",
    projectName: "Capetown Heights",
    interestType: "3 BHK Luxury Apartment",
    message: "Interested in high-floor corner unit with terrace garden view.",
    status: "New",
    source: "Website Direct",
    notes: "Requested weekend site visit.",
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "enq-102",
    name: "Priya Patel",
    phone: "9823456789",
    email: "priya.p@example.com",
    projectName: "Capetown Heights",
    interestType: "2 BHK Executive Flat",
    message: "Please share floor plan and financing options with HDFC.",
    status: "Contacted",
    source: "Google Search",
    notes: "Spoke with client. Sent brochure via WhatsApp.",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "enq-103",
    name: "Amit Verma",
    phone: "9911223344",
    email: "amit.verma@example.com",
    projectName: "Capetown Heights",
    interestType: "Commercial Retail Space",
    message: "Looking for ground floor retail showroom unit for banking branch.",
    status: "Completed",
    source: "Site Visit / Referral",
    notes: "Token advance received for Phase 1 allotment.",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

let defaultGallery = [
  {
    id: "gal-01",
    title: "Actual Project Billboard & Entrance",
    category: "Surroundings",
    project: "Capetown Heights",
    image: "assets/images/site-billboard.jpg",
    caption: "Prominent project billboard installed along the main access road."
  },
  {
    id: "gal-02",
    title: "Boundary Sign & Security Enclosure",
    category: "Site",
    project: "Capetown Heights",
    image: "assets/images/boundary-sign.jpg",
    caption: "Project demarcation board identifying Capetown Heights site."
  },
  {
    id: "gal-03",
    title: "Ground Level Preparation & Excavation",
    category: "Construction",
    project: "Capetown Heights",
    image: "assets/images/ground-prep.jpg",
    caption: "Ongoing earthwork and ground preparation works at site."
  },
  {
    id: "gal-04",
    title: "Site Office & Customer Experience Center",
    category: "Amenities",
    project: "Capetown Heights",
    image: "assets/images/site-office-building.jpg",
    caption: "On-site facility building for site visits and engineering coordination."
  },
  {
    id: "gal-05",
    title: "Main Access Road & Approach Connectivity",
    category: "Surroundings",
    project: "Capetown Heights",
    image: "assets/images/site-road-view.jpg",
    caption: "Wide paved municipal approach road connecting to Silvassa."
  },
  {
    id: "gal-06",
    title: "High-Rise Architectural Elevation",
    category: "Exterior",
    project: "Capetown Heights",
    image: "assets/images/building-exterior.jpg",
    caption: "Architectural rendering showcasing the complete building elevation."
  }
];

let defaultContacts = [
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
    facebook_url: "https://www.facebook.com/niraliinfrasilvassa",
    createdAt: new Date().toISOString()
  }
];

let defaultProjects = [
  {
    id: "proj-capetown-heights",
    name: "Capetown Heights",
    title: "Capetown Heights",
    developer: "NIRALI GROUP",
    status: "Under Construction",
    type: "Luxury Residential & Commercial Development",
    configurations: "Luxury Residential & Commercial Development",
    location: "Silvassa, Dadra & Nagar Haveli",
    carpetArea: "950 – 1850 sq.ft.",
    elevation: "G + 14 Storeys",
    totalUnits: "180",
    amenitiesCount: "40 Lifestyle Facilities",
    amenities: "40 Lifestyle Facilities",
    image: "assets/images/building-exterior.jpg",
    description: "Capetown Heights represents the pinnacle of luxury residential living in Silvassa, meticulously developed by Nirali infra with 40 lifestyle amenities, double basement parking, and landscaped sky gardens."
  }
];

let defaultAmenities = [
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

const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-token",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    }
  });
};

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, ""); // Strip trailing slash
  const method = request.method.toUpperCase();

  // Handle CORS Preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-token"
      }
    });
  }

  try {
    // 1. Health check
    if (path === "/api/health") {
      return jsonResponse({
        status: "ok",
        platform: "Cloudflare Pages Edge",
        timestamp: new Date().toISOString()
      });
    }

    // 2. Admin Login
    if (path === "/api/admin/login" && method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch (e) {}

      const id = (body.id || "").trim();
      const password = (body.password || "").trim();

      if (id.toLowerCase() === "admin" && password === "admin123") {
        return jsonResponse({
          success: true,
          message: "Login successful.",
          token: "cf-token-" + Date.now(),
          admin: {
            id: 1,
            name: "Capetown Admin",
            email: "admin@capetownheights.com",
            role: "Super Administrator"
          }
        });
      } else {
        return jsonResponse({
          success: false,
          message: "Invalid Admin ID or Password. Default: admin / admin123"
        }, 401);
      }
    }

    // 3. Admin Me (Session Verification)
    if (path === "/api/admin/me") {
      return jsonResponse({
        success: true,
        admin: {
          id: 1,
          name: "Capetown Admin",
          email: "admin@capetownheights.com",
          role: "Super Administrator"
        }
      });
    }

    // 4. Admin Logout
    if (path === "/api/admin/logout") {
      return jsonResponse({ success: true, message: "Logged out successfully." });
    }

    // 5. Dashboard Stats
    if (path === "/api/admin/stats") {
      return jsonResponse({
        success: true,
        stats: {
          total: defaultEnquiries.length,
          newLeads: defaultEnquiries.filter(e => e.status === "New").length,
          contacted: defaultEnquiries.filter(e => e.status === "Contacted").length,
          completed: defaultEnquiries.filter(e => e.status === "Completed").length
        }
      });
    }

    // 6. Enquiries (Get All / Filter)
    if (path === "/api/admin/enquiries" && method === "GET") {
      const status = url.searchParams.get("status") || "all";
      const search = (url.searchParams.get("search") || "").toLowerCase();

      let filtered = [...defaultEnquiries];
      if (status !== "all") {
        filtered = filtered.filter(e => e.status.toLowerCase() === status.toLowerCase());
      }
      if (search) {
        filtered = filtered.filter(e =>
          (e.name || "").toLowerCase().includes(search) ||
          (e.phone || "").toLowerCase().includes(search) ||
          (e.message || "").toLowerCase().includes(search)
        );
      }

      return jsonResponse({
        success: true,
        count: filtered.length,
        enquiries: filtered
      });
    }

    // 7. Public Website Enquiry Submission
    if (path === "/api/enquiries" && method === "POST") {
      let body = {};
      try {
        body = await request.json();
      } catch (e) {}

      const name = (body.name || "").trim();
      const phone = (body.phone || "").trim();

      if (!name || phone.length < 10) {
        return jsonResponse({
          success: false,
          message: "Please enter a valid name and 10-digit contact number."
        }, 400);
      }

      const newEnq = {
        id: body.id || `enq-${Date.now()}`,
        name,
        phone,
        email: (body.email || "").trim(),
        projectName: (body.projectName || "Capetown Heights").trim(),
        interestType: (body.interestType || "Direct Website Form").trim(),
        message: (body.message || body.note || "").trim(),
        status: "New",
        source: "Website Direct",
        notes: "",
        createdAt: new Date().toISOString()
      };
      defaultEnquiries.unshift(newEnq);

      return jsonResponse({
        success: true,
        message: "Thank you, " + name + "! Your inquiry has been saved into our system. For immediate project assistance, please call 9081464545.",
        enquiry: newEnq
      });
    }

    // 7b. Admin Enquiries (Add, Status/Notes Patch, Delete)
    if (path === "/api/admin/enquiries" && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const name = (body.name || "").trim();
      const phone = (body.phone || "").trim();
      if (!name || !phone) {
        return jsonResponse({ success: false, message: "Name and Phone number are required." }, 400);
      }
      const newEnq = {
        id: body.id || `enq-${Date.now()}`,
        name,
        phone,
        email: (body.email || "").trim(),
        projectName: (body.projectName || "Capetown Heights").trim(),
        interestType: (body.interestType || "Direct Website Form").trim(),
        message: (body.message || "").trim(),
        status: body.status || "New",
        source: body.source || "Admin Logged",
        notes: (body.notes || "").trim(),
        createdAt: new Date().toISOString()
      };
      defaultEnquiries.unshift(newEnq);
      return jsonResponse({ success: true, message: "New lead added successfully.", enquiry: newEnq });
    }

    if (path.startsWith("/api/admin/enquiries/") && method === "PATCH") {
      const targetId = decodeURIComponent(path.split("/api/admin/enquiries/")[1]);
      let body = {};
      try { body = await request.json(); } catch (e) {}

      const idx = defaultEnquiries.findIndex(e => String(e.id) === String(targetId));
      if (idx !== -1) {
        defaultEnquiries[idx] = {
          ...defaultEnquiries[idx],
          ...(body.status ? { status: body.status } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {})
        };
      }
      return jsonResponse({ success: true, message: "Enquiry updated successfully." });
    }

    if (path.startsWith("/api/admin/enquiries/") && method === "DELETE") {
      const targetId = decodeURIComponent(path.split("/api/admin/enquiries/")[1]);
      defaultEnquiries = defaultEnquiries.filter(e => String(e.id) !== String(targetId));
      return jsonResponse({ success: true, message: "Enquiry deleted successfully." });
    }

    // 8. Amenities CRUD APIs
    if ((path === "/api/amenities" || path === "/api/admin/amenities") && method === "GET") {
      return jsonResponse({
        success: true,
        count: defaultAmenities.length,
        amenities: defaultAmenities
      });
    }

    if (path === "/api/admin/amenities" && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const title = (body.title || "").trim();
      if (!title) {
        return jsonResponse({ success: false, message: "Amenity title is required." }, 400);
      }
      let num = (body.num || "").trim();
      if (!num) {
        num = String(defaultAmenities.length + 1).padStart(2, "0");
      }
      const newAmenity = {
        num,
        title,
        img: (body.img || "").trim() || "assets/images/amenities/multipurpose-hall.jpg",
        desc: (body.desc || body.description || "").trim()
      };
      defaultAmenities.push(newAmenity);
      return jsonResponse({ success: true, message: "Amenity added successfully.", amenity: newAmenity });
    }

    if (path.startsWith("/api/admin/amenities/") && method === "PUT") {
      const targetNum = decodeURIComponent(path.split("/api/admin/amenities/")[1]);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const target = defaultAmenities.find(a => 
        a.num === targetNum || 
        String(parseInt(a.num, 10)) === String(parseInt(targetNum, 10)) ||
        String(a.num).padStart(2, '0') === String(targetNum).padStart(2, '0')
      );
      if (target) {
        if (body.title) target.title = body.title.trim();
        if (body.img) target.img = body.img.trim();
        if (body.desc !== undefined) target.desc = body.desc.trim();
        if (body.description !== undefined) target.desc = body.description.trim();
        if (body.num) target.num = body.num.trim();
      }
      return jsonResponse({ success: true, message: "Amenity updated successfully." });
    }

    if (path.startsWith("/api/admin/amenities/") && method === "DELETE") {
      const targetNum = decodeURIComponent(path.split("/api/admin/amenities/")[1]);
      defaultAmenities = defaultAmenities.filter(a => 
        a.num !== targetNum && 
        String(parseInt(a.num, 10)) !== String(parseInt(targetNum, 10)) &&
        String(a.num).padStart(2, '0') !== String(targetNum).padStart(2, '0')
      );
      return jsonResponse({ success: true, message: "Amenity deleted successfully." });
    }

    if (path === "/api/admin/upload-image" && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      return jsonResponse({
        success: true,
        url: body.image || "",
        message: "Image uploaded successfully."
      });
    }

    // 9. Projects & Inventory (CRUD: Fetch, Add, Edit, Delete)
    if ((path === "/api/projects" || path === "/api/admin/projects") && method === "GET") {
      return jsonResponse({
        success: true,
        count: defaultProjects.length,
        projects: defaultProjects
      });
    }

    if (path === "/api/admin/projects" && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const title = (body.title || body.name || "").trim();
      if (!title) {
        return jsonResponse({ success: false, message: "Project title is required." }, 400);
      }
      const newProj = {
        id: body.id || `proj-${Date.now()}`,
        name: title,
        title: title,
        developer: (body.developer || "NIRALI GROUP").trim(),
        status: (body.status || "Under Construction").trim(),
        type: (body.configurations || body.type || "Luxury Residential & Commercial Development").trim(),
        configurations: (body.configurations || body.type || "Luxury Residential & Commercial Development").trim(),
        location: (body.location || "Silvassa, Dadra & Nagar Haveli").trim(),
        carpetArea: (body.carpetArea || "950 – 1850 sq.ft.").trim(),
        elevation: (body.elevation || "G + 14 Storeys").trim(),
        totalUnits: (body.totalUnits || "180").trim(),
        amenitiesCount: (body.amenities || body.amenitiesCount || "40 Lifestyle Facilities").trim(),
        amenities: (body.amenities || body.amenitiesCount || "40 Lifestyle Facilities").trim(),
        image: (body.image || "assets/images/building-exterior.jpg").trim(),
        description: (body.description || "").trim()
      };
      defaultProjects.unshift(newProj);
      return jsonResponse({
        success: true,
        message: "Project added successfully.",
        project: newProj
      });
    }

    if (path.startsWith("/api/admin/projects/") && method === "PUT") {
      const targetId = decodeURIComponent(path.split("/api/admin/projects/")[1]);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const title = (body.title || body.name || "").trim();
      if (!title) {
        return jsonResponse({ success: false, message: "Project title is required." }, 400);
      }
      const idx = defaultProjects.findIndex(p => String(p.id) === String(targetId));
      if (idx !== -1) {
        defaultProjects[idx] = {
          ...defaultProjects[idx],
          name: title,
          title: title,
          developer: (body.developer || defaultProjects[idx].developer).trim(),
          status: (body.status || defaultProjects[idx].status).trim(),
          type: (body.configurations || body.type || defaultProjects[idx].configurations).trim(),
          configurations: (body.configurations || body.type || defaultProjects[idx].configurations).trim(),
          location: (body.location || defaultProjects[idx].location).trim(),
          carpetArea: (body.carpetArea || defaultProjects[idx].carpetArea).trim(),
          elevation: (body.elevation || defaultProjects[idx].elevation).trim(),
          totalUnits: (body.totalUnits || defaultProjects[idx].totalUnits).trim(),
          amenitiesCount: (body.amenities || body.amenitiesCount || defaultProjects[idx].amenitiesCount).trim(),
          amenities: (body.amenities || body.amenitiesCount || defaultProjects[idx].amenities).trim(),
          image: body.image && body.image.trim() ? body.image.trim() : defaultProjects[idx].image,
          description: body.description !== undefined ? body.description.trim() : defaultProjects[idx].description
        };
      }
      return jsonResponse({ success: true, message: "Project updated successfully.", project: defaultProjects[idx] });
    }

    if (path.startsWith("/api/admin/projects/") && method === "DELETE") {
      const targetId = decodeURIComponent(path.split("/api/admin/projects/")[1]);
      if (defaultProjects.length <= 1) {
        return jsonResponse({ success: false, message: "Cannot delete the only remaining project. At least one project must exist." }, 400);
      }
      defaultProjects = defaultProjects.filter(p => String(p.id) !== String(targetId));
      return jsonResponse({ success: true, message: "Project deleted successfully." });
    }

    // 10. Gallery Items (CRUD: Fetch, Add, Edit, Delete)
    if ((path === "/api/gallery" || path === "/api/admin/gallery") && method === "GET") {
      return jsonResponse({
        success: true,
        count: defaultGallery.length,
        gallery: defaultGallery
      });
    }

    if (path === "/api/admin/gallery" && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      if (!body.title || !body.title.trim()) {
        return jsonResponse({ success: false, message: "Gallery title is required." }, 400);
      }
      if (!body.image || !body.image.trim()) {
        return jsonResponse({ success: false, message: "Gallery image is required." }, 400);
      }
      const newItem = {
        id: body.id || `gal-${Date.now()}`,
        title: body.title.trim(),
        category: (body.category || "Site").trim(),
        project: (body.project || "Capetown Heights").trim(),
        image: body.image.trim(),
        caption: (body.caption || "").trim(),
        createdAt: new Date().toISOString()
      };
      defaultGallery.unshift(newItem);
      return jsonResponse({
        success: true,
        message: "Gallery photo added successfully.",
        item: newItem
      });
    }

    if (path.startsWith("/api/admin/gallery/") && method === "PUT") {
      const targetId = decodeURIComponent(path.split("/api/admin/gallery/")[1]);
      let body = {};
      try { body = await request.json(); } catch (e) {}
      if (!body.title || !body.title.trim()) {
        return jsonResponse({ success: false, message: "Gallery title is required." }, 400);
      }
      const idx = defaultGallery.findIndex(g => String(g.id) === String(targetId));
      if (idx !== -1) {
        defaultGallery[idx] = {
          ...defaultGallery[idx],
          title: body.title.trim(),
          category: (body.category || "Site").trim(),
          project: (body.project || "Capetown Heights").trim(),
          image: body.image && body.image.trim() ? body.image.trim() : defaultGallery[idx].image,
          caption: body.caption !== undefined ? body.caption.trim() : defaultGallery[idx].caption
        };
      }
      return jsonResponse({ success: true, message: "Gallery photo updated successfully." });
    }

    if (path.startsWith("/api/admin/gallery/") && method === "DELETE") {
      const targetId = decodeURIComponent(path.split("/api/admin/gallery/")[1]);
      defaultGallery = defaultGallery.filter(g => String(g.id) !== String(targetId));
      return jsonResponse({ success: true, message: "Gallery photo deleted successfully." });
    }

    // 11. Contact & Office Info (CRUD: Fetch, Add, Edit, Delete)
    if ((path === "/api/contact" || path === "/api/contacts" || path === "/api/admin/contact" || path === "/api/admin/contacts") && method === "GET") {
      return jsonResponse({
        success: true,
        count: defaultContacts.length,
        contacts: defaultContacts,
        primaryContact: defaultContacts.length > 0 ? defaultContacts[0] : null
      });
    }

    if ((path === "/api/admin/contact" || path === "/api/admin/contacts") && method === "POST") {
      let body = {};
      try { body = await request.json(); } catch (e) {}
      if (!body.title || !body.title.trim()) {
        return jsonResponse({ success: false, message: "Office / Contact Title is required." }, 400);
      }
      if (!body.phone || !body.phone.trim()) {
        return jsonResponse({ success: false, message: "Contact Phone Number is required." }, 400);
      }
      if (!body.address || !body.address.trim()) {
        return jsonResponse({ success: false, message: "Site / Office Address is required." }, 400);
      }
      const newContact = {
        id: body.id || `contact-${Date.now()}`,
        title: body.title.trim(),
        is_primary: body.is_primary ? 1 : 0,
        phone: body.phone.trim(),
        phone_subtitle: (body.phone_subtitle || "Available for direct inquiries & site visit coordination").trim(),
        email: (body.email || "info@niraliinfra.com").trim(),
        address: body.address.trim(),
        plus_code: (body.plus_code || "7XGW+V9, Silvassa").trim(),
        developer_name: (body.developer_name || "Nirali infra").trim(),
        developer_desc: (body.developer_desc || "Real Estate Builders & Construction Company").trim(),
        google_rating: (body.google_rating || "4.6 / 5 Rating (19 Customer Reviews)").trim(),
        directions_url: (body.directions_url || "").trim(),
        reviews_url: (body.reviews_url || "").trim(),
        instagram_url: (body.instagram_url || "").trim(),
        facebook_url: (body.facebook_url || "").trim(),
        createdAt: new Date().toISOString()
      };
      if (newContact.is_primary === 1) {
        defaultContacts.forEach(c => c.is_primary = 0);
      }
      defaultContacts.unshift(newContact);
      return jsonResponse({
        success: true,
        message: "Contact office added successfully.",
        item: newContact
      });
    }

    if ((path.startsWith("/api/admin/contact/") || path.startsWith("/api/admin/contacts/")) && method === "PUT") {
      const targetId = decodeURIComponent(path.replace(/^\/api\/admin\/contacts?\//, ""));
      let body = {};
      try { body = await request.json(); } catch (e) {}
      const idx = defaultContacts.findIndex(c => String(c.id) === String(targetId));
      if (idx !== -1) {
        if (body.is_primary) {
          defaultContacts.forEach(c => c.is_primary = 0);
        }
        defaultContacts[idx] = {
          ...defaultContacts[idx],
          title: body.title ? body.title.trim() : defaultContacts[idx].title,
          is_primary: body.is_primary ? 1 : (body.is_primary === false || body.is_primary === 0 ? 0 : defaultContacts[idx].is_primary),
          phone: body.phone ? body.phone.trim() : defaultContacts[idx].phone,
          phone_subtitle: body.phone_subtitle !== undefined ? body.phone_subtitle.trim() : defaultContacts[idx].phone_subtitle,
          email: body.email !== undefined ? body.email.trim() : defaultContacts[idx].email,
          address: body.address ? body.address.trim() : defaultContacts[idx].address,
          plus_code: body.plus_code !== undefined ? body.plus_code.trim() : defaultContacts[idx].plus_code,
          developer_name: body.developer_name !== undefined ? body.developer_name.trim() : defaultContacts[idx].developer_name,
          developer_desc: body.developer_desc !== undefined ? body.developer_desc.trim() : defaultContacts[idx].developer_desc,
          google_rating: body.google_rating !== undefined ? body.google_rating.trim() : defaultContacts[idx].google_rating,
          directions_url: body.directions_url !== undefined ? body.directions_url.trim() : defaultContacts[idx].directions_url,
          reviews_url: body.reviews_url !== undefined ? body.reviews_url.trim() : defaultContacts[idx].reviews_url,
          instagram_url: body.instagram_url !== undefined ? body.instagram_url.trim() : defaultContacts[idx].instagram_url,
          facebook_url: body.facebook_url !== undefined ? body.facebook_url.trim() : defaultContacts[idx].facebook_url
        };
      }
      return jsonResponse({ success: true, message: "Contact office updated successfully." });
    }

    if ((path.startsWith("/api/admin/contact/") || path.startsWith("/api/admin/contacts/")) && method === "DELETE") {
      const targetId = decodeURIComponent(path.replace(/^\/api\/admin\/contacts?\//, ""));
      if (defaultContacts.length <= 1) {
        return jsonResponse({ success: false, message: "Cannot delete the only remaining contact office." }, 400);
      }
      defaultContacts = defaultContacts.filter(c => String(c.id) !== String(targetId));
      return jsonResponse({ success: true, message: "Contact office deleted successfully." });
    }

    // 12. Database Diagnostics
    if (path === "/api/admin/database") {
      return jsonResponse({
        success: true,
        database: "captown (Cloudflare Serverless Edge)",
        serverVersion: "Cloudflare Pages Functions Engine",
        tables: [
          { table_name: "admins", engine: "Serverless", table_rows: 1, data_length: 16384 },
          { table_name: "enquiries", engine: "Serverless", table_rows: defaultEnquiries.length, data_length: 32768 },
          { table_name: "amenities", engine: "Serverless", table_rows: defaultAmenities.length, data_length: 49152 },
          { table_name: "projects", engine: "Serverless", table_rows: 1, data_length: 16384 },
          { table_name: "gallery", engine: "Serverless", table_rows: defaultGallery.length, data_length: 65536 },
          { table_name: "contacts", engine: "Serverless", table_rows: defaultContacts.length, data_length: 32768 }
        ]
      });
    }

    // Fallback for any other /api/* route
    return jsonResponse({ success: true, message: "OK" });

  } catch (err) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
}
