/* eslint-disable n8n-nodes-base/node-param-resource-with-plural-option */
import type {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { productOperations, productFields } from './ProductDescription';
import { categoryOperations, categoryFields } from './CategoryDescription';
import { customerOperations, customerFields } from './CustomerDescription';
import { orderOperations, orderFields } from './OrderDescription';
import { inventoryOperations, inventoryFields } from './InventoryDescription';
import { storeOperations, storeFields } from './StoreDescription';
import { formatMagentoError, loadWebsiteCodes } from './helpers';

export class Magento implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Magento REST',
		name: 'magentoRest',
		icon: 'file:magento2.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Magento REST API',
		defaults: {
			name: 'Magento REST',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'magento2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Product',
						value: 'product',
					},
					{
						name: 'Category',
						value: 'category',
					},
					{
						name: 'Customer',
						value: 'customer',
					},
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Inventory',
						value: 'inventory',
					},
					{
						name: 'Store',
						value: 'store',
					},
				],
				default: 'product',
			},
			...productOperations,
			...productFields,
			...categoryOperations,
			...categoryFields,
			...customerOperations,
			...customerFields,
			...orderOperations,
			...orderFields,
			...inventoryOperations,
			...inventoryFields,
			...storeOperations,
			...storeFields,
		],
	};

	methods = {
		loadOptions: {
			async loadWebsiteCodes(this: ILoadOptionsFunctions) {
				return await loadWebsiteCodes.call(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// For all operations, we need to manually execute routing
		// because having a custom execute function overrides n8n's automatic routing
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Find the routing configuration for this operation
		let routing: any = null;
		
		// Search through operation arrays to find the matching operation
		const allOperations = [
			...productOperations,
			...categoryOperations,
			...customerOperations,
			...orderOperations,
			...inventoryOperations,
			...storeOperations,
		];
		
		for (const opArray of allOperations) {
			if (opArray.name === 'operation' && opArray.displayOptions?.show?.resource?.includes(resource)) {
				const operationOption = (opArray.options as any[])?.find(
					(opt: any) => opt.value === operation
				);
				if (operationOption?.routing) {
					routing = operationOption.routing;
					break;
				}
			}
		}

		if (!routing) {
			// If no routing config, return empty (shouldn't happen for our operations)
			return [[]];
		}
		
		// Execute at least once, even if there are no input items (like HTTP node)
		const itemCount = Math.max(items.length, 1);
		
		for (let i = 0; i < itemCount; i++) {
			try {
				// Build request options from routing config
				const requestConfig = routing.request || {};
				
				// Evaluate URL expression
				let url = requestConfig.url || '';
				if (typeof url === 'string' && url.startsWith('={{') && url.endsWith('}}')) {
					const expr = url.slice(3, -2).trim();
					
					// Extract all $parameter["name"] references
					const paramRegex = /\$parameter\["([^"]+)"\]/g;
					let match;
					let result = expr;
					while ((match = paramRegex.exec(expr)) !== null) {
						const paramName = match[1];
						const paramValue = this.getNodeParameter(paramName, i);
						result = result.replace(match[0], String(paramValue || ''));
					}
					// Remove string concatenation and quotes
					result = result.replace(/["']/g, '').replace(/\s*\+\s*/g, '');
					url = result;
				}

				// Build query string and body
				const qs: Record<string, any> = {};
				let body: Record<string, any> = {};
				
				// Collect query parameters and body parameters from field routing configs
				const allFields = [
					...productFields,
					...categoryFields,
					...customerFields,
					...orderFields,
					...inventoryFields,
				];
				
				// Process fields that have routing configs
				for (const field of allFields) {
					if (field.displayOptions?.show?.resource?.includes(resource) &&
						field.displayOptions?.show?.operation?.includes(operation)) {
						
						if (field.routing?.send?.preSend) {
							// Fields with preSend will handle their own processing
							continue;
						}
						
						// Handle query string parameters
						const routingQs = field.routing?.request?.qs;
						if (routingQs && typeof routingQs === 'object' && !Array.isArray(routingQs)) {
							const fieldValue = this.getNodeParameter(field.name, i);
							if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
								Object.keys(routingQs).forEach((qsKey) => {
									const qsValue = routingQs[qsKey];
									if (typeof qsValue === 'string' && qsValue.includes('$value')) {
										qs[qsKey] = qsValue.replace(/\$value/g, String(fieldValue));
									} else {
										qs[qsKey] = fieldValue;
									}
								});
							}
						}
						
						// Handle body parameters
						const routingBody = field.routing?.request?.body;
						if (routingBody && typeof routingBody === 'object' && !Array.isArray(routingBody) && routingBody !== null) {
							const fieldValue = this.getNodeParameter(field.name, i);
							if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
								const bodyObj = routingBody as Record<string, any>;
								Object.keys(bodyObj).forEach((bodyKey) => {
									const bodyValue = bodyObj[bodyKey];
									if (typeof bodyValue === 'string' && bodyValue.includes('$value')) {
										body[bodyKey] = bodyValue.replace(/\$value/g, String(fieldValue));
									} else {
										body[bodyKey] = fieldValue;
									}
								});
							}
						}
					}
				}
				
				// Merge with requestConfig.body if it exists
				if (requestConfig.body) {
					body = { ...requestConfig.body, ...body };
				}

				// Build initial request options
				let requestOptions: any = {
					method: requestConfig.method || 'GET',
					url: url,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
				};

				// Add query string if we have any
				if (Object.keys(qs).length > 0) {
					requestOptions.qs = qs;
				}

				// Add body if we have content
				if (Object.keys(body).length > 0) {
					requestOptions.body = JSON.stringify(body);
				} else if (requestConfig.body !== undefined) {
					requestOptions.body = requestConfig.body;
				}

				// Execute preSend actions from operation routing
				if (routing.send?.preSend) {
					const singleExecuteContext = {
						...this,
						getNodeParameter: (parameterName: string, fallbackValue?: any) => {
							return this.getNodeParameter(parameterName, i, fallbackValue);
						},
						getNode: () => this.getNode(),
						helpers: this.helpers,
						continueOnFail: () => this.continueOnFail(),
						getCredentials: async (type: string) => {
							return this.getCredentials(type);
						},
					} as unknown as IExecuteSingleFunctions;
					
					for (const preSendAction of routing.send.preSend) {
						requestOptions = await preSendAction.call(singleExecuteContext, requestOptions);
					}
				}

				// Execute preSend actions from field routing configs
				for (const field of allFields) {
					if (field.displayOptions?.show?.resource?.includes(resource) &&
						field.displayOptions?.show?.operation?.includes(operation) &&
						field.routing?.send?.preSend) {
						
						const singleExecuteContext = {
							...this,
							getNodeParameter: (parameterName: string, fallbackValue?: any) => {
								return this.getNodeParameter(parameterName, i, fallbackValue);
							},
							getNode: () => this.getNode(),
							helpers: this.helpers,
							continueOnFail: () => this.continueOnFail(),
							getCredentials: async (type: string) => {
								return this.getCredentials(type);
							},
						} as unknown as IExecuteSingleFunctions;
						
						for (const preSendAction of field.routing.send.preSend) {
							requestOptions = await preSendAction.call(singleExecuteContext, requestOptions);
						}
					}
				}

				// Get credentials - n8n's built-in magento2Api credential handles authentication automatically
				// We need to get the credentials to access the host URL
				const credentials = await this.getCredentials('magento2Api');
				
				// Apply base URL from credentials if not already set
				if (credentials.host && !requestOptions.baseURL) {
					requestOptions.baseURL = (credentials.host as string).replace(/\/$/, '');
				}
				
				// Add authorization header if access token is provided
				if (credentials.accessToken) {
					requestOptions.headers = {
						...requestOptions.headers,
						Authorization: `Bearer ${credentials.accessToken}`,
					};
				}
				
				// Log the full URL with query parameters for troubleshooting searchCriteria
				// Note: The query string is already appended to requestOptions.url by preSend functions
				const baseUrl = requestOptions.baseURL || '';
				const fullUrl = `${baseUrl}${requestOptions.url || ''}`;
				console.log(`[Magento REST] ${requestOptions.method || 'GET'} ${fullUrl}`);
				
				// Make the HTTP request
				const response = await this.helpers.httpRequest(requestOptions);

				// Return the response exactly as the API returns it
				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error: any) {
				// Log detailed error information for troubleshooting
				if (error.response) {
					console.log('[Magento REST] Error Response Status:', error.response.status);
					console.log('[Magento REST] Error Response Data:', JSON.stringify(error.response.data, null, 2));
				} else if (error.message) {
					console.log('[Magento REST] Error Message:', error.message);
				}
				
				if (this.continueOnFail()) {
					// Format Magento error message for user-friendly display
					const errorMessage = error.response?.data 
						? formatMagentoError(error.response.data)
						: (error instanceof Error ? error.message : String(error));
					
					returnData.push({
						json: {
							error: errorMessage,
							statusCode: error.response?.status,
							statusText: error.response?.statusText,
							// Include full error details for debugging if needed
							...(error.response?.data && typeof error.response.data === 'object' 
								? { errorDetails: error.response.data }
								: {}),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				
				// When not continuing on fail, throw a formatted error
				if (error.response?.data) {
					const formattedMessage = formatMagentoError(error.response.data);
					const enhancedError = new Error(formattedMessage);
					(enhancedError as any).response = error.response;
					throw enhancedError;
				}
				
				throw error;
			}
		}

		return [returnData];
	}
}

