import type { INodeProperties, ILoadOptionsFunctions } from 'n8n-workflow';

/**
 * Helper function to build searchCriteria query string from object
 * Converts Magento searchCriteria object to query string format
 * Always includes default pageSize and currentPage to prevent 400 errors
 */
export function buildSearchCriteriaQuery(searchCriteria: any, includeDefaults: boolean = true): Record<string, any> {
	const qs: Record<string, any> = {};
	
	if (searchCriteria.filterGroups) {
		const filterGroups = searchCriteria.filterGroups.filterGroupValues || [];
		filterGroups.forEach((group: any, groupIndex: number) => {
			if (group.filters && group.filters.filterValues) {
				const filters = group.filters.filterValues;
				filters.forEach((filter: any, filterIndex: number) => {
					if (filter.field && filter.conditionType) {
						// Magento uses snake_case in the API: filter_groups not filterGroups
						const baseKey = `searchCriteria[filter_groups][${groupIndex}][filters][${filterIndex}]`;
						qs[`${baseKey}[field]`] = filter.field;
						qs[`${baseKey}[condition_type]`] = filter.conditionType;
						// Always include value if condition requires it (eq, neq, gt, gteq, lt, lteq, like, in, nin)
						// For null/notnull conditions, value is optional
						const requiresValue = !['null', 'notnull'].includes(filter.conditionType);
						if (requiresValue) {
							// Only include value if it's actually provided (not undefined, null, or empty string)
							if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
								qs[`${baseKey}[value]`] = String(filter.value);
							}
						} else if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
							// For null/notnull, only include if explicitly provided
							qs[`${baseKey}[value]`] = String(filter.value);
						}
					}
				});
			}
		});
	}
	
	if (searchCriteria.sortOrders) {
		const sortOrders = searchCriteria.sortOrders.sortOrderValues || [];
		sortOrders.forEach((sort: any, index: number) => {
			if (sort.field && sort.direction) {
				// Magento uses snake_case: sort_orders not sortOrders
				qs[`searchCriteria[sort_orders][${index}][field]`] = sort.field;
				qs[`searchCriteria[sort_orders][${index}][direction]`] = sort.direction;
			}
		});
	}
	
	// Always include pageSize and currentPage defaults to prevent 400 errors
	// Note: pageSize and currentPage use camelCase (not snake_case like filter_groups)
	if (includeDefaults) {
		qs['searchCriteria[pageSize]'] = searchCriteria.pageSize || 20;
		qs['searchCriteria[currentPage]'] = searchCriteria.currentPage || 1;
	} else {
		// Only include if explicitly provided
		if (searchCriteria.pageSize) {
			qs['searchCriteria[pageSize]'] = searchCriteria.pageSize;
		}
		if (searchCriteria.currentPage) {
			qs['searchCriteria[currentPage]'] = searchCriteria.currentPage;
		}
	}
	
	return qs;
}

/**
 * Helper function to parse JSON from parameter value
 * Handles both string and object inputs, with error handling
 */
export function parseJsonParameter(value: any, paramName: string = 'parameter'): any {
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (error) {
			throw new Error(`Invalid JSON in ${paramName}: ${error instanceof Error ? error.message : String(error)}`);
		}
	}
	return value;
}

/**
 * Helper function to format Magento error messages
 * Magento errors have a format like:
 * {
 *   "message": "The \"%1\" attribute name is invalid. Reset the name and try again.",
 *   "parameters": ["id"]
 * }
 * This function replaces %1, %2, etc. with the actual parameter values
 */
export function formatMagentoError(errorData: any): string {
	if (!errorData) {
		return 'Unknown error';
	}

	// If it's already a string, return it
	if (typeof errorData === 'string') {
		return errorData;
	}

	// If it's an object with message and parameters
	if (errorData.message && Array.isArray(errorData.parameters)) {
		let message = errorData.message;
		// Replace %1, %2, etc. with actual parameter values
		errorData.parameters.forEach((param: any, index: number) => {
			message = message.replace(`%${index + 1}`, String(param));
		});
		return message;
	}

	// If it's an object with just a message
	if (errorData.message) {
		return String(errorData.message);
	}

	// Fallback to JSON stringify
	return JSON.stringify(errorData);
}

/**
 * Helper function to create a preSend hook for JSON body parameters
 * Wraps the JSON data in the specified wrapper key (e.g., 'product', 'customer', 'invoice')
 */
export function createJsonBodyPreSend(wrapperKey: string, paramName: string) {
	return async function (this: any, requestOptions: any) {
		const data = this.getNodeParameter(paramName, 0, '{}');
		const parsed = parseJsonParameter(data, paramName);
		requestOptions.body = JSON.stringify({ [wrapperKey]: parsed });
		return requestOptions;
	};
}

/**
 * Helper function to build REST API URL with optional website code
 */
export function buildMagentoUrl(path: string, websiteCode?: string): string {
	if (websiteCode && websiteCode.trim() !== '') {
		return `/rest/${websiteCode}/V1${path}`;
	}
	return `/rest/V1${path}`;
}

/**
 * Helper function to create a preSend hook for list operations with searchCriteria
 * Handles website code, searchCriteria query building, and query string appending
 */
export function createSearchCriteriaPreSend(path: string) {
	return async function (this: any, requestOptions: any) {
		// Get website code if available
		let websiteCode = '';
		try {
			websiteCode = (this.getNodeParameter('websiteCode', 0) as string) || '';
		} catch (e) {
			// Parameter might not exist, use empty string
			websiteCode = '';
		}
		
		// Update URL with website code if provided
		// Only update if website code is provided, otherwise use the original URL from routing
		if (websiteCode && websiteCode.trim() !== '') {
			requestOptions.url = buildMagentoUrl(path, websiteCode);
		} else {
			// Ensure path starts with /rest/V1 if not already set
			if (!requestOptions.url || requestOptions.url.startsWith('/rest/')) {
				requestOptions.url = buildMagentoUrl(path);
			}
		}
		
		// Get and build searchCriteria query
		let searchCriteria: any = {};
		try {
			searchCriteria = (this.getNodeParameter('searchCriteria', 0) as any) || {};
		} catch (e) {
			// Parameter might not exist, use empty object
			searchCriteria = {};
		}
		const qs = buildSearchCriteriaQuery(searchCriteria || {}, true);
		
		// Merge with existing query parameters
		const existingQs = requestOptions.qs || {};
		const allQs = { ...existingQs, ...qs };
		
		// Build query string manually to preserve bracket notation
		// n8n's httpRequest may not handle bracket notation in qs object correctly
		const queryParts: string[] = [];
		for (const [key, value] of Object.entries(allQs)) {
			queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
		}
		
		// Append to URL instead of using qs parameter to avoid double encoding
		if (queryParts.length > 0) {
			const separator = requestOptions.url?.includes('?') ? '&' : '?';
			requestOptions.url = (requestOptions.url || '') + separator + queryParts.join('&');
			// Remove qs to avoid double encoding
			delete requestOptions.qs;
		}
		
		return requestOptions;
	};
}

/**
 * Helper function to fetch store view codes from Magento API
 * Uses /V1/store/storeViews endpoint to get all store views with their codes
 * Store view codes are used in the URL path like /rest/{storeViewCode}/V1/...
 */
export async function loadWebsiteCodes(this: ILoadOptionsFunctions): Promise<Array<{ name: string; value: string }>> {
	try {
		const credentials = await this.getCredentials('magento2Api');
		const baseUrl = (credentials.host || credentials.domain || '') as string;
		const accessToken = credentials.accessToken as string;

		if (!baseUrl || !accessToken) {
			console.warn('[Magento REST] Missing credentials for loadWebsiteCodes, returning defaults');
			return [
				{
					name: 'Default (no code)',
					value: '',
				},
				{
					name: 'All Stores',
					value: 'all',
				},
			];
		}

		// Ensure baseUrl doesn't end with a slash
		const cleanBaseUrl = baseUrl.replace(/\/$/, '');

		const options = {
			method: 'GET' as const,
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			url: `${cleanBaseUrl}/rest/V1/store/storeViews`,
			json: true,
		};

		const response = await this.helpers.httpRequest(options);
		
		// Build options array from store views
		const websiteOptions: Array<{ name: string; value: string }> = [
			{
				name: 'Default (no code)',
				value: '',
			},
			{
				name: 'All Stores',
				value: 'all',
			},
		];

		// Add store views from API response
		// Magento API returns an array of store views
		// Each store view has: id, code, name, etc.
		if (Array.isArray(response)) {
			response.forEach((storeView: any) => {
				// Store views have a 'code' field which is the store view code
				// Skip admin store views (id: 0) as they're not typically used for API calls
				if (storeView.code && storeView.id !== 0) {
					const displayName = storeView.name 
						? `${storeView.name} (${storeView.code})`
						: storeView.code;
					websiteOptions.push({
						name: displayName,
						value: storeView.code,
					});
				}
			});
		} else if (response && typeof response === 'object') {
			// Handle case where response might be wrapped in an object
			const items = (response as any).items || (response as any).data || [];
			if (Array.isArray(items)) {
				items.forEach((storeView: any) => {
					if (storeView.code && storeView.id !== 0) {
						const displayName = storeView.name 
							? `${storeView.name} (${storeView.code})`
							: storeView.code;
						websiteOptions.push({
							name: displayName,
							value: storeView.code,
						});
					}
				});
			}
		}

		return websiteOptions;
	} catch (error) {
		// Log error for debugging but don't throw - return defaults instead
		console.warn('[Magento REST] Failed to load store view codes:', error instanceof Error ? error.message : String(error));
		
		// If API call fails, return default options
		// This allows the node to still work even if the API is unavailable
		return [
			{
				name: 'Default (no code)',
				value: '',
			},
			{
				name: 'All Stores',
				value: 'all',
			},
			{
				name: 'Default Store',
				value: 'default',
			},
		];
	}
}

/**
 * Common "Simplify Output" option field
 * When enabled, flattens Magento responses for easier use
 */
export const simplifyOutputField: INodeProperties = {
	displayName: 'Simplify Output',
	name: 'simplifyOutput',
	type: 'boolean',
	default: false,
	description: 'When enabled, flattens the response structure. Converts custom_attributes array to an object, flattens extension_attributes, and simplifies nested structures.',
};

/**
 * Common website code field for Magento multi-store support
 * Actually uses store view codes (not website codes) for the URL path
 * Dynamically loads store view codes from Magento API, but allows custom values
 */
export const websiteCodeField: INodeProperties = {
	displayName: 'Store View Code',
	name: 'websiteCode',
	type: 'options',
	default: '',
	description: 'Store view code for multi-store Magento instances (used in URL like /rest/{code}/V1/...). Options are loaded from your Magento store, but you can enter any custom store view code.',
	typeOptions: {
		loadOptionsMethod: 'loadWebsiteCodes',
		allowCustomValue: true,
	},
	options: [
		{
			name: 'Default (no code)',
			value: '',
		},
		{
			name: 'All Stores',
			value: 'all',
		},
	],
};

/**
 * Helper function to sanitize SKU by removing surrounding quotes
 */
function sanitizeSku(sku: any): any {
	if (typeof sku === 'string') {
		return sku.replace(/^"+|"+$/g, '');
	}
	return sku;
}

/**
 * Helper function to flatten custom_attributes array into an object
 * Converts [{attribute_code: "name", value: "Product Name"}, ...] 
 * to {name: "Product Name", ...}
 */
function flattenCustomAttributes(attributesArray: any[]): Record<string, any> {
	if (!Array.isArray(attributesArray)) {
		return {};
	}

	const attributes: Record<string, any> = {};
	attributesArray.forEach((attr) => {
		const code = attr.attribute_code?.replace(/^"+|"+$/g, '');
		if (code) {
			attributes[code] = attr.value;
		}
	});
	return attributes;
}

/**
 * Helper function to flatten extension_attributes to top level with prefix
 */
function flattenExtensionAttributes(data: any): any {
	if (!data.extension_attributes || typeof data.extension_attributes !== 'object') {
		return data;
	}

	const flattened = { ...data };
	Object.keys(data.extension_attributes).forEach((key) => {
		flattened[`extension_${key}`] = data.extension_attributes[key];
	});
	delete flattened.extension_attributes;
	return flattened;
}

/**
 * Helper function to flatten product_links by grouping by link_type
 */
function flattenProductLinks(productLinks: any[]): Record<string, string[]> {
	if (!Array.isArray(productLinks)) {
		return {};
	}

	return productLinks.reduce(
		(acc, link) => {
			if (!acc[link.link_type]) {
				acc[link.link_type] = [];
			}
			acc[link.link_type].push(link.linked_product_sku);
			return acc;
		},
		{} as Record<string, string[]>
	);
}

/**
 * Helper function to simplify media_gallery_entries to images array
 */
function simplifyMediaGallery(mediaGalleryEntries: any[]): any[] {
	if (!Array.isArray(mediaGalleryEntries)) {
		return [];
	}

	return mediaGalleryEntries.map((entry, index) => ({
		url: entry.file,
		roles: entry.types || [],
		position: entry.position || index + 1,
		id: entry.id,
		disabled: entry.disabled || false,
	}));
}

/**
 * Helper function to flatten/simplify Magento API responses
 * Makes the response structure more user-friendly by:
 * - Flattening custom_attributes array to object
 * - Flattening extension_attributes to top level
 * - Simplifying product_links structure
 * - Simplifying media_gallery_entries
 * - Sanitizing SKU values
 */
export function flattenResponse(data: any, resource: string): any {
	if (!data || typeof data !== 'object') {
		return data;
	}

	// Handle arrays (list responses)
	if (Array.isArray(data)) {
		return data.map((item) => flattenResponse(item, resource));
	}

	// Handle list responses wrapped in items
	if (data.items && Array.isArray(data.items)) {
		return {
			...data,
			items: data.items.map((item: any) => flattenResponse(item, resource)),
		};
	}

	// Clone the object to avoid mutating the original
	const flattened = { ...data };

	// Sanitize SKU if present
	if (flattened.sku !== undefined) {
		flattened.sku = sanitizeSku(flattened.sku);
	}

	// Flatten custom_attributes (common across resources)
	if (Array.isArray(flattened.custom_attributes)) {
		flattened.attributes = flattenCustomAttributes(flattened.custom_attributes);
		delete flattened.custom_attributes;
	}

	// Flatten extension_attributes
	const withExtensionFlattened = flattenExtensionAttributes(flattened);
	// Merge the flattened extension attributes back into the main object
	Object.assign(flattened, withExtensionFlattened);

	// Product-specific transformations
	if (resource === 'product') {
		// Flatten product_links
		if (Array.isArray(flattened.product_links)) {
			flattened.product_links = flattenProductLinks(flattened.product_links);
		}

		// Simplify media_gallery_entries
		if (Array.isArray(flattened.media_gallery_entries)) {
			flattened.images = simplifyMediaGallery(flattened.media_gallery_entries);
			delete flattened.media_gallery_entries;
		}
	}

	return flattened;
}

/**
 * Common searchCriteria fields that can be reused across resources
 */
export const commonSearchCriteriaFields: any[] = [
	{
		displayName: 'Search Criteria',
		name: 'searchCriteria',
		type: 'collection',
		default: {},
		description: 'Build searchCriteria for filtering, sorting, and pagination',
		options: [
			{
				displayName: 'Filter Groups',
				name: 'filterGroups',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Filter groups (AND logic between groups, OR logic within groups)',
				options: [
					{
						displayName: 'Filter Group',
						name: 'filterGroupValues',
						values: [
							{
								displayName: 'Filters',
								name: 'filters',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								description: 'Filters within this group (OR logic)',
								options: [
									{
										displayName: 'Filter',
										name: 'filterValues',
										values: [
											{
												displayName: 'Field',
												name: 'field',
												type: 'string',
												required: true,
												default: '',
												description: 'Field to filter on',
											},
											{
												displayName: 'Condition',
												name: 'conditionType',
												type: 'options',
												required: true,
												default: 'eq',
												options: [
													{ name: 'Equals', value: 'eq' },
													{ name: 'Not Equals', value: 'neq' },
													{ name: 'Greater Than', value: 'gt' },
													{ name: 'Greater Than or Equal', value: 'gteq' },
													{ name: 'Less Than', value: 'lt' },
													{ name: 'Less Than or Equal', value: 'lteq' },
													{ name: 'Like', value: 'like' },
													{ name: 'In', value: 'in' },
													{ name: 'Not In', value: 'nin' },
													{ name: 'Not Null', value: 'notnull' },
													{ name: 'Null', value: 'null' },
												],
											},
											{
												displayName: 'Value',
												name: 'value',
												type: 'string',
												default: '',
												description: 'Filter value',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Sort Orders',
				name: 'sortOrders',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Sort orders',
				options: [
					{
						displayName: 'Sort Order',
						name: 'sortOrderValues',
						values: [
							{
								displayName: 'Field',
								name: 'field',
								type: 'string',
								required: true,
								default: '',
								description: 'Field to sort by',
							},
							{
								displayName: 'Direction',
								name: 'direction',
								type: 'options',
								required: true,
								default: 'ASC',
								options: [
									{ name: 'Ascending', value: 'ASC' },
									{ name: 'Descending', value: 'DESC' },
								],
							},
						],
					},
				],
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				description: 'Number of results per page',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Current Page',
				name: 'currentPage',
				type: 'number',
				default: 1,
				description: 'Current page number',
				typeOptions: {
					minValue: 1,
				},
			},
		],
	},
];
