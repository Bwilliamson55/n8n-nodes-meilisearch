import type { INodeProperties } from 'n8n-workflow';

export const keysOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['keys'],
			},
		},
		default: 'getKeys',
		options: [
			{
				name: 'Create An API Key',
				value: 'createKey',
				action: 'Create a new key',
				routing: {
					request: {
						method: 'POST',
						url: '/keys',
						qs: {},
						body: {},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const indexes = this.getNodeParameter('indexes') as string
								const indexesArr = indexes.replace(/\s/g, '').split(',')
								const body = {
									name: this.getNodeParameter('name'),
									description: this.getNodeParameter('description'),
									actions: this.getNodeParameter('actions'),
									indexes: indexesArr,
									expiresAt: this.getNodeParameter('expiresAt'),
								}
								requestOptions.body = JSON.stringify(body)
								return requestOptions
							}
						]
					}
				},
			},
			{
				name: 'Delete An API Key',
				value: 'deleteKey',
				action: 'Delete a key by its uid or key',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/keys/" + $parameter["uid"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'Get An API Key',
				value: 'getKey',
				action: 'Get a single key by its uid or key',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/keys/" + $parameter["uid"]}}',
						qs: {},
					},
				},
			},
			{
				name: 'Get API Keys',
				value: 'getKeys',
				action: 'Get many api keys',
				description: 'Returns the 20 most recently created keys in a results array expired keys are included in the response but deleted keys are not',
				routing: {
					request: {
						method: 'GET',
						url: '/keys',
						qs: {},
					},
				},
			},
			{
				name: 'Update An API Key',
				value: 'updateKey',
				action: 'Update a key by its uid or key',
				routing: {
					request: {
						method: 'PATCH',
						url: '={{"/keys/" + $parameter["uid"]}}',
						qs: {},
						body: {
							name: '={{$parameter["name"]}}',
							description: '={{$parameter["description"]}}',
						},
					},
				},
			},
		],
	},
];

export const getKeyFields: INodeProperties[] = [
	{
		displayName: 'UID',
		name: 'uid',
		placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
		description: 'UID or Key of the key',
		required: true,
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['getKey', 'deleteKey', 'updateKey'],
			},
		},
	},
];

export const updateKeyFields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		placeholder: 'My Key',
		description: 'Name of the key',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['updateKey', 'createKey'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		placeholder: 'My Key',
		description: 'Description of the key',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['updateKey', 'createKey'],
			},
		},
	},
];

export const createKeyFields: INodeProperties[] = [
	{
		displayName: 'Actions',
		name: 'actions',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey'],
			},
		},
		default: [],
		description:
			'An array of API actions permitted for the key, represented as strings. API actions are only possible on authorized indexes. ["*"] for all actions.',
		placeholder: 'Add action',
		hint: 'If you want to add all actions, use * alone, or after SOME action types, eg documents.*',
		options: [
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-containing-star
				name: 'All (*)',
				value: '*',
			},
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-containing-star
				name: 'documents.*',
				value: 'documents.*',
			},
			{
				name: 'documents.add',
				value: 'documents.add',
			},
			{
				name: 'documents.delete',
				value: 'documents.delete',
			},
			{
				name: 'documents.get',
				value: 'documents.get',
			},
			{
				name: 'dumps.create',
				value: 'dumps.create',
			},
			{
				name: 'indexes.*',
				value: 'indexes.*',
			},
			{
				name: 'indexes.create',
				value: 'indexes.create',
			},
			{
				name: 'indexes.delete',
				value: 'indexes.delete',
			},
			{
				name: 'indexes.get',
				value: 'indexes.get',
			},
			{
				name: 'indexes.swap',
				value: 'indexes.swap',
			},
			{
				name: 'indexes.update',
				value: 'indexes.update',
			},
			{
				name: 'keys.create',
				value: 'keys.create',
			},
			{
				name: 'keys.delete',
				value: 'keys.delete',
			},
			{
				name: 'keys.get',
				value: 'keys.get',
			},
			{
				name: 'keys.update',
				value: 'keys.update',
			},
			{
				name: 'Search',
				value: 'search',
			},
			{
				name: 'settings.*',
				value: 'settings.*',
			},
			{
				name: 'settings.get',
				value: 'settings.get',
			},
			{
				name: 'settings.update',
				value: 'settings.update',
			},
			{
				name: 'stats.getresponse',
				value: 'stats.getresponse',
			},
			{
				name: 'tasks.*',
				value: 'tasks.*',
			},
			{
				name: 'tasks.cancel',
				value: 'tasks.cancel',
			},
			{
				name: 'tasks.delete',
				value: 'tasks.delete',
			},
			{
				name: 'tasks.get',
				value: 'tasks.get',
			},
			{
				name: 'Version',
				value: 'version',
			},
		],
	},
	{
		displayName: 'Index UIDs',
		required: true,
		name: 'indexes',
		description: 'Comma delimited list of Index UID(s) to give access to',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey'],
			},
		},
	},
	{
		displayName: 'Expires At',
		name: 'expiresAt',
		description: 'Date and time when the key will expire, represented in RFC 3339 format. null if the key never expires.',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey'],
			},
		},
	},
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for the task to complete before returning. If enabled, the node will poll the task status until it succeeds, fails, or is canceled.',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
			},
		},
	},
	{
		displayName: 'Use Exponential Backoff',
		name: 'useExponentialBackoff',
		type: 'boolean',
		default: true,
		description: 'If enabled, the polling interval will gradually increase to reduce API calls. If disabled, uses a fixed polling interval.',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
				waitForCompletion: [true],
			},
		},
	},
	{
		displayName: 'Polling Interval (ms)',
		name: 'pollingInterval',
		type: 'number',
		typeOptions: {
			minValue: 100,
			maxValue: 10000,
		},
		default: 500,
		description: 'Fixed interval between polling requests in milliseconds (used when exponential backoff is disabled)',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
				waitForCompletion: [true],
				useExponentialBackoff: [false],
			},
		},
	},
	{
		displayName: 'Initial Polling Interval (ms)',
		name: 'pollingInterval',
		type: 'number',
		typeOptions: {
			minValue: 100,
			maxValue: 10000,
		},
		default: 500,
		description: 'Starting interval between polling requests in milliseconds. The interval increases by 1.5x every 5 attempts',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
				waitForCompletion: [true],
				useExponentialBackoff: [true],
			},
		},
	},
	{
		displayName: 'Max Polling Interval (ms)',
		name: 'maxPollingInterval',
		type: 'number',
		typeOptions: {
			minValue: 1000,
			maxValue: 30000,
		},
		default: 5000,
		description: 'Maximum interval between polling requests. Exponential backoff will not exceed this value',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
				waitForCompletion: [true],
				useExponentialBackoff: [true],
			},
		},
	},
	{
		displayName: 'Timeout (seconds)',
		name: 'timeout',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 3600,
		},
		default: 300,
		description: 'Maximum time to wait for task completion in seconds (default: 5 minutes)',
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['createKey', 'updateKey', 'deleteKey'],
				waitForCompletion: [true],
			},
		},
	},
];

export const getKeysFields: INodeProperties[] = [
	{
		displayName: 'Additional Fields',
		noDataExpression: true,
		name: 'additionalFields',
		placeholder: 'Add Field',
		description: 'Additional fields to add',
		type: 'collection',
		default: {},
		displayOptions: {
			show: {
				resource: ['keys'],
				operation: ['getKeys'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				description: 'Max number of results to return',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				routing: {
					request: {
						qs: {
							limit: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Offset',
				name: 'offset',
				description: 'Number of results to skip',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				routing: {
					request: {
						qs: {
							offset: '={{$value}}',
						},
					},
				},
			},
		],
	},
];
