import type { INodeProperties } from 'n8n-workflow';
import { applyOptionalSearchQueryFields } from './searchQueryApply';
import { buildWaitForMeiliTaskFields } from './waitPollFields';

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
			{
				name: 'Multi-Search',
				value: 'multiSearch',
				action: 'Search multiple indexes',
				description: 'Perform multiple searches across different indexes in a single request',
				routing: {
					request: {
						method: 'POST',
						url: '/multi-search',
						qs: {},
						body: {},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const queries = this.getNodeParameter('queries') as { queriesValues: Array<{ indexUid: string; query: string; [key: string]: any }> };
								const queriesArray = queries?.queriesValues || [];
								
								// Build the multi-search request body
								const multiSearchQueries = queriesArray.map((queryConfig) => {
									const searchQuery: Record<string, unknown> = {
										indexUid: queryConfig.indexUid,
										q: queryConfig.query || '',
									};
									applyOptionalSearchQueryFields(searchQuery, queryConfig as Record<string, unknown>);
									return searchQuery;
								});
								
								requestOptions.body = JSON.stringify({ queries: multiSearchQueries });
								// Ensure Content-Type header is set for JSON body
								requestOptions.headers = {
									...requestOptions.headers,
									'Content-Type': 'application/json',
								};
								return requestOptions;
							}
						],
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
				name: 'Get Index',
				value: 'getIndex',
				action: 'Get one index by UID',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"]}}',
						qs: {}
					},
				},
			},
			{
				name: 'Delete Index',
				value: 'deleteIndex',
				action: 'Delete one index',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/indexes/" + $parameter["uid"]}}',
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
						url: '/indexes',
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
					minValue: 0,
				},
				default: 0,
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

export const multiSearchFields: INodeProperties[] = [
	{
		displayName: 'Queries',
		name: 'queries',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Query',
		default: {},
		description: 'Array of search queries to execute',
		displayOptions: {
			show: {
				resource: ['search'],
				operation: ['multiSearch'],
			},
		},
		options: [
			{
				displayName: 'Query',
				name: 'queriesValues',
				values: [
					{
						displayName: 'Index UID',
						name: 'indexUid',
						type: 'options',
						required: true,
						default: '',
						description: 'The UID of the index to search',
						typeOptions: {
							loadOptions: {
								routing: {
									request: {
										method: 'GET',
										url: '/indexes',
									},
									output: {
										postReceive: [
											{
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
						displayName: 'Search Query',
						name: 'query',
						type: 'string',
						required: true,
						default: '',
						description: 'The search query string',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'Number of results to skip',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 20,
						description: 'Max number of results to return',
					},
					{
						displayName: 'Hits Per Page',
						name: 'hitsPerPage',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 20,
						description: 'Max number of results per page',
					},
					{
						displayName: 'Page',
						name: 'page',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Request a specific page of results',
					},
					{
						displayName: 'Filter String',
						name: 'filter',
						type: 'string',
						description: 'Filter query string',
						hint: '(genres = horror OR genres = mystery) AND director = \'Jordan Peele\'',
						default: '',
					},
					{
						displayName: 'Facets String',
						name: 'facets',
						type: 'string',
						description: 'Comma-separated list of facets to display the count of. To get all facets, use *.',
						default: '',
					},
					{
						displayName: 'Attributes To Retrieve',
						name: 'attributesToRetrieve',
						type: 'string',
						description: 'Attributes to display in the returned documents, comma-separated',
						default: '',
					},
					{
						displayName: 'Attributes To Crop',
						name: 'attributesToCrop',
						type: 'string',
						description: 'Attributes whose values have to be cropped, comma-separated',
						default: '',
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
					},
					{
						displayName: 'Crop Marker',
						name: 'cropMarker',
						type: 'string',
						description: 'String marking crop boundaries',
						default: '',
					},
					{
						displayName: 'Attributes To Highlight',
						name: 'attributesToHighlight',
						type: 'string',
						description: 'Highlight matching terms contained in an attribute in this list, comma-separated',
						default: '',
					},
					{
						displayName: 'Highlight Pre Tag',
						name: 'highlightPreTag',
						type: 'string',
						description: 'String inserted at the start of a highlighted term',
						hint: 'Defaults to <em>',
						default: '',
					},
					{
						displayName: 'Highlight Post Tag',
						name: 'highlightPostTag',
						type: 'string',
						description: 'String inserted at the end of a highlighted term',
						hint: 'Defaults to </em>',
						default: '',
					},
					{
						displayName: 'Show Matches Position',
						name: 'showMatchesPosition',
						type: 'boolean',
						default: false,
						description: 'Whether to return matching terms location',
					},
					{
						displayName: 'Sort',
						name: 'sort',
						type: 'string',
						description: 'Attributes to sort by and the direction to sort in, comma-separated',
						hint: 'price:asc,release_date:desc',
						default: '',
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
							},
						],
					},
				],
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
				operation: ['createIndex', 'search', 'indexStats', 'getIndex', 'deleteIndex'],
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
	...buildWaitForMeiliTaskFields({
		resource: ['indexes'],
		operations: ['createIndex', 'swapIndexes', 'deleteIndex'],
	}),
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
					minValue: 0,
				},
				default: 0,
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
