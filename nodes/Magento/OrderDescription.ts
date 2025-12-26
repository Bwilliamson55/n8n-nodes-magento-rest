import type { INodeProperties } from 'n8n-workflow';
import { commonSearchCriteriaFields, createJsonBodyPreSend, createSearchCriteriaPreSend, websiteCodeField } from './helpers';

export const orderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
		default: 'get',
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get an order',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/rest/V1/orders/" + $parameter["orderId"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'List',
				value: 'list',
				action: 'List orders',
				description: 'Get orders with searchCriteria support',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/orders',
						qs: {},
					},
					send: {
						preSend: [createSearchCriteriaPreSend('/orders')],
					},
				},
			},
			{
				name: 'Create Invoice',
				value: 'createInvoice',
				action: 'Create an invoice for an order',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/rest/V1/order/" + $parameter["orderId"] + "/invoice"}}',
						body: {},
					},
				},
			},
			{
				name: 'Create Shipment',
				value: 'createShipment',
				action: 'Create a shipment for an order',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/rest/V1/order/" + $parameter["orderId"] + "/ship"}}',
						body: {},
					},
				},
			},
			{
				name: 'Cancel',
				value: 'cancel',
				action: 'Cancel an order',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/rest/V1/orders/" + $parameter["orderId"] + "/cancel"}}',
						body: {},
					},
				},
			},
		],
	},
];

export const orderFields: INodeProperties[] = [
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'number',
		required: true,
		default: 0,
		description: 'Order ID',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get', 'createInvoice', 'createShipment', 'cancel'],
			},
		},
	},
	{
		displayName: 'Invoice Data',
		name: 'invoiceData',
		type: 'json',
		default: '{}',
		description: 'Invoice data in JSON format (optional)',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['createInvoice'],
			},
		},
		routing: {
			send: {
				preSend: [createJsonBodyPreSend('invoice', 'invoiceData')],
			},
		},
	},
	{
		displayName: 'Shipment Data',
		name: 'shipmentData',
		type: 'json',
		default: '{}',
		description: 'Shipment data in JSON format (optional)',
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['createShipment'],
			},
		},
		routing: {
			send: {
				preSend: [createJsonBodyPreSend('shipment', 'shipmentData')],
			},
		},
	},
	{
		...commonSearchCriteriaFields[0],
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['list'],
			},
		},
	},
	{
		...websiteCodeField,
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
	},
];

