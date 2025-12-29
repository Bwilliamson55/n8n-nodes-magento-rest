import type { INodeProperties } from 'n8n-workflow';
import { commonSearchCriteriaFields, createJsonBodyPreSend, createSearchCriteriaPreSend, websiteCodeField, simplifyOutputField } from './helpers';

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		default: 'get',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a product',
				routing: {
					request: {
						method: 'POST',
						url: '/rest/V1/products',
						body: {},
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a product',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/rest/V1/products/" + $parameter["sku"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a product',
				routing: {
					request: {
						method: 'PUT',
						url: '={{"/rest/V1/products/" + $parameter["sku"]}}',
						body: {},
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a product',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/rest/V1/products/" + $parameter["sku"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List products',
				description: 'Get products with searchCriteria support',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/products',
						qs: {},
					},
					send: {
						preSend: [createSearchCriteriaPreSend('/products')],
					},
				},
			},
		],
	},
];

export const productFields: INodeProperties[] = [
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		required: true,
		default: '',
		description: 'Product SKU',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	{
		displayName: 'Product Data',
		name: 'productData',
		type: 'json',
		required: true,
		default: '',
		description: 'Product data in JSON format',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create', 'update'],
			},
		},
		routing: {
			send: {
				preSend: [createJsonBodyPreSend('product', 'productData')],
			},
		},
	},
	{
		...commonSearchCriteriaFields[0],
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['list'],
			},
		},
	},
	{
		...websiteCodeField,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
	},
	{
		...simplifyOutputField,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
	},
];

