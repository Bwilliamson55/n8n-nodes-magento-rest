import type { INodeProperties } from 'n8n-workflow';
import { commonSearchCriteriaFields, createJsonBodyPreSend, createSearchCriteriaPreSend, websiteCodeField } from './helpers';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		default: 'get',
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a customer',
				routing: {
					request: {
						method: 'POST',
						url: '/rest/V1/customers',
						body: {},
					},
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a customer',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/rest/V1/customers/" + $parameter["customerId"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update a customer',
				routing: {
					request: {
						method: 'PUT',
						url: '={{"/rest/V1/customers/" + $parameter["customerId"]}}',
						body: {},
					},
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a customer',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/rest/V1/customers/" + $parameter["customerId"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List customers',
				description: 'Get customers with searchCriteria support',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/customers/search',
						qs: {},
					},
					send: {
						preSend: [createSearchCriteriaPreSend('/customers/search')],
					},
				},
			},
		],
	},
];

export const customerFields: INodeProperties[] = [
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Customer ID',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},
	{
		displayName: 'Customer Data',
		name: 'customerData',
		type: 'json',
		required: true,
		default: '',
		description: 'Customer data in JSON format',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create', 'update'],
			},
		},
		routing: {
			send: {
				preSend: [createJsonBodyPreSend('customer', 'customerData')],
			},
		},
	},
	{
		...commonSearchCriteriaFields[0],
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['list'],
			},
		},
	},
	{
		...websiteCodeField,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
	},
];

