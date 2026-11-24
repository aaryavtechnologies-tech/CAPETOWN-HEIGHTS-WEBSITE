-- =========================================================================
-- CAPETOWN HEIGHTS - COMPLETE MYSQL DATABASE DUMP
-- Database: captown
-- Developer: Nirali Group
-- Compatible with MySQL 5.7+, MySQL 8.0+, MariaDB 10.4+
-- =========================================================================

CREATE DATABASE IF NOT EXISTS `captown` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `captown`;

-- -------------------------------------------------------------------------
-- Table: admins
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(100) DEFAULT 'Super Administrator',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Admin User (ID: admin OR admin@capetownheights.com | Password: admin123)
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `createdAt`) VALUES
(1, 'Capetown Admin', 'admin@capetownheights.com', 'admin123', 'Super Administrator', NOW());

-- -------------------------------------------------------------------------
-- Table: enquiries
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `enquiries`;
CREATE TABLE `enquiries` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `projectName` VARCHAR(255) DEFAULT 'Capetown Heights',
  `interestType` VARCHAR(100) DEFAULT 'Direct Website Inquiry',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('New', 'Contacted', 'Completed') DEFAULT 'New',
  `notes` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Initial Inquiries / Leads
INSERT INTO `enquiries` (`id`, `name`, `phone`, `email`, `projectName`, `interestType`, `message`, `status`, `notes`, `createdAt`) VALUES
('enq-101', 'Rajesh V. Sharma', '+91 98250 12345', 'rajesh.sharma@gmail.com', 'Capetown Heights', 'Site Visit Booking', 'Interested in 3 BHK duplex facing landscape garden. Need site visit on Saturday.', 'New', 'Follow-up call scheduled for Friday afternoon.', '2026-11-20 10:30:00'),
('enq-102', 'Pooja Patel', '+91 98981 67890', 'pooja.patel@yahoo.com', 'Capetown Heights', 'Price & Floor Plan Inquiry', 'Please share latest pricing sheet and carpet area specifications.', 'Contacted', 'Shared brochure and pricing details via WhatsApp. Positive response.', '2026-11-21 14:15:00'),
('enq-103', 'Amitabh Desai', '+91 97234 56781', 'amitabh.desai@corporatednh.in', 'Capetown Heights', 'Brochure Request', 'Required detailed specifications for clubhouse and allotted parking facilities.', 'Completed', 'Site visit completed on Sunday. Booking token in process.', '2026-11-22 17:00:00'),
('enq-104', 'Karan Varma', '+91 98765 43210', 'karan.varma@outlook.com', 'Capetown Heights', 'Direct Website Form', 'Interested in 3 BHK duplex penthouse site visit and RERA details.', 'New', NULL, NOW());

-- -------------------------------------------------------------------------
-- Table: projects
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Apartments',
  `status` ENUM('Ongoing', 'Upcoming', 'Completed') DEFAULT 'Ongoing',
  `featured` TINYINT(1) DEFAULT 1,
  `price` VARCHAR(100) NOT NULL,
  `priceNumeric` BIGINT DEFAULT 0,
  `configurations` VARCHAR(100) DEFAULT '2 BHK & 3 BHK Duplex',
  `carpetArea` VARCHAR(100) DEFAULT '950 - 1850 sq.ft.',
  `location` VARCHAR(255) NOT NULL,
  `landmark` VARCHAR(255) DEFAULT NULL,
  `reraNumber` VARCHAR(100) DEFAULT 'Verified DNH RERA',
  `possession` VARCHAR(100) DEFAULT 'Dec 2027',
  `totalUnits` VARCHAR(100) DEFAULT '240 Units',
  `image` TEXT NOT NULL,
  `gallery` LONGTEXT DEFAULT NULL,
  `description` LONGTEXT DEFAULT NULL,
  `overview` LONGTEXT DEFAULT NULL,
  `amenities` LONGTEXT DEFAULT NULL,
  `specifications` LONGTEXT DEFAULT NULL,
  `floorPlans` LONGTEXT DEFAULT NULL,
  `brochureUrl` VARCHAR(255) DEFAULT '#',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `projects` (`id`, `title`, `subtitle`, `category`, `status`, `featured`, `price`, `priceNumeric`, `configurations`, `carpetArea`, `location`, `landmark`, `reraNumber`, `possession`, `totalUnits`, `image`, `description`) VALUES
('proj-capetown-heights', 'Capetown Heights', 'Modern High-Rise Living by Nirali Group', 'Luxury Apartments', 'Ongoing', 1, 'Price on Request', 4500000, '2 BHK, 3 BHK & Duplex Penthouse', '950 - 1850 sq.ft.', 'Silvassa, Dadra & Nagar Haveli', 'Near Silvassa Bypass Road', 'DNH-RERA-2026-089', 'December 2027', '240 Units', 'assets/images/building-exterior.jpg', 'Capetown Heights offers thoughtfully planned 2 & 3 BHK modern apartments and duplex residences in Silvassa with 40 lifestyle and wellness amenities.');

-- -------------------------------------------------------------------------
-- Table: gallery
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `gallery`;
CREATE TABLE `gallery` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Exterior',
  `project` VARCHAR(255) DEFAULT 'Capetown Heights',
  `image` TEXT NOT NULL,
  `caption` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `gallery` (`id`, `title`, `category`, `project`, `image`, `caption`) VALUES
('gal-01', 'Actual Project Billboard & Entrance', 'Surroundings', 'Capetown Heights', 'assets/images/site-billboard.jpg', 'Prominent project billboard installed along the main access road.'),
('gal-02', 'Boundary Sign & Security Enclosure', 'Site', 'Capetown Heights', 'assets/images/boundary-sign.jpg', 'Project demarcation board identifying Capetown Heights site.'),
('gal-03', 'Ground Level Preparation & Excavation', 'Construction', 'Capetown Heights', 'assets/images/ground-prep.jpg', 'Ongoing earthwork and ground preparation works at site.'),
('gal-04', 'Site Office & Customer Experience Center', 'Amenities', 'Capetown Heights', 'assets/images/site-office-building.jpg', 'On-site facility building for site visits and engineering coordination.'),
('gal-05', 'Main Access Road & Approach Connectivity', 'Surroundings', 'Capetown Heights', 'assets/images/site-road-view.jpg', 'Wide paved municipal approach road connecting to Silvassa.'),
('gal-06', 'High-Rise Architectural Elevation', 'Exterior', 'Capetown Heights', 'assets/images/building-exterior.jpg', 'Architectural rendering showcasing the complete building elevation.');

-- -------------------------------------------------------------------------
-- Table: users (Public accounts / visitors)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(50) DEFAULT 'Customer',
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Table: otp_verifications
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `otp_verifications`;
CREATE TABLE `otp_verifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phone` VARCHAR(50) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `isVerified` TINYINT(1) DEFAULT 0,
  `expiresAt` DATETIME NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Table: user_saved_properties
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_saved_properties`;
CREATE TABLE `user_saved_properties` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `propertyId` VARCHAR(100) NOT NULL,
  `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------------
-- Table: website_content
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS `website_content`;
CREATE TABLE `website_content` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `section` VARCHAR(100) NOT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `website_content` (`id`, `section`, `content`) VALUES
('contact-info', 'contact', '{\"phone\":\"9081464545\",\"email\":\"info@capetownheights.com\",\"address\":\"Silvassa, Dadra & Nagar Haveli and Daman & Diu\",\"developer\":\"Nirali Group\"}'),
('meta-highlights', 'hero', '{\"amenitiesCount\":40,\"totalFloors\":\"G+14\",\"possession\":\"2027\",\"rating\":\"4.6\"}');
