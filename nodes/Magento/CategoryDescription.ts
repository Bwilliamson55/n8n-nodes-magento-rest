import type { INodeProperties } from 'n8n-workflow';
import { commonSearchCriteriaFields, createJsonBodyPreSend, createSearchCriteriaPreSend, websiteCodeField, simplifyOutputField } from './helpers';

export const categoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
		default: 'get',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a category',
				routing: {
					request: {
						method: 'POST',
						url: '/rest/V1/categories',
						body: {},
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a category',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/rest/V1/categories/" + $parameter["categoryId"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a category',
				routing: {
					request: {
						method: 'PUT',
						url: '={{"/rest/V1/categories/" + $parameter["categoryId"]}}',
						body: {},
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a category',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/rest/V1/categories/" + $parameter["categoryId"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List categories',
				description: 'Get categories with searchCriteria support',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/categories/list',
						qs: {},
					},
					send: {
						preSend: [createSearchCriteriaPreSend('/categories/list')],
					},
				},
			},
		],
	},
];

export const categoryFields: INodeProperties[] = [
	{
		displayName: 'Category ID',
		name: 'categoryId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Category ID',
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	{
		displayName: 'Category Data',
		name: 'categoryData',
		type: 'json',
		required: true,
		default: '',
		description: 'Category data in JSON format',
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['create', 'update'],
			},
		},
		routing: {
			send: {
				preSend: [createJsonBodyPreSend('category', 'categoryData')],
			},
		},
	},
	{
		...commonSearchCriteriaFields[0],
		displayOptions: {
			show: {
				resource: ['category'],
				operation: ['list'],
			},
		},
	},
	{
		...websiteCodeField,
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
	},
	{
		...simplifyOutputField,
		displayOptions: {
			show: {
				resource: ['category'],
			},
		},
	},
];

