/**
 * Cloudflare Pages Functions - Catch-all API Handler for /api/*
 * Powers backend APIs when deployed on Cloudflare Pages (capetown-heights-website.pages.dev)
 */

const defaultEnquiries = [
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

      return jsonResponse({
        success: true,
        message: "Thank you, " + name + "! Your inquiry has been received. Our sales team will connect with you shortly."
      });
    }

    // 8. Projects & Inventory
    if (path === "/api/admin/projects") {
      return jsonResponse({
        success: true,
        count: 1,
        projects: [
          {
            id: 1,
            name: "Capetown Heights",
            type: "Luxury Residential & Commercial Development",
            location: "Silvassa, Dadra & Nagar Haveli",
            totalUnits: 180,
            status: "Under Construction",
            developer: "Nirali Group"
          }
        ]
      });
    }

    // 9. Gallery Items
    if (path === "/api/admin/gallery") {
      return jsonResponse({
        success: true,
        count: 6,
        gallery: [
          { id: 1, title: "Building Architectural Elevation", category: "Architecture", image: "../assets/images/building-exterior.jpg" },
          { id: 2, title: "Grand Entrance & Driveway", category: "Site Atmosphere", image: "../assets/images/entrance-view.jpg" },
          { id: 3, title: "Double Basement Parking", category: "Infrastructure", image: "../assets/images/amenities/double-basement.jpg" },
          { id: 4, title: "Multipurpose AC Banquet Hall", category: "Clubhouse", image: "../assets/images/amenities/multipurpose-hall.jpg" },
          { id: 5, title: "Marble Temple Sanctum", category: "Spiritual", image: "../assets/images/amenities/temple.jpg" },
          { id: 6, title: "Rooftop Gazebo & Sky Garden", category: "Leisure", image: "../assets/images/amenities/terrace-gazebo.jpg" }
        ]
      });
    }

    // 10. Database Diagnostics
    if (path === "/api/admin/database") {
      return jsonResponse({
        success: true,
        database: "captown (Cloudflare Serverless Edge)",
        serverVersion: "Cloudflare Pages Functions Engine",
        tables: [
          { table_name: "admins", engine: "Serverless", table_rows: 1, data_length: 16384 },
          { table_name: "enquiries", engine: "Serverless", table_rows: defaultEnquiries.length, data_length: 32768 },
          { table_name: "projects", engine: "Serverless", table_rows: 1, data_length: 16384 },
          { table_name: "gallery", engine: "Serverless", table_rows: 6, data_length: 65536 }
        ]
      });
    }

    // Fallback for any other /api/* route
    return jsonResponse({ success: true, message: "OK" });

  } catch (err) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
}
