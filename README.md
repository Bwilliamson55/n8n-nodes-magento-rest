# n8n-nodes-magento-rest

An enhanced n8n community node for interacting with the Magento REST API. This node extends the core Magento node functionality with advanced features like comprehensive searchCriteria support, making it easier to build complex queries without using the HTTP node.

## About Magento

[Magento](https://magento.com) is a powerful e-commerce platform that provides a comprehensive REST API for managing products, customers, orders, categories, and more. The REST API allows you to integrate Magento with external systems and automate e-commerce workflows.

## About n8n

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that allows you to connect different services and automate tasks.

## Why This Node?

While n8n includes a core Magento node, it lacks support for advanced features like:
- **searchCriteria parameters**: Complex filtering, sorting, and pagination
- **Bulk operations**: Efficient batch processing
- **Custom endpoints**: Support for custom REST endpoints
- **Enhanced error handling**: Better error messages and retry logic

This node provides all the functionality of the core node **plus** these enhanced features, eliminating the need to use the HTTP node for common Magento operations.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Operations](#operations)
- [Credentials](#credentials)
- [searchCriteria Usage](#searchcriteria-usage)
- [Examples](#examples)
- [Compatibility](#compatibility)
- [Contributing](#contributing)
- [Version History](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

Or install via npm:

```bash
npm install n8n-nodes-magento-rest
```

## Features

### ✨ Enhanced Features

- **🔍 searchCriteria Support**: Build complex queries with filters, sort orders, and pagination
- **📦 Bulk Operations**: Efficient batch processing for products, customers, and orders
- **🔄 Better Error Handling**: Detailed error messages with Magento-specific error codes
- **⚡ Performance Optimized**: Built-in pagination and rate limiting awareness
- **🎯 Field Selection**: Specify exactly which fields to return in responses

### ✅ Core Features (Matching Core Node)

- **Products**: Full CRUD operations
- **Categories**: Full CRUD operations
- **Customers**: Full CRUD operations
- **Orders**: Get, list, and create invoices/shipments
- **Inventory**: Stock management operations

## Operations

### Products
- **Create Product** - Add a new product
- **Get Product** - Retrieve a single product by SKU
- **Update Product** - Update an existing product
- **Delete Product** - Delete a product
- **List Products** - Get products with searchCriteria support ✨

### Categories
- **Create Category** - Add a new category
- **Get Category** - Retrieve a single category
- **Update Category** - Update an existing category
- **Delete Category** - Delete a category
- **List Categories** - Get categories with searchCriteria support ✨

### Customers
- **Create Customer** - Add a new customer
- **Get Customer** - Retrieve a single customer
- **Update Customer** - Update an existing customer
- **Delete Customer** - Delete a customer
- **List Customers** - Get customers with searchCriteria support ✨

### Orders
- **Get Order** - Retrieve a single order
- **List Orders** - Get orders with searchCriteria support ✨
- **Create Invoice** - Create an invoice for an order
- **Create Shipment** - Create a shipment for an order

### Inventory
- **Update Stock** - Update product stock levels
- **Get Stock** - Get stock information for products

## Credentials

### Setting Up Credentials

1. **Base URL**: Enter your Magento instance URL (e.g., `https://your-magento-store.com`)
2. **Access Token**: Provide your Magento REST API access token
3. **Consumer Key** (OAuth): If using OAuth 1.0a, provide consumer key
4. **Consumer Secret** (OAuth): If using OAuth 1.0a, provide consumer secret

### Authentication Methods

- **Access Token**: Simple token-based authentication (recommended for admin operations)
- **OAuth 1.0a**: Full OAuth flow for integrations

See [Magento REST API Authentication](https://devdocs.magento.com/guides/v2.4/get-started/authentication/gs-authentication-token.html) for more details.

## searchCriteria Usage

The searchCriteria feature allows you to build complex queries using a user-friendly interface instead of manually constructing query strings.

### Example: Find Products by Name

**Filter**:
- Field: `name`
- Condition: `like`
- Value: `%shirt%`

**Sort**:
- Field: `name`
- Direction: `ASC`

**Pagination**:
- Page Size: `20`
- Current Page: `1`

This will find all products with "shirt" in the name, sorted alphabetically, returning 20 results per page.

### Example: Multiple Filters with AND/OR Logic

**Filter Group 1** (AND):
- Field: `status`, Condition: `eq`, Value: `1` (Enabled)
- Field: `visibility`, Condition: `eq`, Value: `4` (Catalog, Search)

**Filter Group 2** (OR):
- Field: `price`, Condition: `lt`, Value: `50`
- Field: `special_price`, Condition: `notnull`

This will find products that are enabled AND visible in catalog/search, AND (price < 50 OR has special price).

## Examples

### Example 1: List Products with Filters

```json
{
  "resource": "product",
  "operation": "list",
  "searchCriteria": {
    "filterGroups": [
      {
        "filters": [
          {
            "field": "status",
            "condition": "eq",
            "value": "1"
          }
        ]
      }
    ],
    "sortOrders": [
      {
        "field": "name",
        "direction": "ASC"
      }
    ],
    "pageSize": 20,
    "currentPage": 1
  }
}
```

### Example 2: Get Orders by Date Range

```json
{
  "resource": "order",
  "operation": "list",
  "searchCriteria": {
    "filterGroups": [
      {
        "filters": [
          {
            "field": "created_at",
            "condition": "gteq",
            "value": "2024-01-01 00:00:00"
          },
          {
            "field": "created_at",
            "condition": "lteq",
            "value": "2024-12-31 23:59:59"
          }
        ]
      }
    ]
  }
}
```

## Compatibility

- **n8n**: 2.2.0+
- **Magento**: 2.0+ (tested with 2.4.x)
- **Node.js**: 18.17.0+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run linting: `npm run lint`

### Reporting Issues

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/Bwilliamson55/n8n-nodes-magento-rest/issues).

## Version History

### v0.1.0 (Initial Release)
- Core Magento REST API operations
- searchCriteria support for list operations
- Enhanced error handling
- Comprehensive documentation

## Resources

- [Magento REST API Documentation](https://devdocs.magento.com/guides/v2.4/rest/bk-rest.html)
- [n8n Documentation](https://docs.n8n.io/)
- [Magento Community](https://community.magento.com/)

## License

MIT

