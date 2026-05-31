-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 08, 2026 at 04:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `smarthome`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','manager') NOT NULL DEFAULT 'manager',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'admin@smarthome.test', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

CREATE TABLE `attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attributes`
--

INSERT INTO `attributes` (`id`, `name`, `slug`, `created_at`) VALUES
(1, 'Capacity', 'capacity', '2026-03-01 18:39:55'),
(2, 'Color', 'color', '2026-03-01 18:39:55'),
(3, 'Energy Rating', 'energy-rating', '2026-03-01 18:39:55'),
(4, 'Warranty', 'warranty', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `attribute_values`
--

CREATE TABLE `attribute_values` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `value` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attribute_values`
--

INSERT INTO `attribute_values` (`id`, `attribute_id`, `value`, `slug`, `created_at`) VALUES
(1, 1, '200L', '200l', '2026-03-01 18:39:55'),
(2, 1, '300L', '300l', '2026-03-01 18:39:55'),
(3, 1, '1 Ton', '1-ton', '2026-03-01 18:39:55'),
(4, 1, '1.5 Ton', '1-5-ton', '2026-03-01 18:39:55'),
(5, 1, '6 Kg', '6-kg', '2026-03-01 18:39:55'),
(6, 1, '8 Kg', '8-kg', '2026-03-01 18:39:55'),
(7, 1, '20 L', '20-l', '2026-03-01 18:39:55'),
(8, 1, '30 L', '30-l', '2026-03-01 18:39:55'),
(9, 1, '43 Inch', '43-inch', '2026-03-01 18:39:55'),
(10, 1, '55 Inch', '55-inch', '2026-03-01 18:39:55'),
(11, 2, 'Silver', 'silver', '2026-03-01 18:39:55'),
(12, 2, 'White', 'white', '2026-03-01 18:39:55'),
(13, 2, 'Black', 'black', '2026-03-01 18:39:55'),
(14, 3, '3 Star', '3-star', '2026-03-01 18:39:55'),
(15, 3, '5 Star', '5-star', '2026-03-01 18:39:55'),
(16, 4, '1 Year', '1-year', '2026-03-01 18:39:55'),
(17, 4, '2 Years', '2-years', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`id`, `name`, `slug`, `logo`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'LG', 'lg', '/assets/images/brands/lg.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 'Samsung', 'samsung', '/assets/images/brands/samsung.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 'Whirlpool', 'whirlpool', '/assets/images/brands/whirlpool.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 'Godrej', 'godrej', '/assets/images/brands/godrej.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 'Voltas', 'voltas', '/assets/images/brands/voltas.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(6, 'Daikin', 'daikin', '/assets/images/brands/daikin.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(7, 'IFB', 'ifb', '/assets/images/brands/ifb.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(8, 'Bosch', 'bosch', '/assets/images/brands/bosch.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(9, 'Panasonic', 'panasonic', '/assets/images/brands/panasonic.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(10, 'Sony', 'sony', '/assets/images/brands/sony.svg', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `qty` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `unit_price_snapshot` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cart`
--

INSERT INTO `cart` (`id`, `user_id`, `product_id`, `product_variant_id`, `qty`, `unit_price_snapshot`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 5, 1, 34999.00, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 1, 14, 27, 2, 28999.00, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 2, 21, 41, 1, 10999.00, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(160) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Refrigerator', 'refrigerator', 'Energy efficient refrigerators for modern kitchens', '/assets/images/categories/refrigerator.jpg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 'AC', 'ac', 'Split and window air conditioners with inverter technology', '/assets/images/categories/ac.jpg', 1, 2, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 'Washing Machine', 'washing-machine', 'Top load and front load washers for every family size', '/assets/images/categories/washing-machine.jpg', 1, 3, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 'Microwave', 'microwave', 'Solo, grill and convection microwaves for quick cooking', '/assets/images/categories/microwave.jpg', 1, 4, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 'TV', 'tv', 'Smart televisions from HD to QLED with streaming support', '/assets/images/categories/tv.jpg', 1, 5, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(80) NOT NULL,
  `type` enum('fixed','percent') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_cart_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `max_discount` decimal(12,2) DEFAULT NULL,
  `usage_limit` int(10) UNSIGNED DEFAULT NULL,
  `used_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `starts_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `coupons`
--

INSERT INTO `coupons` (`id`, `code`, `type`, `value`, `min_cart_value`, `max_discount`, `usage_limit`, `used_count`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'percent', 10.00, 0.00, 5000.00, 1000, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 'FLAT1500', 'fixed', 1500.00, 25000.00, NULL, 50, 0, '2026-01-01 00:00:00', '2026-08-31 23:59:59', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 'SUMMER8', 'percent', 8.00, 15000.00, 4000.00, 200, 0, '2026-03-01 00:00:00', '2026-06-30 23:59:59', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 'MEGA500', 'fixed', 500.00, 5000.00, NULL, 500, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 'PREMIUM12', 'percent', 12.00, 50000.00, 8000.00, 30, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_no` varchar(40) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `shipping_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(12,2) NOT NULL,
  `payment_method` enum('cod','bank_transfer') NOT NULL,
  `payment_status` enum('unpaid','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  `order_status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `coupon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `coupon_code` varchar(80) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `placed_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_no`, `user_id`, `subtotal`, `discount_total`, `tax_total`, `shipping_total`, `grand_total`, `payment_method`, `payment_status`, `order_status`, `coupon_id`, `coupon_code`, `notes`, `placed_at`, `created_at`, `updated_at`) VALUES
(1, 'SHA202603010001', 1, 63998.00, 1500.00, 11249.64, 499.00, 74246.64, 'cod', 'unpaid', 'processing', 2, 'FLAT1500', 'Deliver between 10 AM - 2 PM', '2026-03-01 10:15:00', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 'SHA202602250014', 2, 109999.00, 8799.92, 18143.84, 0.00, 119342.92, 'bank_transfer', 'paid', 'shipped', 3, 'SUMMER8', NULL, '2026-02-25 15:22:00', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 'SHA202602200009', 3, 28999.00, 0.00, 5219.82, 299.00, 34517.82, 'cod', 'unpaid', 'pending', NULL, NULL, NULL, '2026-02-20 09:40:00', '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `order_addresses`
--

CREATE TABLE `order_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(120) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `email` varchar(190) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(120) NOT NULL,
  `state` varchar(120) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(120) NOT NULL DEFAULT 'India',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_addresses`
--

INSERT INTO `order_addresses` (`id`, `order_id`, `full_name`, `phone`, `email`, `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`, `created_at`) VALUES
(1, 1, 'Aarav Mehta', '9876500011', 'aarav@example.com', '221, MG Road', 'Near Metro Station', 'Bengaluru', 'Karnataka', '560001', 'India', '2026-03-01 18:39:55'),
(2, 2, 'Diya Sharma', '9876500012', 'diya@example.com', '14, Park Street', NULL, 'Kolkata', 'West Bengal', '700016', 'India', '2026-03-01 18:39:55'),
(3, 3, 'Rohan Verma', '9876500013', 'rohan@example.com', '88, Civil Lines', NULL, 'Jaipur', 'Rajasthan', '302006', 'India', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_name_snapshot` varchar(190) NOT NULL,
  `variant_text_snapshot` varchar(255) DEFAULT NULL,
  `sku_snapshot` varchar(80) DEFAULT NULL,
  `qty` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_variant_id`, `product_name_snapshot`, `variant_text_snapshot`, `sku_snapshot`, `qty`, `unit_price`, `line_total`, `created_at`) VALUES
(1, 1, 3, 5, 'ChillMaster 340L Convertible Refrigerator', 'Capacity: 200L, Color: Silver', 'SHA-0003-A', 1, 34999.00, 34999.00, '2026-03-01 18:39:55'),
(2, 1, 14, 27, 'ClimateMax 2 Ton Smart AC', 'Capacity: 1 Ton, Color: Silver', 'SHA-0014-A', 1, 28999.00, 28999.00, '2026-03-01 18:39:55'),
(3, 2, 35, 69, 'UltraFrame 50 inch UHD TV', 'Capacity: 43 Inch, Color: Silver', 'SHA-0035-A', 1, 109999.00, 109999.00, '2026-03-01 18:39:55'),
(4, 3, 22, 43, 'HeatMate 25L Grill Microwave', 'Capacity: 20 L, Color: Silver', 'SHA-0022-A', 1, 28999.00, 28999.00, '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `brand_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(190) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(12,2) NOT NULL,
  `compare_price` decimal(12,2) DEFAULT NULL,
  `rating_avg` decimal(3,2) NOT NULL DEFAULT 0.00,
  `rating_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `brand_id`, `name`, `slug`, `short_description`, `description`, `base_price`, `compare_price`, `rating_avg`, `rating_count`, `is_featured`, `is_active`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'FrostCool 210L Single Door Refrigerator', 'frostcool-210l-single-door-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 88273.00, 94593.00, 4.18, 15, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 1, 2, 'FrostCool 280L Double Door Refrigerator', 'frostcool-280l-double-door-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 83333.00, 91345.00, 4.29, 133, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 1, 3, 'ChillMaster 340L Convertible Refrigerator', 'chillmaster-340l-convertible-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 74312.00, 82258.00, 4.80, 341, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 1, 4, 'EcoFreeze 190L Inverter Refrigerator', 'ecofreeze-190l-inverter-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 30902.00, 36166.00, 3.66, 104, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 1, 5, 'GlacierPro 500L Side by Side Refrigerator', 'glacierpro-500l-side-by-side-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 81866.00, 92264.00, 4.45, 239, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(6, 1, 6, 'SmartFresh 260L Bottom Freezer Refrigerator', 'smartfresh-260l-bottom-freezer-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 41895.00, 43504.00, 3.74, 75, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(7, 1, 7, 'NanoCool 230L Direct Cool Refrigerator', 'nanocool-230l-direct-cool-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 38599.00, 49631.00, 3.84, 419, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(8, 1, 8, 'ArcticWave 450L French Door Refrigerator', 'arcticwave-450l-french-door-refrigerator', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 25512.00, 26518.00, 3.79, 13, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(9, 2, 9, 'Breeza 1 Ton Split AC', 'breeza-1-ton-split-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 57580.00, 60368.00, 4.30, 241, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(10, 2, 10, 'Breeza 1.5 Ton Inverter Split AC', 'breeza-1-5-ton-inverter-split-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 40677.00, 47439.00, 4.39, 249, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(11, 2, 1, 'PolarX 2 Ton Inverter AC', 'polarx-2-ton-inverter-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 64117.00, 70647.00, 4.69, 25, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(12, 2, 2, 'CoolNest 1 Ton Window AC', 'coolnest-1-ton-window-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 66388.00, 71046.00, 4.47, 187, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(13, 2, 3, 'AirSense 1.5 Ton 5 Star AC', 'airsense-1-5-ton-5-star-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 41088.00, 49292.00, 4.13, 29, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(14, 2, 4, 'ClimateMax 2 Ton Smart AC', 'climatemax-2-ton-smart-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 44159.00, 48644.00, 3.75, 269, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(15, 2, 5, 'SilentChill 1.2 Ton Split AC', 'silentchill-1-2-ton-split-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 51418.00, 55534.00, 4.66, 308, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(16, 2, 6, 'TurboCool 1.8 Ton Inverter AC', 'turbocool-1-8-ton-inverter-ac', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 56101.00, 62952.00, 3.90, 235, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(17, 3, 7, 'WashPro 6.5kg Top Load Washing Machine', 'washpro-6-5kg-top-load-washing-machine', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 42351.00, 53380.00, 4.03, 405, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(18, 3, 8, 'WashPro 8kg Front Load Washing Machine', 'washpro-8kg-front-load-washing-machine', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 61756.00, 67997.00, 3.64, 50, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(19, 3, 9, 'HydroSpin 7kg Fully Automatic Washer', 'hydrospin-7kg-fully-automatic-washer', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 29220.00, 31009.00, 4.87, 309, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(20, 3, 10, 'PureWash 9kg Front Load Washer Dryer', 'purewash-9kg-front-load-washer-dryer', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 27591.00, 29288.00, 4.31, 366, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(21, 3, 1, 'EcoRinse 6kg Semi Automatic Machine', 'ecorinse-6kg-semi-automatic-machine', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 29195.00, 38420.00, 4.62, 180, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(22, 3, 2, 'SpinMaster 7.5kg Top Load Machine', 'spinmaster-7-5kg-top-load-machine', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 47908.00, 49920.00, 4.58, 74, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(23, 3, 3, 'CleanWave 8.5kg Smart Washer', 'cleanwave-8-5kg-smart-washer', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 18456.00, 29430.00, 3.85, 387, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(24, 3, 4, 'AquaDrum 10kg Inverter Front Load', 'aquadrum-10kg-inverter-front-load', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 54189.00, 64881.00, 3.77, 28, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(25, 4, 5, 'HeatMate 20L Solo Microwave', 'heatmate-20l-solo-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 13234.00, 17416.00, 4.32, 299, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(26, 4, 6, 'HeatMate 25L Grill Microwave', 'heatmate-25l-grill-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 7000.00, 15742.00, 4.37, 310, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(27, 4, 7, 'SmartChef 28L Convection Microwave', 'smartchef-28l-convection-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 21403.00, 25784.00, 4.65, 85, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(28, 4, 8, 'QuickWarm 23L Solo Microwave', 'quickwarm-23l-solo-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 14735.00, 19977.00, 4.14, 137, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(29, 4, 9, 'CrispBake 30L Convection Oven', 'crispbake-30l-convection-oven', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 23963.00, 35383.00, 4.23, 298, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(30, 4, 10, 'RoastPro 32L Grill Microwave', 'roastpro-32l-grill-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 24146.00, 34089.00, 4.85, 171, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(31, 4, 1, 'MiniChef 18L Compact Microwave', 'minichef-18l-compact-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 10663.00, 13558.00, 4.79, 395, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(32, 4, 2, 'TurboHeat 27L Convection Microwave', 'turboheat-27l-convection-microwave', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 13623.00, 15805.00, 4.11, 157, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(33, 5, 3, 'VisionX 43 inch 4K Smart TV', 'visionx-43-inch-4k-smart-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 170071.00, 181300.00, 4.20, 389, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(34, 5, 4, 'VisionX 55 inch QLED Smart TV', 'visionx-55-inch-qled-smart-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 98958.00, 109179.00, 4.73, 230, 1, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(35, 5, 5, 'CineView 65 inch 4K Android TV', 'cineview-65-inch-4k-android-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 41184.00, 42754.00, 4.63, 124, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(36, 5, 6, 'PixelTone 32 inch HD Smart TV', 'pixeltone-32-inch-hd-smart-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 62091.00, 69290.00, 4.67, 279, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(37, 5, 7, 'UltraFrame 50 inch UHD TV', 'ultraframe-50-inch-uhd-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 95508.00, 106123.00, 3.84, 321, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(38, 5, 8, 'StreamLite 40 inch Full HD TV', 'streamlite-40-inch-full-hd-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 80499.00, 86190.00, 4.00, 196, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(39, 5, 9, 'NeoScreen 75 inch QLED TV', 'neoscreen-75-inch-qled-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 69241.00, 71985.00, 4.31, 349, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(40, 5, 10, 'CrystalView 58 inch 4K Smart TV', 'crystalview-58-inch-4k-smart-tv', 'Premium appliance with energy-efficient performance and smart controls.', 'Designed for Indian homes with durable components, quiet operation, and long-term reliability.', 144600.00, 152734.00, 4.18, 221, 0, 1, NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `alt_text` varchar(190) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `alt_text`, `is_primary`, `sort_order`, `created_at`) VALUES
(1, 1, '/assets/images/placeholder-product.svg', 'FrostCool 210L Single Door Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(2, 1, '/assets/images/placeholder-product.svg', 'FrostCool 210L Single Door Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(3, 2, '/assets/images/placeholder-product.svg', 'FrostCool 280L Double Door Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(4, 2, '/assets/images/placeholder-product.svg', 'FrostCool 280L Double Door Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(5, 3, '/assets/images/placeholder-product.svg', 'ChillMaster 340L Convertible Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(6, 3, '/assets/images/placeholder-product.svg', 'ChillMaster 340L Convertible Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(7, 4, '/assets/images/placeholder-product.svg', 'EcoFreeze 190L Inverter Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(8, 4, '/assets/images/placeholder-product.svg', 'EcoFreeze 190L Inverter Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(9, 5, '/assets/images/placeholder-product.svg', 'GlacierPro 500L Side by Side Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(10, 5, '/assets/images/placeholder-product.svg', 'GlacierPro 500L Side by Side Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(11, 6, '/assets/images/placeholder-product.svg', 'SmartFresh 260L Bottom Freezer Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(12, 6, '/assets/images/placeholder-product.svg', 'SmartFresh 260L Bottom Freezer Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(13, 7, '/assets/images/placeholder-product.svg', 'NanoCool 230L Direct Cool Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(14, 7, '/assets/images/placeholder-product.svg', 'NanoCool 230L Direct Cool Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(15, 8, '/assets/images/placeholder-product.svg', 'ArcticWave 450L French Door Refrigerator', 1, 1, '2026-03-01 18:39:55'),
(16, 8, '/assets/images/placeholder-product.svg', 'ArcticWave 450L French Door Refrigerator side view', 0, 2, '2026-03-01 18:39:55'),
(17, 9, '/assets/images/placeholder-product.svg', 'Breeza 1 Ton Split AC', 1, 1, '2026-03-01 18:39:55'),
(18, 9, '/assets/images/placeholder-product.svg', 'Breeza 1 Ton Split AC side view', 0, 2, '2026-03-01 18:39:55'),
(19, 10, '/assets/images/placeholder-product.svg', 'Breeza 1.5 Ton Inverter Split AC', 1, 1, '2026-03-01 18:39:55'),
(20, 10, '/assets/images/placeholder-product.svg', 'Breeza 1.5 Ton Inverter Split AC side view', 0, 2, '2026-03-01 18:39:55'),
(21, 11, '/assets/images/placeholder-product.svg', 'PolarX 2 Ton Inverter AC', 1, 1, '2026-03-01 18:39:55'),
(22, 11, '/assets/images/placeholder-product.svg', 'PolarX 2 Ton Inverter AC side view', 0, 2, '2026-03-01 18:39:55'),
(23, 12, '/assets/images/placeholder-product.svg', 'CoolNest 1 Ton Window AC', 1, 1, '2026-03-01 18:39:55'),
(24, 12, '/assets/images/placeholder-product.svg', 'CoolNest 1 Ton Window AC side view', 0, 2, '2026-03-01 18:39:55'),
(25, 13, '/assets/images/placeholder-product.svg', 'AirSense 1.5 Ton 5 Star AC', 1, 1, '2026-03-01 18:39:55'),
(26, 13, '/assets/images/placeholder-product.svg', 'AirSense 1.5 Ton 5 Star AC side view', 0, 2, '2026-03-01 18:39:55'),
(27, 14, '/assets/images/placeholder-product.svg', 'ClimateMax 2 Ton Smart AC', 1, 1, '2026-03-01 18:39:55'),
(28, 14, '/assets/images/placeholder-product.svg', 'ClimateMax 2 Ton Smart AC side view', 0, 2, '2026-03-01 18:39:55'),
(29, 15, '/assets/images/placeholder-product.svg', 'SilentChill 1.2 Ton Split AC', 1, 1, '2026-03-01 18:39:55'),
(30, 15, '/assets/images/placeholder-product.svg', 'SilentChill 1.2 Ton Split AC side view', 0, 2, '2026-03-01 18:39:55'),
(31, 16, '/assets/images/placeholder-product.svg', 'TurboCool 1.8 Ton Inverter AC', 1, 1, '2026-03-01 18:39:55'),
(32, 16, '/assets/images/placeholder-product.svg', 'TurboCool 1.8 Ton Inverter AC side view', 0, 2, '2026-03-01 18:39:55'),
(33, 17, '/assets/images/placeholder-product.svg', 'WashPro 6.5kg Top Load Washing Machine', 1, 1, '2026-03-01 18:39:55'),
(34, 17, '/assets/images/placeholder-product.svg', 'WashPro 6.5kg Top Load Washing Machine side view', 0, 2, '2026-03-01 18:39:55'),
(35, 18, '/assets/images/placeholder-product.svg', 'WashPro 8kg Front Load Washing Machine', 1, 1, '2026-03-01 18:39:55'),
(36, 18, '/assets/images/placeholder-product.svg', 'WashPro 8kg Front Load Washing Machine side view', 0, 2, '2026-03-01 18:39:55'),
(37, 19, '/assets/images/placeholder-product.svg', 'HydroSpin 7kg Fully Automatic Washer', 1, 1, '2026-03-01 18:39:55'),
(38, 19, '/assets/images/placeholder-product.svg', 'HydroSpin 7kg Fully Automatic Washer side view', 0, 2, '2026-03-01 18:39:55'),
(39, 20, '/assets/images/placeholder-product.svg', 'PureWash 9kg Front Load Washer Dryer', 1, 1, '2026-03-01 18:39:55'),
(40, 20, '/assets/images/placeholder-product.svg', 'PureWash 9kg Front Load Washer Dryer side view', 0, 2, '2026-03-01 18:39:55'),
(41, 21, '/assets/images/placeholder-product.svg', 'EcoRinse 6kg Semi Automatic Machine', 1, 1, '2026-03-01 18:39:55'),
(42, 21, '/assets/images/placeholder-product.svg', 'EcoRinse 6kg Semi Automatic Machine side view', 0, 2, '2026-03-01 18:39:55'),
(43, 22, '/assets/images/placeholder-product.svg', 'SpinMaster 7.5kg Top Load Machine', 1, 1, '2026-03-01 18:39:55'),
(44, 22, '/assets/images/placeholder-product.svg', 'SpinMaster 7.5kg Top Load Machine side view', 0, 2, '2026-03-01 18:39:55'),
(45, 23, '/assets/images/placeholder-product.svg', 'CleanWave 8.5kg Smart Washer', 1, 1, '2026-03-01 18:39:55'),
(46, 23, '/assets/images/placeholder-product.svg', 'CleanWave 8.5kg Smart Washer side view', 0, 2, '2026-03-01 18:39:55'),
(47, 24, '/assets/images/placeholder-product.svg', 'AquaDrum 10kg Inverter Front Load', 1, 1, '2026-03-01 18:39:55'),
(48, 24, '/assets/images/placeholder-product.svg', 'AquaDrum 10kg Inverter Front Load side view', 0, 2, '2026-03-01 18:39:55'),
(49, 25, '/assets/images/placeholder-product.svg', 'HeatMate 20L Solo Microwave', 1, 1, '2026-03-01 18:39:55'),
(50, 25, '/assets/images/placeholder-product.svg', 'HeatMate 20L Solo Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(51, 26, '/assets/images/placeholder-product.svg', 'HeatMate 25L Grill Microwave', 1, 1, '2026-03-01 18:39:55'),
(52, 26, '/assets/images/placeholder-product.svg', 'HeatMate 25L Grill Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(53, 27, '/assets/images/placeholder-product.svg', 'SmartChef 28L Convection Microwave', 1, 1, '2026-03-01 18:39:55'),
(54, 27, '/assets/images/placeholder-product.svg', 'SmartChef 28L Convection Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(55, 28, '/assets/images/placeholder-product.svg', 'QuickWarm 23L Solo Microwave', 1, 1, '2026-03-01 18:39:55'),
(56, 28, '/assets/images/placeholder-product.svg', 'QuickWarm 23L Solo Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(57, 29, '/assets/images/placeholder-product.svg', 'CrispBake 30L Convection Oven', 1, 1, '2026-03-01 18:39:55'),
(58, 29, '/assets/images/placeholder-product.svg', 'CrispBake 30L Convection Oven side view', 0, 2, '2026-03-01 18:39:55'),
(59, 30, '/assets/images/placeholder-product.svg', 'RoastPro 32L Grill Microwave', 1, 1, '2026-03-01 18:39:55'),
(60, 30, '/assets/images/placeholder-product.svg', 'RoastPro 32L Grill Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(61, 31, '/assets/images/placeholder-product.svg', 'MiniChef 18L Compact Microwave', 1, 1, '2026-03-01 18:39:55'),
(62, 31, '/assets/images/placeholder-product.svg', 'MiniChef 18L Compact Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(63, 32, '/assets/images/placeholder-product.svg', 'TurboHeat 27L Convection Microwave', 1, 1, '2026-03-01 18:39:55'),
(64, 32, '/assets/images/placeholder-product.svg', 'TurboHeat 27L Convection Microwave side view', 0, 2, '2026-03-01 18:39:55'),
(65, 33, '/assets/images/placeholder-product.svg', 'VisionX 43 inch 4K Smart TV', 1, 1, '2026-03-01 18:39:55'),
(66, 33, '/assets/images/placeholder-product.svg', 'VisionX 43 inch 4K Smart TV side view', 0, 2, '2026-03-01 18:39:55'),
(67, 34, '/assets/images/placeholder-product.svg', 'VisionX 55 inch QLED Smart TV', 1, 1, '2026-03-01 18:39:55'),
(68, 34, '/assets/images/placeholder-product.svg', 'VisionX 55 inch QLED Smart TV side view', 0, 2, '2026-03-01 18:39:55'),
(69, 35, '/assets/images/placeholder-product.svg', 'CineView 65 inch 4K Android TV', 1, 1, '2026-03-01 18:39:55'),
(70, 35, '/assets/images/placeholder-product.svg', 'CineView 65 inch 4K Android TV side view', 0, 2, '2026-03-01 18:39:55'),
(71, 36, '/assets/images/placeholder-product.svg', 'PixelTone 32 inch HD Smart TV', 1, 1, '2026-03-01 18:39:55'),
(72, 36, '/assets/images/placeholder-product.svg', 'PixelTone 32 inch HD Smart TV side view', 0, 2, '2026-03-01 18:39:55'),
(73, 37, '/assets/images/placeholder-product.svg', 'UltraFrame 50 inch UHD TV', 1, 1, '2026-03-01 18:39:55'),
(74, 37, '/assets/images/placeholder-product.svg', 'UltraFrame 50 inch UHD TV side view', 0, 2, '2026-03-01 18:39:55'),
(75, 38, '/assets/images/placeholder-product.svg', 'StreamLite 40 inch Full HD TV', 1, 1, '2026-03-01 18:39:55'),
(76, 38, '/assets/images/placeholder-product.svg', 'StreamLite 40 inch Full HD TV side view', 0, 2, '2026-03-01 18:39:55'),
(77, 39, '/assets/images/placeholder-product.svg', 'NeoScreen 75 inch QLED TV', 1, 1, '2026-03-01 18:39:55'),
(78, 39, '/assets/images/placeholder-product.svg', 'NeoScreen 75 inch QLED TV side view', 0, 2, '2026-03-01 18:39:55'),
(79, 40, '/assets/images/placeholder-product.svg', 'CrystalView 58 inch 4K Smart TV', 1, 1, '2026-03-01 18:39:55'),
(80, 40, '/assets/images/placeholder-product.svg', 'CrystalView 58 inch 4K Smart TV side view', 0, 2, '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_specifications`
--

CREATE TABLE `product_specifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `spec_key` varchar(120) NOT NULL,
  `spec_value` varchar(255) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_specifications`
--

INSERT INTO `product_specifications` (`id`, `product_id`, `spec_key`, `spec_value`, `sort_order`, `created_at`) VALUES
(1, 1, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(2, 1, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(3, 1, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(4, 2, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(5, 2, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(6, 2, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(7, 3, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(8, 3, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(9, 3, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(10, 4, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(11, 4, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(12, 4, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(13, 5, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(14, 5, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(15, 5, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(16, 6, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(17, 6, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(18, 6, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(19, 7, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(20, 7, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(21, 7, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(22, 8, 'Compressor', 'Inverter Compressor', 1, '2026-03-01 18:39:55'),
(23, 8, 'Energy Rating', '5 Star', 2, '2026-03-01 18:39:55'),
(24, 8, 'Warranty', '10 Years Compressor Warranty', 3, '2026-03-01 18:39:55'),
(25, 9, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(26, 9, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(27, 9, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(28, 10, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(29, 10, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(30, 10, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(31, 11, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(32, 11, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(33, 11, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(34, 12, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(35, 12, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(36, 12, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(37, 13, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(38, 13, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(39, 13, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(40, 14, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(41, 14, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(42, 14, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(43, 15, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(44, 15, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(45, 15, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(46, 16, 'Cooling Type', 'Inverter', 1, '2026-03-01 18:39:55'),
(47, 16, 'Condenser', 'Copper', 2, '2026-03-01 18:39:55'),
(48, 16, 'Warranty', '1 Year Product + 10 Year Compressor', 3, '2026-03-01 18:39:55'),
(49, 17, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(50, 17, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(51, 17, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(52, 18, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(53, 18, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(54, 18, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(55, 19, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(56, 19, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(57, 19, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(58, 20, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(59, 20, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(60, 20, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(61, 21, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(62, 21, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(63, 21, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(64, 22, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(65, 22, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(66, 22, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(67, 23, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(68, 23, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(69, 23, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(70, 24, 'Motor', 'Inverter Motor', 1, '2026-03-01 18:39:55'),
(71, 24, 'Wash Programs', '12 Programs', 2, '2026-03-01 18:39:55'),
(72, 24, 'Warranty', '2 Years Product + 10 Years Motor', 3, '2026-03-01 18:39:55'),
(73, 25, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(74, 25, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(75, 25, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(76, 26, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(77, 26, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(78, 26, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(79, 27, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(80, 27, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(81, 27, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(82, 28, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(83, 28, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(84, 28, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(85, 29, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(86, 29, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(87, 29, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(88, 30, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(89, 30, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(90, 30, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(91, 31, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(92, 31, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(93, 31, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(94, 32, 'Control', 'Touch Panel', 1, '2026-03-01 18:39:55'),
(95, 32, 'Power Output', '900W', 2, '2026-03-01 18:39:55'),
(96, 32, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(97, 33, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(98, 33, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(99, 33, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(100, 34, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(101, 34, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(102, 34, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(103, 35, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(104, 35, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(105, 35, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(106, 36, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(107, 36, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(108, 36, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(109, 37, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(110, 37, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(111, 37, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(112, 38, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(113, 38, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(114, 38, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(115, 39, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(116, 39, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(117, 39, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55'),
(118, 40, 'Display', '4K UHD Panel', 1, '2026-03-01 18:39:55'),
(119, 40, 'OS', 'Smart TV OS', 2, '2026-03-01 18:39:55'),
(120, 40, 'Warranty', '1 Year Comprehensive', 3, '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `sku` varchar(80) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `compare_price` decimal(12,2) DEFAULT NULL,
  `stock_qty` int(11) NOT NULL DEFAULT 0,
  `image_path` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `sku`, `price`, `compare_price`, `stock_qty`, `image_path`, `is_default`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'SHA-0001-A', 88273.00, 94593.00, 45, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 1, 'SHA-0001-B', 95334.84, 102160.44, 19, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 2, 'SHA-0002-A', 83333.00, 91345.00, 15, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 2, 'SHA-0002-B', 89999.64, 98652.60, 18, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 3, 'SHA-0003-A', 74312.00, 82258.00, 46, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(6, 3, 'SHA-0003-B', 80256.96, 88838.64, 21, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(7, 4, 'SHA-0004-A', 30902.00, 36166.00, 41, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(8, 4, 'SHA-0004-B', 33374.16, 39059.28, 36, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(9, 5, 'SHA-0005-A', 81866.00, 92264.00, 7, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(10, 5, 'SHA-0005-B', 88415.28, 99645.12, 37, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(11, 6, 'SHA-0006-A', 41895.00, 43504.00, 29, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(12, 6, 'SHA-0006-B', 45246.60, 46984.32, 28, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(13, 7, 'SHA-0007-A', 38599.00, 49631.00, 4, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(14, 7, 'SHA-0007-B', 41686.92, 53601.48, 28, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(15, 8, 'SHA-0008-A', 25512.00, 26518.00, 9, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(16, 8, 'SHA-0008-B', 27552.96, 28639.44, 25, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(17, 9, 'SHA-0009-A', 57580.00, 60368.00, 20, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(18, 9, 'SHA-0009-B', 62186.40, 65197.44, 12, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(19, 10, 'SHA-0010-A', 40677.00, 47439.00, 24, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(20, 10, 'SHA-0010-B', 43931.16, 51234.12, 18, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(21, 11, 'SHA-0011-A', 64117.00, 70647.00, 46, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(22, 11, 'SHA-0011-B', 69246.36, 76298.76, 26, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(23, 12, 'SHA-0012-A', 66388.00, 71046.00, 48, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(24, 12, 'SHA-0012-B', 71699.04, 76729.68, 21, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(25, 13, 'SHA-0013-A', 41088.00, 49292.00, 32, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(26, 13, 'SHA-0013-B', 44375.04, 53235.36, 3, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(27, 14, 'SHA-0014-A', 44159.00, 48644.00, 31, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(28, 14, 'SHA-0014-B', 47691.72, 52535.52, 15, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(29, 15, 'SHA-0015-A', 51418.00, 55534.00, 17, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(30, 15, 'SHA-0015-B', 55531.44, 59976.72, 4, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(31, 16, 'SHA-0016-A', 56101.00, 62952.00, 38, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(32, 16, 'SHA-0016-B', 60589.08, 67988.16, 21, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(33, 17, 'SHA-0017-A', 42351.00, 53380.00, 31, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(34, 17, 'SHA-0017-B', 45739.08, 57650.40, 13, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(35, 18, 'SHA-0018-A', 61756.00, 67997.00, 21, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(36, 18, 'SHA-0018-B', 66696.48, 73436.76, 34, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(37, 19, 'SHA-0019-A', 29220.00, 31009.00, 18, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(38, 19, 'SHA-0019-B', 31557.60, 33489.72, 18, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(39, 20, 'SHA-0020-A', 27591.00, 29288.00, 37, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(40, 20, 'SHA-0020-B', 29798.28, 31631.04, 39, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(41, 21, 'SHA-0021-A', 29195.00, 38420.00, 7, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(42, 21, 'SHA-0021-B', 31530.60, 41493.60, 13, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(43, 22, 'SHA-0022-A', 47908.00, 49920.00, 35, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(44, 22, 'SHA-0022-B', 51740.64, 53913.60, 19, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(45, 23, 'SHA-0023-A', 18456.00, 29430.00, 44, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(46, 23, 'SHA-0023-B', 19932.48, 31784.40, 25, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(47, 24, 'SHA-0024-A', 54189.00, 64881.00, 24, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(48, 24, 'SHA-0024-B', 58524.12, 70071.48, 27, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(49, 25, 'SHA-0025-A', 13234.00, 17416.00, 6, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(50, 25, 'SHA-0025-B', 14292.72, 18809.28, 38, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(51, 26, 'SHA-0026-A', 7000.00, 15742.00, 26, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(52, 26, 'SHA-0026-B', 7560.00, 17001.36, 22, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(53, 27, 'SHA-0027-A', 21403.00, 25784.00, 13, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(54, 27, 'SHA-0027-B', 23115.24, 27846.72, 4, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(55, 28, 'SHA-0028-A', 14735.00, 19977.00, 31, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(56, 28, 'SHA-0028-B', 15913.80, 21575.16, 13, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(57, 29, 'SHA-0029-A', 23963.00, 35383.00, 25, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(58, 29, 'SHA-0029-B', 25880.04, 38213.64, 30, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(59, 30, 'SHA-0030-A', 24146.00, 34089.00, 39, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(60, 30, 'SHA-0030-B', 26077.68, 36816.12, 37, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(61, 31, 'SHA-0031-A', 10663.00, 13558.00, 45, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(62, 31, 'SHA-0031-B', 11516.04, 14642.64, 19, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(63, 32, 'SHA-0032-A', 13623.00, 15805.00, 32, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(64, 32, 'SHA-0032-B', 14712.84, 17069.40, 4, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(65, 33, 'SHA-0033-A', 170071.00, 181300.00, 12, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(66, 33, 'SHA-0033-B', 183676.68, 195804.00, 4, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(67, 34, 'SHA-0034-A', 98958.00, 109179.00, 8, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(68, 34, 'SHA-0034-B', 106874.64, 117913.32, 30, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(69, 35, 'SHA-0035-A', 41184.00, 42754.00, 18, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(70, 35, 'SHA-0035-B', 44478.72, 46174.32, 12, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(71, 36, 'SHA-0036-A', 62091.00, 69290.00, 16, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(72, 36, 'SHA-0036-B', 67058.28, 74833.20, 37, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(73, 37, 'SHA-0037-A', 95508.00, 106123.00, 28, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(74, 37, 'SHA-0037-B', 103148.64, 114612.84, 19, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(75, 38, 'SHA-0038-A', 80499.00, 86190.00, 19, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(76, 38, 'SHA-0038-B', 86938.92, 93085.20, 26, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(77, 39, 'SHA-0039-A', 69241.00, 71985.00, 47, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(78, 39, 'SHA-0039-B', 74780.28, 77743.80, 21, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(79, 40, 'SHA-0040-A', 144600.00, 152734.00, 33, '/assets/images/placeholder-product.svg', 1, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(80, 40, 'SHA-0040-B', 156168.00, 164952.72, 3, '/assets/images/placeholder-product.svg', 0, 1, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `product_variant_attributes`
--

CREATE TABLE `product_variant_attributes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_id` bigint(20) UNSIGNED NOT NULL,
  `attribute_value_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variant_attributes`
--

INSERT INTO `product_variant_attributes` (`id`, `product_variant_id`, `attribute_id`, `attribute_value_id`, `created_at`) VALUES
(1, 1, 1, 1, '2026-03-01 18:39:55'),
(2, 1, 2, 11, '2026-03-01 18:39:55'),
(3, 1, 3, 14, '2026-03-01 18:39:55'),
(4, 1, 4, 16, '2026-03-01 18:39:55'),
(5, 2, 1, 2, '2026-03-01 18:39:55'),
(6, 2, 2, 13, '2026-03-01 18:39:55'),
(7, 2, 3, 15, '2026-03-01 18:39:55'),
(8, 2, 4, 17, '2026-03-01 18:39:55'),
(9, 3, 1, 1, '2026-03-01 18:39:55'),
(10, 3, 2, 11, '2026-03-01 18:39:55'),
(11, 3, 3, 14, '2026-03-01 18:39:55'),
(12, 3, 4, 16, '2026-03-01 18:39:55'),
(13, 4, 1, 2, '2026-03-01 18:39:55'),
(14, 4, 2, 13, '2026-03-01 18:39:55'),
(15, 4, 3, 15, '2026-03-01 18:39:55'),
(16, 4, 4, 17, '2026-03-01 18:39:55'),
(17, 5, 1, 1, '2026-03-01 18:39:55'),
(18, 5, 2, 11, '2026-03-01 18:39:55'),
(19, 5, 3, 14, '2026-03-01 18:39:55'),
(20, 5, 4, 16, '2026-03-01 18:39:55'),
(21, 6, 1, 2, '2026-03-01 18:39:55'),
(22, 6, 2, 13, '2026-03-01 18:39:55'),
(23, 6, 3, 15, '2026-03-01 18:39:55'),
(24, 6, 4, 17, '2026-03-01 18:39:55'),
(25, 7, 1, 1, '2026-03-01 18:39:55'),
(26, 7, 2, 11, '2026-03-01 18:39:55'),
(27, 7, 3, 14, '2026-03-01 18:39:55'),
(28, 7, 4, 16, '2026-03-01 18:39:55'),
(29, 8, 1, 2, '2026-03-01 18:39:55'),
(30, 8, 2, 13, '2026-03-01 18:39:55'),
(31, 8, 3, 15, '2026-03-01 18:39:55'),
(32, 8, 4, 17, '2026-03-01 18:39:55'),
(33, 9, 1, 1, '2026-03-01 18:39:55'),
(34, 9, 2, 11, '2026-03-01 18:39:55'),
(35, 9, 3, 14, '2026-03-01 18:39:55'),
(36, 9, 4, 16, '2026-03-01 18:39:55'),
(37, 10, 1, 2, '2026-03-01 18:39:55'),
(38, 10, 2, 13, '2026-03-01 18:39:55'),
(39, 10, 3, 15, '2026-03-01 18:39:55'),
(40, 10, 4, 17, '2026-03-01 18:39:55'),
(41, 11, 1, 1, '2026-03-01 18:39:55'),
(42, 11, 2, 11, '2026-03-01 18:39:55'),
(43, 11, 3, 14, '2026-03-01 18:39:55'),
(44, 11, 4, 16, '2026-03-01 18:39:55'),
(45, 12, 1, 2, '2026-03-01 18:39:55'),
(46, 12, 2, 13, '2026-03-01 18:39:55'),
(47, 12, 3, 15, '2026-03-01 18:39:55'),
(48, 12, 4, 17, '2026-03-01 18:39:55'),
(49, 13, 1, 1, '2026-03-01 18:39:55'),
(50, 13, 2, 11, '2026-03-01 18:39:55'),
(51, 13, 3, 14, '2026-03-01 18:39:55'),
(52, 13, 4, 16, '2026-03-01 18:39:55'),
(53, 14, 1, 2, '2026-03-01 18:39:55'),
(54, 14, 2, 13, '2026-03-01 18:39:55'),
(55, 14, 3, 15, '2026-03-01 18:39:55'),
(56, 14, 4, 17, '2026-03-01 18:39:55'),
(57, 15, 1, 1, '2026-03-01 18:39:55'),
(58, 15, 2, 11, '2026-03-01 18:39:55'),
(59, 15, 3, 14, '2026-03-01 18:39:55'),
(60, 15, 4, 16, '2026-03-01 18:39:55'),
(61, 16, 1, 2, '2026-03-01 18:39:55'),
(62, 16, 2, 13, '2026-03-01 18:39:55'),
(63, 16, 3, 15, '2026-03-01 18:39:55'),
(64, 16, 4, 17, '2026-03-01 18:39:55'),
(65, 17, 1, 3, '2026-03-01 18:39:55'),
(66, 17, 2, 11, '2026-03-01 18:39:55'),
(67, 17, 3, 14, '2026-03-01 18:39:55'),
(68, 17, 4, 16, '2026-03-01 18:39:55'),
(69, 18, 1, 4, '2026-03-01 18:39:55'),
(70, 18, 2, 13, '2026-03-01 18:39:55'),
(71, 18, 3, 15, '2026-03-01 18:39:55'),
(72, 18, 4, 17, '2026-03-01 18:39:55'),
(73, 19, 1, 3, '2026-03-01 18:39:55'),
(74, 19, 2, 11, '2026-03-01 18:39:55'),
(75, 19, 3, 14, '2026-03-01 18:39:55'),
(76, 19, 4, 16, '2026-03-01 18:39:55'),
(77, 20, 1, 4, '2026-03-01 18:39:55'),
(78, 20, 2, 13, '2026-03-01 18:39:55'),
(79, 20, 3, 15, '2026-03-01 18:39:55'),
(80, 20, 4, 17, '2026-03-01 18:39:55'),
(81, 21, 1, 3, '2026-03-01 18:39:55'),
(82, 21, 2, 11, '2026-03-01 18:39:55'),
(83, 21, 3, 14, '2026-03-01 18:39:55'),
(84, 21, 4, 16, '2026-03-01 18:39:55'),
(85, 22, 1, 4, '2026-03-01 18:39:55'),
(86, 22, 2, 13, '2026-03-01 18:39:55'),
(87, 22, 3, 15, '2026-03-01 18:39:55'),
(88, 22, 4, 17, '2026-03-01 18:39:55'),
(89, 23, 1, 3, '2026-03-01 18:39:55'),
(90, 23, 2, 11, '2026-03-01 18:39:55'),
(91, 23, 3, 14, '2026-03-01 18:39:55'),
(92, 23, 4, 16, '2026-03-01 18:39:55'),
(93, 24, 1, 4, '2026-03-01 18:39:55'),
(94, 24, 2, 13, '2026-03-01 18:39:55'),
(95, 24, 3, 15, '2026-03-01 18:39:55'),
(96, 24, 4, 17, '2026-03-01 18:39:55'),
(97, 25, 1, 3, '2026-03-01 18:39:55'),
(98, 25, 2, 11, '2026-03-01 18:39:55'),
(99, 25, 3, 14, '2026-03-01 18:39:55'),
(100, 25, 4, 16, '2026-03-01 18:39:55'),
(101, 26, 1, 4, '2026-03-01 18:39:55'),
(102, 26, 2, 13, '2026-03-01 18:39:55'),
(103, 26, 3, 15, '2026-03-01 18:39:55'),
(104, 26, 4, 17, '2026-03-01 18:39:55'),
(105, 27, 1, 3, '2026-03-01 18:39:55'),
(106, 27, 2, 11, '2026-03-01 18:39:55'),
(107, 27, 3, 14, '2026-03-01 18:39:55'),
(108, 27, 4, 16, '2026-03-01 18:39:55'),
(109, 28, 1, 4, '2026-03-01 18:39:55'),
(110, 28, 2, 13, '2026-03-01 18:39:55'),
(111, 28, 3, 15, '2026-03-01 18:39:55'),
(112, 28, 4, 17, '2026-03-01 18:39:55'),
(113, 29, 1, 3, '2026-03-01 18:39:55'),
(114, 29, 2, 11, '2026-03-01 18:39:55'),
(115, 29, 3, 14, '2026-03-01 18:39:55'),
(116, 29, 4, 16, '2026-03-01 18:39:55'),
(117, 30, 1, 4, '2026-03-01 18:39:55'),
(118, 30, 2, 13, '2026-03-01 18:39:55'),
(119, 30, 3, 15, '2026-03-01 18:39:55'),
(120, 30, 4, 17, '2026-03-01 18:39:55'),
(121, 31, 1, 3, '2026-03-01 18:39:55'),
(122, 31, 2, 11, '2026-03-01 18:39:55'),
(123, 31, 3, 14, '2026-03-01 18:39:55'),
(124, 31, 4, 16, '2026-03-01 18:39:55'),
(125, 32, 1, 4, '2026-03-01 18:39:55'),
(126, 32, 2, 13, '2026-03-01 18:39:55'),
(127, 32, 3, 15, '2026-03-01 18:39:55'),
(128, 32, 4, 17, '2026-03-01 18:39:55'),
(129, 33, 1, 5, '2026-03-01 18:39:55'),
(130, 33, 2, 11, '2026-03-01 18:39:55'),
(131, 33, 3, 14, '2026-03-01 18:39:55'),
(132, 33, 4, 16, '2026-03-01 18:39:55'),
(133, 34, 1, 6, '2026-03-01 18:39:55'),
(134, 34, 2, 13, '2026-03-01 18:39:55'),
(135, 34, 3, 15, '2026-03-01 18:39:55'),
(136, 34, 4, 17, '2026-03-01 18:39:55'),
(137, 35, 1, 5, '2026-03-01 18:39:55'),
(138, 35, 2, 11, '2026-03-01 18:39:55'),
(139, 35, 3, 14, '2026-03-01 18:39:55'),
(140, 35, 4, 16, '2026-03-01 18:39:55'),
(141, 36, 1, 6, '2026-03-01 18:39:55'),
(142, 36, 2, 13, '2026-03-01 18:39:55'),
(143, 36, 3, 15, '2026-03-01 18:39:55'),
(144, 36, 4, 17, '2026-03-01 18:39:55'),
(145, 37, 1, 5, '2026-03-01 18:39:55'),
(146, 37, 2, 11, '2026-03-01 18:39:55'),
(147, 37, 3, 14, '2026-03-01 18:39:55'),
(148, 37, 4, 16, '2026-03-01 18:39:55'),
(149, 38, 1, 6, '2026-03-01 18:39:55'),
(150, 38, 2, 13, '2026-03-01 18:39:55'),
(151, 38, 3, 15, '2026-03-01 18:39:55'),
(152, 38, 4, 17, '2026-03-01 18:39:55'),
(153, 39, 1, 5, '2026-03-01 18:39:55'),
(154, 39, 2, 11, '2026-03-01 18:39:55'),
(155, 39, 3, 14, '2026-03-01 18:39:55'),
(156, 39, 4, 16, '2026-03-01 18:39:55'),
(157, 40, 1, 6, '2026-03-01 18:39:55'),
(158, 40, 2, 13, '2026-03-01 18:39:55'),
(159, 40, 3, 15, '2026-03-01 18:39:55'),
(160, 40, 4, 17, '2026-03-01 18:39:55'),
(161, 41, 1, 5, '2026-03-01 18:39:55'),
(162, 41, 2, 11, '2026-03-01 18:39:55'),
(163, 41, 3, 14, '2026-03-01 18:39:55'),
(164, 41, 4, 16, '2026-03-01 18:39:55'),
(165, 42, 1, 6, '2026-03-01 18:39:55'),
(166, 42, 2, 13, '2026-03-01 18:39:55'),
(167, 42, 3, 15, '2026-03-01 18:39:55'),
(168, 42, 4, 17, '2026-03-01 18:39:55'),
(169, 43, 1, 5, '2026-03-01 18:39:55'),
(170, 43, 2, 11, '2026-03-01 18:39:55'),
(171, 43, 3, 14, '2026-03-01 18:39:55'),
(172, 43, 4, 16, '2026-03-01 18:39:55'),
(173, 44, 1, 6, '2026-03-01 18:39:55'),
(174, 44, 2, 13, '2026-03-01 18:39:55'),
(175, 44, 3, 15, '2026-03-01 18:39:55'),
(176, 44, 4, 17, '2026-03-01 18:39:55'),
(177, 45, 1, 5, '2026-03-01 18:39:55'),
(178, 45, 2, 11, '2026-03-01 18:39:55'),
(179, 45, 3, 14, '2026-03-01 18:39:55'),
(180, 45, 4, 16, '2026-03-01 18:39:55'),
(181, 46, 1, 6, '2026-03-01 18:39:55'),
(182, 46, 2, 13, '2026-03-01 18:39:55'),
(183, 46, 3, 15, '2026-03-01 18:39:55'),
(184, 46, 4, 17, '2026-03-01 18:39:55'),
(185, 47, 1, 5, '2026-03-01 18:39:55'),
(186, 47, 2, 11, '2026-03-01 18:39:55'),
(187, 47, 3, 14, '2026-03-01 18:39:55'),
(188, 47, 4, 16, '2026-03-01 18:39:55'),
(189, 48, 1, 6, '2026-03-01 18:39:55'),
(190, 48, 2, 13, '2026-03-01 18:39:55'),
(191, 48, 3, 15, '2026-03-01 18:39:55'),
(192, 48, 4, 17, '2026-03-01 18:39:55'),
(193, 49, 1, 7, '2026-03-01 18:39:55'),
(194, 49, 2, 11, '2026-03-01 18:39:55'),
(195, 49, 3, 14, '2026-03-01 18:39:55'),
(196, 49, 4, 16, '2026-03-01 18:39:55'),
(197, 50, 1, 8, '2026-03-01 18:39:55'),
(198, 50, 2, 13, '2026-03-01 18:39:55'),
(199, 50, 3, 15, '2026-03-01 18:39:55'),
(200, 50, 4, 17, '2026-03-01 18:39:55'),
(201, 51, 1, 7, '2026-03-01 18:39:55'),
(202, 51, 2, 11, '2026-03-01 18:39:55'),
(203, 51, 3, 14, '2026-03-01 18:39:55'),
(204, 51, 4, 16, '2026-03-01 18:39:55'),
(205, 52, 1, 8, '2026-03-01 18:39:55'),
(206, 52, 2, 13, '2026-03-01 18:39:55'),
(207, 52, 3, 15, '2026-03-01 18:39:55'),
(208, 52, 4, 17, '2026-03-01 18:39:55'),
(209, 53, 1, 7, '2026-03-01 18:39:55'),
(210, 53, 2, 11, '2026-03-01 18:39:55'),
(211, 53, 3, 14, '2026-03-01 18:39:55'),
(212, 53, 4, 16, '2026-03-01 18:39:55'),
(213, 54, 1, 8, '2026-03-01 18:39:55'),
(214, 54, 2, 13, '2026-03-01 18:39:55'),
(215, 54, 3, 15, '2026-03-01 18:39:55'),
(216, 54, 4, 17, '2026-03-01 18:39:55'),
(217, 55, 1, 7, '2026-03-01 18:39:55'),
(218, 55, 2, 11, '2026-03-01 18:39:55'),
(219, 55, 3, 14, '2026-03-01 18:39:55'),
(220, 55, 4, 16, '2026-03-01 18:39:55'),
(221, 56, 1, 8, '2026-03-01 18:39:55'),
(222, 56, 2, 13, '2026-03-01 18:39:55'),
(223, 56, 3, 15, '2026-03-01 18:39:55'),
(224, 56, 4, 17, '2026-03-01 18:39:55'),
(225, 57, 1, 7, '2026-03-01 18:39:55'),
(226, 57, 2, 11, '2026-03-01 18:39:55'),
(227, 57, 3, 14, '2026-03-01 18:39:55'),
(228, 57, 4, 16, '2026-03-01 18:39:55'),
(229, 58, 1, 8, '2026-03-01 18:39:55'),
(230, 58, 2, 13, '2026-03-01 18:39:55'),
(231, 58, 3, 15, '2026-03-01 18:39:55'),
(232, 58, 4, 17, '2026-03-01 18:39:55'),
(233, 59, 1, 7, '2026-03-01 18:39:55'),
(234, 59, 2, 11, '2026-03-01 18:39:55'),
(235, 59, 3, 14, '2026-03-01 18:39:55'),
(236, 59, 4, 16, '2026-03-01 18:39:55'),
(237, 60, 1, 8, '2026-03-01 18:39:55'),
(238, 60, 2, 13, '2026-03-01 18:39:55'),
(239, 60, 3, 15, '2026-03-01 18:39:55'),
(240, 60, 4, 17, '2026-03-01 18:39:55'),
(241, 61, 1, 7, '2026-03-01 18:39:55'),
(242, 61, 2, 11, '2026-03-01 18:39:55'),
(243, 61, 3, 14, '2026-03-01 18:39:55'),
(244, 61, 4, 16, '2026-03-01 18:39:55'),
(245, 62, 1, 8, '2026-03-01 18:39:55'),
(246, 62, 2, 13, '2026-03-01 18:39:55'),
(247, 62, 3, 15, '2026-03-01 18:39:55'),
(248, 62, 4, 17, '2026-03-01 18:39:55'),
(249, 63, 1, 7, '2026-03-01 18:39:55'),
(250, 63, 2, 11, '2026-03-01 18:39:55'),
(251, 63, 3, 14, '2026-03-01 18:39:55'),
(252, 63, 4, 16, '2026-03-01 18:39:55'),
(253, 64, 1, 8, '2026-03-01 18:39:55'),
(254, 64, 2, 13, '2026-03-01 18:39:55'),
(255, 64, 3, 15, '2026-03-01 18:39:55'),
(256, 64, 4, 17, '2026-03-01 18:39:55'),
(257, 65, 1, 9, '2026-03-01 18:39:55'),
(258, 65, 2, 11, '2026-03-01 18:39:55'),
(259, 65, 3, 14, '2026-03-01 18:39:55'),
(260, 65, 4, 16, '2026-03-01 18:39:55'),
(261, 66, 1, 10, '2026-03-01 18:39:55'),
(262, 66, 2, 13, '2026-03-01 18:39:55'),
(263, 66, 3, 15, '2026-03-01 18:39:55'),
(264, 66, 4, 17, '2026-03-01 18:39:55'),
(265, 67, 1, 9, '2026-03-01 18:39:55'),
(266, 67, 2, 11, '2026-03-01 18:39:55'),
(267, 67, 3, 14, '2026-03-01 18:39:55'),
(268, 67, 4, 16, '2026-03-01 18:39:55'),
(269, 68, 1, 10, '2026-03-01 18:39:55'),
(270, 68, 2, 13, '2026-03-01 18:39:55'),
(271, 68, 3, 15, '2026-03-01 18:39:55'),
(272, 68, 4, 17, '2026-03-01 18:39:55'),
(273, 69, 1, 9, '2026-03-01 18:39:55'),
(274, 69, 2, 11, '2026-03-01 18:39:55'),
(275, 69, 3, 14, '2026-03-01 18:39:55'),
(276, 69, 4, 16, '2026-03-01 18:39:55'),
(277, 70, 1, 10, '2026-03-01 18:39:55'),
(278, 70, 2, 13, '2026-03-01 18:39:55'),
(279, 70, 3, 15, '2026-03-01 18:39:55'),
(280, 70, 4, 17, '2026-03-01 18:39:55'),
(281, 71, 1, 9, '2026-03-01 18:39:55'),
(282, 71, 2, 11, '2026-03-01 18:39:55'),
(283, 71, 3, 14, '2026-03-01 18:39:55'),
(284, 71, 4, 16, '2026-03-01 18:39:55'),
(285, 72, 1, 10, '2026-03-01 18:39:55'),
(286, 72, 2, 13, '2026-03-01 18:39:55'),
(287, 72, 3, 15, '2026-03-01 18:39:55'),
(288, 72, 4, 17, '2026-03-01 18:39:55'),
(289, 73, 1, 9, '2026-03-01 18:39:55'),
(290, 73, 2, 11, '2026-03-01 18:39:55'),
(291, 73, 3, 14, '2026-03-01 18:39:55'),
(292, 73, 4, 16, '2026-03-01 18:39:55'),
(293, 74, 1, 10, '2026-03-01 18:39:55'),
(294, 74, 2, 13, '2026-03-01 18:39:55'),
(295, 74, 3, 15, '2026-03-01 18:39:55'),
(296, 74, 4, 17, '2026-03-01 18:39:55'),
(297, 75, 1, 9, '2026-03-01 18:39:55'),
(298, 75, 2, 11, '2026-03-01 18:39:55'),
(299, 75, 3, 14, '2026-03-01 18:39:55'),
(300, 75, 4, 16, '2026-03-01 18:39:55'),
(301, 76, 1, 10, '2026-03-01 18:39:55'),
(302, 76, 2, 13, '2026-03-01 18:39:55'),
(303, 76, 3, 15, '2026-03-01 18:39:55'),
(304, 76, 4, 17, '2026-03-01 18:39:55'),
(305, 77, 1, 9, '2026-03-01 18:39:55'),
(306, 77, 2, 11, '2026-03-01 18:39:55'),
(307, 77, 3, 14, '2026-03-01 18:39:55'),
(308, 77, 4, 16, '2026-03-01 18:39:55'),
(309, 78, 1, 10, '2026-03-01 18:39:55'),
(310, 78, 2, 13, '2026-03-01 18:39:55'),
(311, 78, 3, 15, '2026-03-01 18:39:55'),
(312, 78, 4, 17, '2026-03-01 18:39:55'),
(313, 79, 1, 9, '2026-03-01 18:39:55'),
(314, 79, 2, 11, '2026-03-01 18:39:55'),
(315, 79, 3, 14, '2026-03-01 18:39:55'),
(316, 79, 4, 16, '2026-03-01 18:39:55'),
(317, 80, 1, 10, '2026-03-01 18:39:55'),
(318, 80, 2, 13, '2026-03-01 18:39:55'),
(319, 80, 3, 15, '2026-03-01 18:39:55'),
(320, 80, 4, 17, '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `title` varchar(160) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `title`, `comment`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 1, 4, 'Excellent Product', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 7, 2, 3, 'Worth the Price', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 10, 3, 4, 'Very Reliable', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 13, 4, 5, 'Great Build Quality', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 16, 5, 4, 'Energy Efficient', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'pending', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(6, 19, 6, 4, 'Highly Recommended', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(7, 22, 1, 3, 'Good Performance', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(8, 25, 2, 4, 'Perfect for Family', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(9, 28, 3, 5, 'Quiet and Powerful', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(10, 31, 4, 4, 'Value for Money', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'pending', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(11, 34, 5, 4, 'Excellent Product', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(12, 37, 6, 3, 'Worth the Price', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(13, 40, 1, 4, 'Very Reliable', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(14, 3, 2, 5, 'Great Build Quality', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(15, 6, 3, 4, 'Energy Efficient', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'pending', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(16, 9, 4, 4, 'Highly Recommended', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(17, 12, 5, 3, 'Good Performance', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(18, 15, 6, 4, 'Perfect for Family', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(19, 18, 1, 5, 'Quiet and Powerful', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(20, 21, 2, 4, 'Value for Money', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'pending', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(21, 24, 3, 4, 'Excellent Product', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(22, 27, 4, 3, 'Worth the Price', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(23, 30, 5, 4, 'Very Reliable', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(24, 33, 6, 5, 'Great Build Quality', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'approved', '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(25, 36, 1, 4, 'Energy Efficient', 'Used this appliance for several weeks. Performance is stable and service support is good.', 'pending', '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `email` varchar(190) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Aarav Mehta', 'aarav@example.com', '9876500011', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(2, 'Diya Sharma', 'diya@example.com', '9876500012', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(3, 'Rohan Verma', 'rohan@example.com', '9876500013', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(4, 'Neha Kapoor', 'neha@example.com', '9876500014', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(5, 'Kabir Singh', 'kabir@example.com', '9876500015', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55'),
(6, 'Anaya Joshi', 'anaya@example.com', '9876500016', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active', NULL, '2026-03-01 18:39:55', '2026-03-01 18:39:55');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `product_variant_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`id`, `user_id`, `product_id`, `product_variant_id`, `created_at`) VALUES
(1, 1, 5, 9, '2026-03-01 18:39:55'),
(2, 1, 18, 35, '2026-03-01 18:39:55'),
(3, 2, 27, 53, '2026-03-01 18:39:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `attributes`
--
ALTER TABLE `attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_attribute_value` (`attribute_id`,`slug`),
  ADD KEY `idx_attribute_values_attribute` (`attribute_id`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_brands_active` (`is_active`);

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_cart_variant` (`product_variant_id`),
  ADD KEY `idx_cart_user` (`user_id`),
  ADD KEY `idx_cart_product` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_categories_active_order` (`is_active`,`sort_order`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_coupons_active_period` (`is_active`,`starts_at`,`expires_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_no` (`order_no`),
  ADD KEY `fk_orders_coupon` (`coupon_id`),
  ADD KEY `idx_orders_user_placed` (`user_id`,`placed_at`),
  ADD KEY `idx_orders_status_placed` (`order_status`,`placed_at`);

--
-- Indexes for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_addresses_order` (`order_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_product` (`product_id`),
  ADD KEY `fk_order_items_variant` (`product_variant_id`),
  ADD KEY `idx_order_items_order` (`order_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `fk_products_brand` (`brand_id`),
  ADD KEY `idx_products_filters` (`category_id`,`brand_id`,`is_active`,`deleted_at`),
  ADD KEY `idx_products_price` (`base_price`),
  ADD KEY `idx_products_rating` (`rating_avg`),
  ADD KEY `idx_products_featured` (`is_featured`,`is_active`,`deleted_at`);
ALTER TABLE `products` ADD FULLTEXT KEY `ft_products_search` (`name`,`short_description`,`description`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_images_product` (`product_id`,`is_primary`,`sort_order`);

--
-- Indexes for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_spec_product` (`product_id`,`sort_order`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `idx_product_variants_product` (`product_id`,`is_active`);

--
-- Indexes for table `product_variant_attributes`
--
ALTER TABLE `product_variant_attributes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_variant_attribute` (`product_variant_id`,`attribute_id`),
  ADD KEY `fk_variant_attr_attribute` (`attribute_id`),
  ADD KEY `idx_variant_attr_value` (`attribute_value_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reviews_product_status` (`product_id`,`status`),
  ADD KEY `idx_reviews_user` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_wishlist_user_product_variant` (`user_id`,`product_id`,`product_variant_id`),
  ADD KEY `fk_wishlist_product` (`product_id`),
  ADD KEY `fk_wishlist_variant` (`product_variant_id`),
  ADD KEY `idx_wishlist_user` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attributes`
--
ALTER TABLE `attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attribute_values`
--
ALTER TABLE `attribute_values`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_addresses`
--
ALTER TABLE `order_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `product_specifications`
--
ALTER TABLE `product_specifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `product_variant_attributes`
--
ALTER TABLE `product_variant_attributes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=321;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `fk_attribute_values_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cart_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_addresses`
--
ALTER TABLE `order_addresses`
  ADD CONSTRAINT `fk_order_addresses_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_specifications`
--
ALTER TABLE `product_specifications`
  ADD CONSTRAINT `fk_product_spec_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `fk_product_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variant_attributes`
--
ALTER TABLE `product_variant_attributes`
  ADD CONSTRAINT `fk_variant_attr_attribute` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_variant_attr_value` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_variant_attr_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `fk_wishlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wishlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_wishlist_variant` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
