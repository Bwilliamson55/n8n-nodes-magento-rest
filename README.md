# n8n-nodes-magento-rest

An n8n community node for interacting with the Magento REST API. Extends the core Magento node with searchCriteria support and other enhancements, making it easier to build complex queries without using the HTTP node.

## About Magento

[Magento](https://magento.com) is a powerful e-commerce platform that provides a comprehensive REST API for managing products, customers, orders, categories, and more. The REST API allows you to integrate Magento with external systems and automate e-commerce workflows.

## About n8n

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform that allows you to connect different services and automate tasks.

## Why This Node?

The core n8n Magento node lacks support for searchCriteria parameters, which are essential for complex filtering, sorting, and pagination. This node adds that functionality along with better error handling, making it easier to work with Magento's REST API without resorting to the HTTP node.

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

### Enhanced Features

- **searchCriteria Support**: Build complex queries with filters, sort orders, and pagination
- **Simplify Output**: Flatten Magento responses for easier use - converts `custom_attributes` array to object, flattens `extension_attributes`, and simplifies nested structures
- **Better Error Handling**: Detailed error messages with Magento-specific error codes
- **Performance Optimized**: Built-in pagination and rate limiting awareness

### Core Features

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
- **List Products** - Get products with searchCriteria support

### Categories
- **Create Category** - Add a new category
- **Get Category** - Retrieve a single category
- **Update Category** - Update an existing category
- **Delete Category** - Delete a category
- **List Categories** - Get categories with searchCriteria support

### Customers
- **Create Customer** - Add a new customer
- **Get Customer** - Retrieve a single customer
- **Update Customer** - Update an existing customer
- **Delete Customer** - Delete a customer
- **List Customers** - Get customers with searchCriteria support

### Orders
- **Get Order** - Retrieve a single order
- **List Orders** - Get orders with searchCriteria support
- **Create Invoice** - Create an invoice for an order
- **Create Shipment** - Create a shipment for an order
- **Cancel Order** - Cancel an order

### Inventory
- **Update Stock** - Update product stock levels
- **Get Stock** - Get stock information for products

## Simplify Output

The node includes an optional "Simplify Output" feature that flattens Magento API responses to make them easier to work with. When enabled:

- **custom_attributes** array is converted to an `attributes` object keyed by attribute codes
- **extension_attributes** are moved to top level with `extension_` prefix
- **product_links** (products only) are grouped by `link_type`
- **media_gallery_entries** (products only) are simplified to an `images` array
- **SKU** values are sanitized (quotes removed)

This makes it easier to access product attributes like `{{$json.attributes.name}}` instead of searching through arrays.

## Credentials

This node uses n8n's built-in Magento 2 credential type. You can reuse existing Magento credentials from the core n8n Magento node.

### Setting Up Credentials

1. In n8n, go to Credentials and create a new Magento 2 credential (or reuse an existing one)
2. **Host**: Enter your Magento instance URL (e.g., `https://your-magento-store.com`)
3. **Access Token**: Provide your Magento REST API access token

To obtain an access token:
- In Magento Admin Panel, go to System > Extensions > Integrations
- Create a new integration and activate it
- Copy the access token and use it in n8n

**Note**: Ensure your Magento store allows OAuth access tokens to be used as standalone Bearer tokens:
- Go to `Admin > Stores > Configuration > Services > OAuth > Consumer Settings`
- Set "Allow OAuth Access Tokens to be used as standalone Bearer tokens" to "Yes"
- Or run: `bin/magento config:set oauth/consumer/enable_integration_as_bearer 1`

See [n8n Magento 2 Credentials Documentation](https://docs.n8n.io/integrations/builtin/credentials/magento2/) for more details.

## searchCriteria Usage

The searchCriteria feature lets you build complex queries using a user-friendly interface instead of manually constructing query strings.

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

This finds all products with "shirt" in the name, sorted alphabetically, returning 20 results per page.

### Example: Multiple Filters with AND/OR Logic

**Filter Group 1** (AND):
- Field: `status`, Condition: `eq`, Value: `1` (Enabled)
- Field: `visibility`, Condition: `eq`, Value: `4` (Catalog, Search)

**Filter Group 2** (OR):
- Field: `price`, Condition: `lt`, Value: `50`
- Field: `special_price`, Condition: `notnull`

This finds products that are enabled AND visible in catalog/search, AND (price < 50 OR has special price).

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

## Updating

If you use the community nodes GUI, you can update there. For Docker setups, rebuild your container to get the updated node version.

### Docker Setup

If you're using `docker compose` or `docker-compose`, you can use a Dockerfile to persist custom nodes:

Put the `Dockerfile` and `docker-entrypoint.sh` in the same directory as your docker-compose file, and swap the `image` property for `build: .`

Then run:
```bash
docker-compose down && docker-compose up --build -d
```

Or for less downtime:
```bash
docker-compose build
docker-compose down && docker-compose up --force-recreate -d
```

**Note**: Using `-g` in the Dockerfile means these nodes won't show in 'community nodes' but will work and show when searched for.

`Dockerfile`:
```dockerfile
FROM n8nio/n8n:latest
RUN npm install -g n8n-nodes-magento-rest
```

`docker-entrypoint.sh`:
```shell
#!/bin/sh

if [ -d /root/.n8n ] ; then
  chmod o+rx /root
  chown -R node /root/.n8n
  ln -s /root/.n8n /home/node/
fi

chown -R node /home/node

if [ "$#" -gt 0 ]; then
  exec su-exec node "$@"
else
  exec su-exec node n8n
fi
```

## Publishing

To publish a new version to npm:

1. **Update version** in `package.json`
2. **Build the project**:
   ```bash
   npm run build
   ```
3. **Run linting**:
   ```bash
   npm run lint
   ```
4. **Test locally** with a real n8n instance
5. **Dry run** to check what will be published:
   ```bash
   npm pack --dry-run
   ```
6. **Publish**:
   ```bash
   npm publish
   ```

Only the `dist/` directory will be published to npm based on the `files` array in `package.json`.

## Contributing

Contributions are welcome. Please submit a Pull Request. For major changes, open an issue first to discuss.

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Bwilliamson55/n8n-nodes-magento-rest.git
   cd n8n-nodes-magento-rest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

### Local Development with npm link

To develop and test the node locally with your n8n instance:

1. **Build the project** (if you haven't already):
   ```bash
   npm run build
   ```

2. **Create a global symlink**:
   ```bash
   npm link
   ```

3. **Link to your n8n installation**:
   
   For n8n installed globally:
   ```bash
   cd /path/to/your/n8n/installation
   npm link n8n-nodes-magento-rest
   ```
   
   For n8n installed locally:
   ```bash
   cd /path/to/your/n8n/project
   npm link n8n-nodes-magento-rest
   ```
   
   For n8n in Docker: mount your local development directory into the container or build a custom Docker image.

4. **Restart n8n** to load the linked node

5. **During development**, use watch mode to automatically rebuild:
   ```bash
   npm run dev
   ```

6. **To unlink** when done:
   ```bash
   npm unlink -g n8n-nodes-magento-rest
   cd /path/to/your/n8n/directory
   npm unlink n8n-nodes-magento-rest
   ```

### Development Workflow

1. Make changes to the TypeScript files in `nodes/Magento/`
2. Run `npm run build` (or use `npm run dev` for watch mode)
3. Restart n8n to pick up changes
4. Test your changes in the n8n UI
5. Run `npm run lint` to check for code issues
6. Run `npm run lintfix` to auto-fix linting issues

### Testing

Test all operations with a real Magento instance, verify searchCriteria functionality with various filter combinations, and test error handling with invalid credentials or API errors.

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

