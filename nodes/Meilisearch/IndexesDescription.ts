import type {
	INodeProperties
} from 'n8n-workflow';

export const searchOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		default: 'search',
		options: [
			{
				name: 'Search Index',
				value: 'search',
				action: 'Search index',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/indexes/" + $parameter["uid"] + "/search"}}',
						qs: {}
					},
				},
			},
		],
	}
];

export const indexesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['indexes'],
			},
		},
		default: 'listIndexes',
		options: [
			{
				name: 'Get Stats of an Index',
				value: 'indexStats',
				action: 'Get stats of an index',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"] + "/stats"}}',
						qs: {}
					},
				},
			},
			{
				name: 'List Indexes',
				value: 'listIndexes',
				action: 'List indexes',
				routing: {
					request: {
						method: 'GET',
						url: '/indexes',
						qs: {}
					},
				},
			},
			{
				name: 'Search Index',
				value: 'search',
				action: 'Search index',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/indexes/" + $parameter["uid"] + "/search"}}',
						qs: {}
					},
				},
			},
			{
				name: 'Swap Indexes',
				value: 'swapIndexes',
				description: 'Swap the documents settings and task history of two or more indexes you can only swap indexes in pairs however a single request can swap as many index pairs as you wish swapping indexes is an atomic transaction either all indexes are successfully swapped or none are',
				action: 'Swap indexes',
				routing: {
					request: {
						method: 'POST',
						url: '/swap-indexes',
						qs: {},
						body: '',
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const pairs = this.getNodeParameter('indexPairs') as { 'indexPairsValues': {'uid1': string, 'uid2': string}[]}
								const payload = pairs?.indexPairsValues?.map(value => {return {"indexes": [value.uid1, value.uid2]}})
								requestOptions.body = JSON.stringify(payload)
								return requestOptions
							}
						],
					},
				},
			},
			{
				name: 'Create Index',
				value: 'createIndex',
				action: 'Create an index',
				routing: {
					request: {
						method: 'POST',
						url: 'indexes',
						qs: {},
						body: {
							"uid": '={{$parameter["uid"]}}',
							"primaryKey": '={{$parameter["primaryKey"]}}',
						},
					},
				},
			},
		],
	},
];

export const searchFields: INodeProperties[] = [
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
				resource: ['indexes', 'search'],
				operation: ['search'],
			},
		},
		options: [
			{
				displayName: 'Search Query',
				name: 'query',
				description: 'Query String',
				type: 'string',
				default: '',
				routing: {
					request: {
						body: {
							q: '={{$value}}',
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
						body: {
							offset: '={{$value}}',
						},
					},
				},
			},
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
						body: {
							limit: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Hits Per Page',
				name: 'hitsPerPage',
				description: 'Max number of results per page',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				routing: {
					request: {
						body: {
							hitsPerPage: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Page',
				name: 'page',
				description: 'Request a specific page of results',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				routing: {
					request: {
						body: {
							page: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Filter String',
				name: 'filter',
				type: 'string',
				description: 'Filter query string',
				hint: '(genres = horror OR genres = mystery) AND director = \'Jordan Peele\'',
				default: '',
				routing: {
					request: {
						body: {
							filter: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Facets String',
				name: 'facets',
				type: 'string',
				description: 'Comma-separated list of facets to display the count of. To get all facets, use *.',
				default: '',
				routing: {
					request: {
						body: {
							facets: '={{$value.replaceAll(" ", "").split(",")}}',
						},
					},
				},
			},
			{
				displayName: 'Attributes To Retrieve',
				name: 'attributesToRetrieve',
				type: 'string',
				description: 'Attributes to display in the returned documents, comma-separated',
				default: '',
				routing: {
					request: {
						body: {
							attributesToRetrieve: '={{$value.replaceAll(" ", "").split(",")}}',
						},
					},
				},
			},
			{
				displayName: 'Attributes To Crop',
				name: 'attributesToCrop',
				type: 'string',
				description: 'Attributes whose values have to be cropped, comma-separated',
				default: '',
				routing: {
					request: {
						body: {
							attributesToCrop: '={{$value.replaceAll(" ", "").split(",")}}',
						},
					},
				},
			},
			{
				displayName: 'Crop Length',
				name: 'cropLength',
				description: 'Maximum length of cropped value in words',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 10,
				routing: {
					request: {
						body: {
							cropLength: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Crop Marker',
				name: 'cropMarker',
				type: 'string',
				description: 'String marking crop boundaries',
				default: '',
				routing: {
					request: {
						body: {
							cropMarker: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Attributes To Highlight',
				name: 'attributesToHighlight',
				type: 'string',
				description: 'Highlight matching terms contained in an attribute in this list, comma-separated',
				default: '',
				routing: {
					request: {
						body: {
							attributesToHighlight: '={{$value.replaceAll(" ", "").split(",")}}',
						},
					},
				},
			},
			{
				displayName: 'Highlight Pre Tag',
				name: 'highlightPreTag',
				type: 'string',
				description: 'String inserted at the start of a highlighted term',
				hint: 'Defaults to <em>',
				default: '',
				routing: {
					request: {
						body: {
							highlightPreTag: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Highlight Post Tag',
				name: 'highlightPostTag',
				type: 'string',
				description: 'String inserted at the end of a highlighted term',
				hint: 'Defaults to </em>',
				default: '',
				routing: {
					request: {
						body: {
							highlightPostTag: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Show Matches Position',
				name: 'showMatchesPosition',
				type: 'boolean',
				default: false,
				description: 'Whether to return matching terms location',
				routing: {
					request: {
						body: {
							showMatchesPosition: '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'string',
				description: 'Attributes to sort by and the direction to sort in, comma-separated',
				hint: 'price:asc,release_date:desc',
				default: '',
				routing: {
					request: {
						body: {
							sort: '={{$value.replaceAll(" ", "").split(",")}}',
						},
					},
				},
			},
			{
				displayName: 'Matching Strategy',
				name: 'matchingStrategy',
				type: 'options',
				description: 'Strategy used to match query terms within documents',
				default: 'last',
				options: [
					{
						name: 'Last',
						value: 'last',
					},
					{
						name: 'All',
						value: 'all',
					}
				],
				routing: {
					request: {
						body: {
							matchingStrategy: '={{$value}}',
						},
					},
				},
			},
		],
	},
];

export const indexesFields: INodeProperties[] = [
	{
		displayName: 'UID',
		name: 'uid',
		description: 'Name of the index',
		type: 'options',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['indexes', 'search'],
				operation: ['createIndex', 'search', 'indexStats'],
			},
		},
		typeOptions: {
			loadOptions: {
					routing: {
							request: {
									method: 'GET',
									url: '={{"/indexes"}}',
							},
							output: {
									postReceive: [
											{
												// When the returned data is nested under another property
												// Specify that property key
												type: 'rootProperty',
												properties: {
													property: 'results',
												},
											},
											{
												type: 'setKeyValue',
												properties: {
													name: '={{$responseItem.uid}} KeyField:{{$responseItem.primaryKey}}',
													value: '={{$responseItem.uid}}',
												},
											},
											{
													type: 'sort',
													properties: {
															key: 'name',
													},
											},
									],
							},
					},
			},
	},
	},
	{
		displayName: 'Primary Key',
		name: 'primaryKey',
		description: 'Unique attribute of the index',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['indexes'],
				operation: ['createIndex'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
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
				resource: ['indexes'],
				operation: ['createIndex', 'swapIndexes'],
				waitForCompletion: [true],
			},
		},
	},
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
				resource: ['indexes'],
				operation: ['listIndexes'],
			},
		},
		options: [
			{
				displayName: 'Offset',
				name: 'offset',
				description: 'Number of indexes to skip',
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
		],
	},
]

export const swapIndexesFields: INodeProperties[] = [
	{
		displayName: 'Index Pairs',
		name: 'indexPairs',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Index Pair to Swap',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['indexes'],
				operation: ['swapIndexes'],
			},
		},
		options: [
			{
				name: 'indexPairsValues',
				displayName: 'Index Pair',
				values: [
					{
						displayName: 'Index 1 UID',
						name: 'uid1',
						type: 'string',
						description: 'The UID string for the index',
						default: '',
					},
					{
						displayName: 'Index 2 UID',
						name: 'uid2',
						type: 'string',
						description: 'The UID string for the other index',
						default: '',
					},
				],
			},
		],
	},
];
