import type { INodeProperties } from 'n8n-workflow';

export const storeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['store'],
			},
		},
		default: 'getStoreGroups',
		options: [
			{
				name: 'Get Store Groups',
				value: 'getStoreGroups',
				action: 'Get store groups',
				description: 'Get all store groups (contains website codes)',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/store/storeGroups',
						qs: {},
					},
				},
			},
			{
				name: 'Get Store Views',
				value: 'getStoreViews',
				action: 'Get store views',
				description: 'Get all store views',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/store/storeViews',
						qs: {},
					},
				},
			},
			{
				name: 'Get Websites',
				value: 'getWebsites',
				action: 'Get websites',
				description: 'Get all websites',
				routing: {
					request: {
						method: 'GET',
						url: '/rest/V1/store/websites',
						qs: {},
					},
				},
			},
		],
	},
];

export const storeFields: INodeProperties[] = [
	// No additional fields needed for store operations
];

