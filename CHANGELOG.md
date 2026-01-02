# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-01-XX

### Added
- **Simplify Output** feature: Optional output flattening for easier data manipulation
  - Converts `custom_attributes` array to `attributes` object (keyed by attribute codes)
  - Flattens `extension_attributes` to top level with `extension_` prefix
  - Simplifies `product_links` structure (grouped by link_type for products)
  - Converts `media_gallery_entries` to simplified `images` array (for products)
  - Sanitizes SKU values (removes quotes)
- Simplify Output option available for all resources (Products, Categories, Customers, Orders, Inventory, Store)

### Changed
- Improved response structure handling for better workflow integration

## [0.1.0] - 2025-01-XX

### Added
- Initial release of n8n-nodes-magento-rest
- Core Magento REST API operations for Products, Categories, Customers, Orders, and Inventory
- searchCriteria support with filter groups, filters, sort orders, and pagination
- Store resource with operations to get store groups, store views, and websites
- Dynamic store view code loading from Magento API
- Enhanced error handling with formatted Magento error messages
- Website/store view code support for multi-store Magento instances

### Features
- Products: Create, Get, Update, Delete, List operations
- Categories: Create, Get, Update, Delete, List operations
- Customers: Create, Get, Update, Delete, List operations
- Orders: Get, List, Create Invoice, Create Shipment, Cancel operations
- Inventory: Update Stock, Get Stock operations
- Store: Get Store Groups, Get Store Views, Get Websites operations

### Technical Details
- Built with TypeScript
- Uses n8n's built-in Magento 2 credential type
- Supports all Magento 2 REST API endpoints
- Properly handles Magento's bracket notation in query strings
- Includes default pagination (pageSize: 20, currentPage: 1) to prevent 400 errors

