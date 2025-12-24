import {
	NodeOperationError,
	type IExecuteSingleFunctions,
	type IHttpRequestOptions,
	type INodeProperties,
	PreSendAction
} from 'n8n-workflow';

export function validateJSON(json: string | undefined | any): any {
	if (json === undefined || json === null) {
		return undefined;
	}

	// If it's already an object/array, return it as-is (no need to parse)
	if (typeof json === 'object' && json !== null) {
		return json;
	}

	// If it's not a string, return undefined (can't parse non-strings)
	if (typeof json !== 'string') {
		return undefined;
	}

	// Trim whitespace
	const trimmed = json.trim();
	if (trimmed === '') {
		return undefined;
	}

	// Try to parse as JSON
	try {
		return JSON.parse(trimmed);
	} catch (exception) {
		// Return undefined to let the caller handle the error with proper context
		return undefined;
	}
}

function parseAndSetBodyJsonArray(
	parameterName: string,
): PreSendAction {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		if (!requestOptions.body) requestOptions.body = [];

		// Get the parameter value
		const raw = this.getNodeParameter(parameterName);

		// Get primary key field mapping if specified
		const primaryKeyField = this.getNodeParameter('primaryKeyField', '') as string | undefined;

		// Handle case where raw might already be an object/array (from expression evaluation)
		let parsedJson: any;

		if (raw === undefined || raw === null || raw === '') {
			throw new NodeOperationError(
				this.getNode(),
				`The ${parameterName} field is required and cannot be empty.`,
			);
		}

		if (typeof raw === 'string') {
			// It's a string, try to parse it
			parsedJson = validateJSON(raw);
			if (parsedJson === undefined) {
				// Try to get more info about the parse error
				let errorMsg = 'Invalid JSON. Please check your JSON input.';
				let errorPosition = -1;
				try {
					JSON.parse(raw);
				} catch (parseError) {
					const error = parseError as Error;
					errorMsg = `Invalid JSON: ${error.message}`;

					// Try to extract position from error message (format varies by engine)
					const positionMatch = error.message.match(/position (\d+)/i) ||
					                      error.message.match(/at position (\d+)/i) ||
					                      error.message.match(/at (\d+)/i);
					if (positionMatch) {
						errorPosition = parseInt(positionMatch[1], 10);
						const start = Math.max(0, errorPosition - 30);
						const end = Math.min(raw.length, errorPosition + 30);
						const snippet = raw.substring(start, end);
						errorMsg += `\n\nError near position ${errorPosition}:\n...${snippet}...`;

						// Try to highlight the exact position
						if (errorPosition < raw.length) {
							const lineStart = raw.lastIndexOf('\n', errorPosition) + 1;
							const lineEnd = raw.indexOf('\n', errorPosition);
							const line = raw.substring(lineStart, lineEnd === -1 ? raw.length : lineEnd);
							const column = errorPosition - lineStart;
							errorMsg += `\n\nLine context:\n${line}\n${' '.repeat(column)}^`;
						}
					}

					// Add helpful hint
					errorMsg += '\n\nTip: If you\'re using {{ JSON.stringify($json) }}, make sure $json is a valid object.';
					errorMsg += ' If $json is already a string, use {{ $json }} directly instead.';
				}
				throw new NodeOperationError(
					this.getNode(),
					errorMsg,
				);
			}
		} else if (typeof raw === 'object' && raw !== null) {
			// Already parsed (from expression like {{ $json }} where $json is an object)
			parsedJson = raw;
		} else {
			throw new NodeOperationError(
				this.getNode(),
				`Invalid input for ${parameterName}. Expected a JSON string, object, or array, but got ${typeof raw}.`,
			);
		}

		if (parsedJson === undefined || parsedJson === null) {
			throw new NodeOperationError(
				this.getNode(),
				`Invalid JSON for ${parameterName}. The value could not be parsed.`,
			);
		}

		let body: any[] = [];
		if (Array.isArray(parsedJson)) {
			body = parsedJson;
		} else if (typeof parsedJson === 'object') {
			body.push(parsedJson);
		} else {
			throw new NodeOperationError(
				this.getNode(),
				`Invalid JSON for ${parameterName}. Expected a JSON object or array, but got ${typeof parsedJson}.`,
			);
		}

		// If primary key field mapping is specified, validate and transform documents
		// This allows users to map a field in their documents to the index's primary key
		if (primaryKeyField && primaryKeyField.trim() !== '') {
			const primaryKeyFieldName = primaryKeyField.trim();

			// Validate that the specified field exists in all documents
			const missingFieldDocs: number[] = [];
			body.forEach((doc: any, index: number) => {
				if (typeof doc !== 'object' || doc === null || doc[primaryKeyFieldName] === undefined) {
					missingFieldDocs.push(index);
				}
			});

			if (missingFieldDocs.length > 0) {
				throw new NodeOperationError(
					this.getNode(),
					`Primary key field "${primaryKeyFieldName}" is missing in ${missingFieldDocs.length} document(s) (indices: ${missingFieldDocs.join(', ')}). All documents must contain the specified primary key field.`,
				);
			}

			// Get the index UID to fetch the index's primary key
			const indexUid = this.getNodeParameter('uid', '') as string;

			// Fetch the index settings to get the actual primary key field name
			// Only fetch if we need to transform (we'll check after fetching)
			try {
				const credentials = await this.getCredentials('meilisearchApi');
				const MeilisearchApi = (await import('../../credentials/MeilisearchApi.credentials')).MeilisearchApi;
				const credentialType = new MeilisearchApi();
				const indexAuthOptions = await credentialType.authenticate(credentials, {
					method: 'GET',
					url: `/indexes/${indexUid}/settings`,
				});
				const indexSettings = await this.helpers.httpRequest(indexAuthOptions);
				const indexPrimaryKey = (indexSettings as any)?.primaryKey;

				// Only transform if the field names are different
				if (indexPrimaryKey && primaryKeyFieldName !== indexPrimaryKey) {
					// Transform documents: rename the user's field to match the index's primary key
					body = body.map((doc: any) => {
						const transformedDoc = { ...doc };
						// Rename the field to match the index's primary key
						transformedDoc[indexPrimaryKey] = transformedDoc[primaryKeyFieldName];
						// Delete the old field since it's different from the new one
						delete transformedDoc[primaryKeyFieldName];
						return transformedDoc;
					});
				}
				// If primaryKeyFieldName === indexPrimaryKey, no transformation needed
			} catch (error) {
				// If we can't fetch index settings, throw an error since we can't verify/perform the mapping
				throw new NodeOperationError(
					this.getNode(),
					`Could not fetch index settings to perform primary key field mapping: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}

		requestOptions.body = body;
		return requestOptions;
	}
}

export const documentsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['documents'],
			},
		},
		default: 'getMany',
		options: [
			{
				name: 'Add or Replace Documents',
				value: 'addOrReplaceDocuments',
				action: 'Add or replace documents',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents"}}',
						qs: {},
						body: {},
					},
					send: {
						preSend: [parseAndSetBodyJsonArray('documentsJson')],
					}
				},
			},
			{
				name: 'Add or Update Documents',
				value: 'addOrUpdateDocuments',
				action: 'Add or update documents',
				routing: {
					request: {
						method: 'PUT',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents"}}',
						qs: {},
						body: {},
					},
					send: {
						preSend: [parseAndSetBodyJsonArray('documentsJson')],
					}
				},
			},
			{
				name: 'Delete All Document',
				value: 'deleteAllDocuments',
				action: 'Delete all documents in an index',
				routing: {
					request: {
						method: 'DELETE',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents"}}',
						qs: {},
						body: {},
					},
				},
			},
			{
				name: 'Delete Batch of Documents',
				value: 'deleteDocumentsBatch',
				action: 'Delete batch of documents by UID',
				routing: {
					request: {
						method: 'POST',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents/delete-batch"}}',
						qs: {},
						body: {},
					},
					send: {
						preSend: [parseAndSetBodyJsonArray('uids')],
					}
				},
			},
			{
				name: 'Get Documents',
				value: 'getMany',
				action: 'Get documents',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents"}}',
						qs: {},
					},
				},
			},
			{
				name: 'Get One Document',
				value: 'getDocument',
				action: 'Get one document by UID',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents/" + $parameter["documentId"]}}',
						qs: {},
					},
				},
			},
		],
	},
];

export const documentsFields: INodeProperties[] = [
	{
		displayName: 'Index UID',
		name: 'uid',
		description: 'Name of the index',
		type: 'options',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documents'],
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
													name: '={{$responseItem.uid}}',
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
		displayName: 'Primary Key Field',
		name: 'primaryKeyField',
		description: 'The field name in your documents that should be used as the primary key. If your documents use a different field name than the index\'s primary key, specify the field name from your documents here. The node will automatically map it to the index\'s primary key field. Leave empty if your documents already use the correct primary key field name.',
		type: 'string',
		default: '',
		hint: 'Example: If your documents have "product_id" but the index uses "id" as primary key, enter "product_id" here',
		displayOptions: {
			show: {
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
			},
		},
	},
	{
		displayName: 'Document ID',
		name: 'documentId',
		description: 'UId for the document',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documents'],
				operation: ['getDocument', 'deleteDocument'],
			},
		},
	},
	{
		displayName: 'UIDs',
		name: 'uids',
		description: 'Delete a selection of documents based on an array of document IDs',
		hint: 'JSON array of document IDs',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documents'],
				operation: ['deleteDocumentsBatch'],
			},
		},
	},
	{
		displayName: 'Documents JSON',
		name: 'documentsJson',
		description: 'JSON object(s) to add, update, or replace. This must be valid JSON.',
		hint: 'Use {{ $json }} for a single object, {{ JSON.stringify($json) }} for stringified JSON, or {{ JSON.stringify($input.all().map(j => j.json)) }} for multiple items',
		type: 'string',
		default: '',
		required: true,
		typeOptions: {
			rows: 4,
		},
		displayOptions: {
			show: {
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
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
				resource: ['documents'],
				operation: ['addOrReplaceDocuments', 'addOrUpdateDocuments'],
				waitForCompletion: [true],
			},
		},
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'string',
		description:
			'Comma-separated list of fields to display for an API resource. By default it contains all fields of an API resource.',
		default: '*',
		displayOptions: {
			show: {
				resource: ['documents'],
				operation: ['getDocument'],
			},
		},
		routing: {
			request: {
				qs: {
					fields: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
];
export const documentsAdditionalFields: INodeProperties[] = [
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
				resource: ['documents'],
				operation: ['getMany'],
			},
		},
		options: [
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
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'string',
				description:
					'Comma-separated list of fields to display for an API resource. By default it contains all fields of an API resource.',
				default: '*',
				routing: {
					request: {
						qs: {
							fields: '={{$value.replaceAll(" ", "")}}',
						},
					},
				},
			},
			{
				displayName: 'Filter',
				name: 'filter',
				type: 'string',
				description: 'Filter query string to filter documents',
				hint: '(genres = horror OR genres = mystery) AND director = \'Jordan Peele\'',
				default: '',
				routing: {
					request: {
						qs: {
							filter: '={{$value}}',
						},
					},
				},
			},
		],
	},
];
