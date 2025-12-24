import type { INodeProperties } from 'n8n-workflow';

export const settingsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['settings'],
			},
		},
		default: 'getAll',
		options: [
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-option-name-wrong-for-get-many
				name: 'Get Index Settings',
				value: 'getAll',
				action: 'Get the settings of an index',
				description: 'Get the entire settings object for the index',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"] + "/settings"}}',
						qs: {},
					},
				},
			},
			{
				name: 'Reset Index Settings',
				value: 'resetSettings',
				action: 'Reset the settings of an index',
				description: 'Reset the entire settings object for the index',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/indexes/" + $parameter["uid"] + "/settings"}}',
						qs: {},
					},
				},
			},
			{
				name: 'Update Index Settings',
				value: 'updateSettings',
				action: 'Update the settings of an index',
				description: 'Update the entire settings object for the index',
				hint: 'Passing null to an index setting will reset it to its default value.',
				routing: {
					request: {
						method: 'PATCH',
						url: '={{"/indexes/" + $parameter["uid"] + "/settings"}}',
						qs: {},
						body: {
						},
					},
					send: {
						preSend: [
							async function (this, requestOptions) {
								const synonyms = this.getNodeParameter('synonyms') as { synonymParent: { primaryWord: string, synonymsString: string }[]} | undefined
								const stopWords = this.getNodeParameter('stopWords') as string
								const rankingRules = this.getNodeParameter('rankingRules') as string
								const distinctAttribute = this.getNodeParameter('distinctAttribute') as string
							  const searchableAttributes = this.getNodeParameter('searchableAttributes') as string
								const displayedAttributes = this.getNodeParameter('displayedAttributes') as string
								const filterableAttributes = this.getNodeParameter('filterableAttributes') as string
								const sortableAttributes = this.getNodeParameter('sortableAttributes') as string
								const typoToleranceEnabled = this.getNodeParameter('typoToleranceEnabled') as boolean
								const minWordSizeForOneTypo = this.getNodeParameter('minWordSizeForOneTypo') as number
								const minWordSizeForTwoTypos = this.getNodeParameter('minWordSizeForTwoTypos') as number
								const disableTypoToleranceOnWords = this.getNodeParameter('disableTypoToleranceOnWords') as string
								const disableTypoToleranceOnAttributes = this.getNodeParameter('disableTypoToleranceOnAttributes') as string
								const maxTotalHits = this.getNodeParameter('maxTotalHits') as number
								const maxValuesPerFacet = this.getNodeParameter('maxValuesPerFacet') as number
								const handleStringArrayWithStar = (stringArray: string) => {
									if (stringArray.trim() === '*') {
										return ['*']
									} else if (stringArray.includes(',')) {
										return stringArray.split(',').map(item => item.trim())
									} else {
										return stringArray.trim()
									}
								};
								const buildSynonymObject = (synonyms: { synonymParent: { primaryWord: string, synonymsString: string }[]}) => {
									const synonymObject: { [key: string]: string[] } = {}
									synonyms.synonymParent.forEach(synonym => {
										synonymObject[synonym.primaryWord] = synonym.synonymsString.split(',').map(item => item.trim())
									})
									return synonymObject
								}
								const body = {
									'synonyms': synonyms?.synonymParent ? buildSynonymObject(synonyms) : null,
									'stopWords': stopWords ? handleStringArrayWithStar(stopWords) : null,
									'rankingRules': rankingRules ? handleStringArrayWithStar(rankingRules) : null,
									'distinctAttribute': distinctAttribute ? distinctAttribute : null,
									'searchableAttributes': searchableAttributes ? handleStringArrayWithStar(searchableAttributes) : null,
									'displayedAttributes': displayedAttributes ? handleStringArrayWithStar(displayedAttributes) : null,
									'filterableAttributes': filterableAttributes ? handleStringArrayWithStar(filterableAttributes) : null,
									'sortableAttributes': sortableAttributes ? handleStringArrayWithStar(sortableAttributes) : null,
									'typoTolerance': {
										'enabled': typoToleranceEnabled,
										'minWordSizeForTypos': {
											'oneTypo': minWordSizeForOneTypo,
											'twoTypos': minWordSizeForTwoTypos,
										},
										'disableOnWords': disableTypoToleranceOnWords ? handleStringArrayWithStar(disableTypoToleranceOnWords) : null,
										'disableOnAttributes': disableTypoToleranceOnAttributes ? handleStringArrayWithStar(disableTypoToleranceOnAttributes) : null,
									},
									'pagination': {
										'maxTotalHits': maxTotalHits,
									},
									'faceting': {
										'maxValuesPerFacet': maxValuesPerFacet,
									}
								}
								requestOptions.body = JSON.stringify(body)
								return requestOptions
							}
						],
					}
				},
			},
		],
	},
];

export const settingsFields: INodeProperties[] = [
	{
		displayName: 'UID',
		name: 'uid',
		description: 'Name of the index',
		type: 'options',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['settings'],
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
		displayName: 'Displayed Attributes',
		name: 'displayedAttributes',
		description: 'Fields displayed in the returned documents. If not specified, all fields are displayed.',
		hint: 'field_one, field two, field three',
		type: 'string',
		default: '*',
		required: true,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Distinct Attribute',
		name: 'distinctAttribute',
		description: 'Search returns documents with distinct (different) values of the given field',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Filterable Attributes',
		name: 'filterableAttributes',
		description: 'Fields that can be used in filters. If not specified, no fields are filterable.',
		hint: 'field_one, field two, field three',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Max Values Per Facet',
		name: 'maxValuesPerFacet',
		description: 'Maximum number of facet values to return for each facet during a search',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: 100,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Max Total Hits',
		name: 'maxTotalHits',
		description: 'Maximum number of hits to return for a search',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: 1000,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Ranking Rules',
		name: 'rankingRules',
		description: 'List of ranking rules in order of importance',
		type: 'string',
		default: 'words, typo, proximity, attribute, sort, exactness',
		required: true,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Searchable Attributes',
		name: 'searchableAttributes',
		description: 'Fields in which to search for matching query words sorted by order of importance. Use * for all.',
		hint: 'field_one, field two, field three',
		type: 'string',
		default: '*',
		required: true,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Sortable Attributes',
		name: 'sortableAttributes',
		description: 'Attributes to use when sorting search results',
		hint: 'field_one, field two, field three',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Stop Words',
		name: 'stopWords',
		description: 'List of words ignored by Meilisearch when present in search queries',
		hint: 'to, and, of, the',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Typo Tolerance Enabled',
		name: 'typoToleranceEnabled',
		type: 'boolean',
		default: true,
		description: 'Whether to enable typo tolerance',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Min Word Size For One Typo',
		name: 'minWordSizeForOneTypo',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: 7,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Min Word Size For Two Typos',
		name: 'minWordSizeForTwoTypos',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: 9,
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Disable Typo Tolerance On Words',
		name: 'disableTypoToleranceOnWords',
		description: 'Disable typo tolerance on the given words, comma-separated',
		hint: 'word1, stuff, and, things',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Disable Typo Tolerance On Attributes',
		name: 'disableTypoToleranceOnAttributes',
		description: 'Disable typo tolerance on the given attributes, comma-separated',
		hint: 'attribute_name, other_attribute_name, attribute 3',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
	},
	{
		displayName: 'Synonyms',
		name: 'synonyms',
		placeholder: 'Add Synonym Group',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Synonym',
				name: 'synonymParent',
				values: [
					{
						displayName: 'Primary Word',
						name: 'primaryWord',
						hint: 'wolverine',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Synonyms String',
						name: 'synonymsString',
						hint: 'xmen, logan',
						type: 'string',
						default: '',
					}
				],
			},
		],
	},
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for the task to complete before returning. If enabled, the node will poll the task status until it succeeds, fails, or is canceled.',
		displayOptions: {
			show: {
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
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
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
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
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
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
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
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
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
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
				resource: ['settings'],
				operation: ['updateSettings', 'resetSettings'],
				waitForCompletion: [true],
			},
		},
	},
];
