# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-XX

### Added
- Initial release of n8n-nodes-magento-rest
- Core Magento REST API operations for Products, Categories, Customers, Orders, and Inventory
- Comprehensive searchCriteria support with filter groups, filters, sort orders, and pagination
- Store resource with operations to get store groups, store views, and websites
- Dynamic store view code loading from Magento API
- Enhanced error handling with formatted Magento error messages
- Website/store view code support for multi-store Magento instances
- Field selection support (prepared for future implementation)

### Features
- **Products**: Create, Get, Update, Delete, List operations
- **Categories**: Create, Get, Update, Delete, List operations
- **Customers**: Create, Get, Update, Delete, List operations
- **Orders**: Get, List, Create Invoice, Create Shipment, Cancel operations
- **Inventory**: Update Stock, Get Stock operations
- **Store**: Get Store Groups, Get Store Views, Get Websites operations

### Technical Details
- Built with TypeScript
- Uses n8n's built-in Magento 2 credential type
- Supports all Magento 2 REST API endpoints
- Properly handles Magento's bracket notation in query strings
- Includes default pagination (pageSize: 20, currentPage: 1) to prevent 400 errors

