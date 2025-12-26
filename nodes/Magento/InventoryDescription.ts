import type { INodeProperties } from 'n8n-workflow';
import { parseJsonParameter } from './helpers';

export const inventoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['inventory'],
			},
		},
		default: 'updateStock',
		options: [
			{
				name: 'Update Stock',
				value: 'updateStock',
				action: 'Update product stock levels',
				routing: {
					request: {
						method: 'PUT',
						url: '/rest/V1/products/:sku/stockItems/:itemId',
						qs: {},
					},
				},
			},
			{
				name: 'Get Stock',
				value: 'getStock',
				action: 'Get stock information for a product',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/rest/V1/stockItems/" + $parameter["sku"]}}',
						qs: {},
					},
				},
			},
		],
	},
];

export const inventoryFields: INodeProperties[] = [
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		required: true,
		default: '',
		description: 'Product SKU',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['updateStock', 'getStock'],
			},
		},
	},
	{
		displayName: 'Stock Item ID',
		name: 'itemId',
		type: 'number',
		required: true,
		default: 1,
		description: 'Stock item ID (usually 1)',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['updateStock'],
			},
		},
	},
	{
		displayName: 'Stock Data',
		name: 'stockData',
		type: 'json',
		required: true,
		default: '',
		description: 'Stock data in JSON format',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['updateStock'],
			},
		},
		routing: {
			send: {
				preSend: [
					async function (this, requestOptions) {
						const sku = this.getNodeParameter('sku', 0) as string;
						const itemId = this.getNodeParameter('itemId', 0) as number;
						const stockData = this.getNodeParameter('stockData', 0);
						const stockItem = parseJsonParameter(stockData, 'stockData');
						
						// Update URL with actual SKU and itemId
						requestOptions.url = `/rest/V1/products/${sku}/stockItems/${itemId}`;
						requestOptions.body = JSON.stringify({ stockItem });
						return requestOptions;
					}
				],
			},
		},
	},
];

