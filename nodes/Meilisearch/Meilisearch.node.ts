/* eslint-disable n8n-nodes-base/node-param-resource-with-plural-option */
import type {
	IExecuteFunctions,
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { generalFields, generalOperations } from './GeneralDescription';
import {
	tasksOperations,
	getAllTasksFields,
	deleteTasksFields,
	cancelTasksFields,
	getTaskFields,
	waitForTaskFields,
} from './TasksDescription';
import { indexesFields, indexesOperations, multiSearchFields, searchFields, searchOperations, swapIndexesFields } from './IndexesDescription';
import {
	createKeyFields,
	getKeyFields,
	getKeysFields,
	keysOperations,
	updateKeyFields,
} from './KeysDescription';
import { documentsAdditionalFields, documentsFields, documentsOperations } from './DocumentsDescription';
import { settingsFields, settingsOperations } from './SettingsDescription';
import { MeilisearchApi } from '../../credentials/MeilisearchApi.credentials';

// Helper function to wait for task completion
async function waitForTaskCompletion(
	context: IExecuteFunctions,
	taskUid: number,
	itemIndex: number,
	credentials: any,
): Promise<any> {
	const useExponentialBackoff = context.getNodeParameter('useExponentialBackoff', itemIndex, true) as boolean;
	const pollingInterval = (context.getNodeParameter('pollingInterval', itemIndex) as number) || 500;
	const timeoutSeconds = (context.getNodeParameter('timeout', itemIndex) as number) || 300;
	const maxPollingInterval = useExponentialBackoff 
		? ((context.getNodeParameter('maxPollingInterval', itemIndex) as number) || 5000)
		: pollingInterval;

	const credentialType = new MeilisearchApi();
	const startTime = Date.now();
	const timeoutMs = timeoutSeconds * 1000;
	let attemptCount = 0;

	while (true) {
		// Check timeout
		if (Date.now() - startTime > timeoutMs) {
			throw new NodeOperationError(
				context.getNode(),
				`Task ${taskUid} did not complete within ${timeoutSeconds} seconds`,
			);
		}

		// Poll task status
		const taskAuthOptions = await credentialType.authenticate(credentials, {
			method: 'GET',
			url: `/tasks/${taskUid}`,
		});
		const taskResponse = await context.helpers.httpRequest(taskAuthOptions);

		const task = taskResponse as {
			uid: number;
			status: string;
			type: string;
			error?: {
				message: string;
				code: string;
				type: string;
			};
			[index: string]: any;
		};

		// Check if task is complete
		if (task.status === 'succeeded' || task.status === 'failed' || task.status === 'canceled') {
			return task;
		}

		// Calculate wait time based on backoff setting
		let waitTime: number;
		if (useExponentialBackoff) {
			// Exponential backoff: start with pollingInterval, increase by 1.5x every 5 attempts (max 3x multiplier)
			// But never exceed maxPollingInterval
			attemptCount++;
			const exponentialMultiplier = Math.pow(1.5, Math.min(attemptCount / 5, 3));
			const calculatedInterval = pollingInterval * exponentialMultiplier;
			waitTime = Math.min(calculatedInterval, maxPollingInterval);
		} else {
			// Fixed interval: use the same polling interval every time
			waitTime = pollingInterval;
		}

		// Wait before next poll
		await new Promise((resolve) => setTimeout(resolve, waitTime));
	}
}

// Operations that return taskUid and support wait for completion
const OPERATIONS_WITH_TASKUID = {
	documents: ['addOrReplaceDocuments', 'addOrUpdateDocuments', 'deleteDocumentsBatch', 'deleteAllDocuments'],
	indexes: ['createIndex', 'swapIndexes'],
	settings: ['updateSettings', 'resetSettings'],
	keys: ['createKey', 'updateKey', 'deleteKey'],
	general: ['dumps'],
};

export class Meilisearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Meilisearch',
		name: 'meilisearch',
		icon: 'file:meilisearch.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Meilisearch API',
		defaults: {
			name: 'Meilisearch',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'meilisearchApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
			baseURL: '={{$credentials.host_url}}',
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Documents',
						value: 'documents',
					},
					{
						name: 'General',
						value: 'general',
					},
					{
						name: 'Indexes',
						value: 'indexes',
					},
					{
						name: 'Keys',
						value: 'keys',
					},
					{
						name: 'Search',
						value: 'search',
					},
					{
						name: 'Settings',
						value: 'settings',
					},
					{
						name: 'Tasks',
						value: 'tasks',
					},
				],
				default: 'general',
			},
			...generalOperations,
			...generalFields,
			// Tasks
			...tasksOperations,
			...getAllTasksFields,
			...deleteTasksFields,
			...cancelTasksFields,
			...getTaskFields,
			...waitForTaskFields,
			// Indexes and Search
			...indexesOperations,
			...searchOperations,
			...swapIndexesFields,
			...indexesFields,
			...searchFields,
			...multiSearchFields,
			// Keys
			...keysOperations,
			...getKeysFields,
			...getKeyFields,
			...updateKeyFields,
			...createKeyFields,
			// Documents
			...documentsOperations,
			...documentsFields,
			...documentsAdditionalFields,
			// Settings
			...settingsOperations,
			...settingsFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Handle waitForTask operation with custom polling logic
		if (resource === 'tasks' && operation === 'waitForTask') {
			return executeWaitForTask(this);
		}

		// For all other operations, we need to manually execute routing
		// because having a custom execute function overrides n8n's automatic routing
		// We'll use the routing configuration to execute the HTTP request
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Find the routing configuration for this operation
		// Access it directly from the imported operation arrays
		let routing: any = null;
		
		// Search through operation arrays to find the matching operation
		const allOperations = [
			...generalOperations,
			...generalFields,
			...tasksOperations,
			...indexesOperations,
			...searchOperations,
			...keysOperations,
			...documentsOperations,
			...settingsOperations,
		];
		
		for (const opArray of allOperations) {
			if (opArray.name === 'operation' && opArray.displayOptions?.show?.resource?.includes(resource)) {
				const operationOption = (opArray.options as any[])?.find(
					(opt: any) => opt.value === operation
				);
				if (operationOption?.routing) {
					routing = operationOption.routing;
					break;
				}
			}
		}

		if (!routing) {
			// If no routing config, return empty (shouldn't happen for our operations)
			return [[]];
		}
		
		// Execute at least once, even if there are no input items (like HTTP node)
		const itemCount = Math.max(items.length, 1);
		
		for (let i = 0; i < itemCount; i++) {
			try {
				// Build request options from routing config
				const requestConfig = routing.request || {};
				
				// Evaluate URL expression
				let url = requestConfig.url || '';
				if (typeof url === 'string') {
					// Handle n8n template expressions like ={{"/indexes/" + $parameter["uid"] + "/documents"}}
					if (url.startsWith('={{') && url.endsWith('}}')) {
						const expr = url.slice(3, -2).trim();
						
						// Handle "/indexes/" + $parameter["uid"] + "/documents"
						if (expr.includes('"/indexes/" + $parameter["uid"] + "/documents"')) {
							const uid = this.getNodeParameter('uid', i) as string;
							url = `/indexes/${uid}/documents`;
						}
						// Handle "/indexes/" + $parameter["uid"] + "/documents/" + $parameter["documentId"]
						else if (expr.includes('"/indexes/" + $parameter["uid"] + "/documents/" + $parameter["documentId"]')) {
							const uid = this.getNodeParameter('uid', i) as string;
							const docId = this.getNodeParameter('documentId', i) as string;
							url = `/indexes/${uid}/documents/${docId}`;
						}
						// Handle "/tasks/" + $parameter["uid"]
						else if (expr.includes('"/tasks/" + $parameter["uid"]')) {
							const uid = this.getNodeParameter('uid', i);
							url = `/tasks/${uid}`;
						}
						// Handle "/keys/" + $parameter["uid"]
						else if (expr.includes('"/keys/" + $parameter["uid"]')) {
							const uid = this.getNodeParameter('uid', i) as string;
							url = `/keys/${uid}`;
						}
						// Handle "/indexes/" + $parameter["uid"] + "/stats"
						else if (expr.includes('"/indexes/" + $parameter["uid"] + "/stats"')) {
							const uid = this.getNodeParameter('uid', i) as string;
							url = `/indexes/${uid}/stats`;
						}
						// Handle "/indexes/" + $parameter["uid"] + "/settings"
						else if (expr.includes('"/indexes/" + $parameter["uid"] + "/settings"')) {
							const uid = this.getNodeParameter('uid', i) as string;
							url = `/indexes/${uid}/settings`;
						}
						// Handle "/indexes/" + $parameter["uid"] + "/search"
						else if (expr.includes('"/indexes/" + $parameter["uid"] + "/search"')) {
							const uid = this.getNodeParameter('uid', i) as string;
							url = `/indexes/${uid}/search`;
						}
						// Generic fallback: try to extract and replace parameters
						else {
							// Extract all $parameter["name"] references
							const paramRegex = /\$parameter\["([^"]+)"\]/g;
							let match;
							let result = expr;
							while ((match = paramRegex.exec(expr)) !== null) {
								const paramName = match[1];
								const paramValue = this.getNodeParameter(paramName, i);
								result = result.replace(match[0], String(paramValue || ''));
							}
							// Remove string concatenation and quotes
							result = result.replace(/["']/g, '').replace(/\s*\+\s*/g, '');
							url = result;
						}
					}
				}

				// Build query string and body - collect from additionalFields
				// Query params and body are set via field routing configs
				const qs: Record<string, any> = {};
				let body: Record<string, any> = {};
				const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
				
				// Collect query parameters and body parameters from additionalFields
				// We'll search through all field arrays to find routing configs
				const allFields = [
					...getAllTasksFields,
					...deleteTasksFields,
					...cancelTasksFields,
					...getTaskFields,
					...waitForTaskFields,
					...indexesFields,
					...searchFields,
					...swapIndexesFields,
					...getKeysFields,
					...getKeyFields,
					...updateKeyFields,
					...createKeyFields,
					...documentsFields,
					...documentsAdditionalFields,
					...settingsFields,
				];
				
				for (const [key, value] of Object.entries(additionalFields)) {
					if (value !== undefined && value !== null && value !== '') {
						// Find the field definition
						const fieldProp = allFields.find(
							(p: any) => p.name === 'additionalFields' && 
								p.displayOptions?.show?.operation?.includes(operation) &&
								p.displayOptions?.show?.resource?.includes(resource)
						);
						
						if (fieldProp?.options) {
							const option = (fieldProp.options as any[]).find((opt: any) => opt.name === key);
							
							// Handle query string parameters
							if (option?.routing?.request?.qs) {
								// Extract the query parameter name from routing config
								Object.keys(option.routing.request.qs).forEach((qsKey) => {
									const qsValue = option.routing.request.qs[qsKey];
									if (typeof qsValue === 'string') {
										// Handle $value replacement
										if (qsValue.includes('$value')) {
											qs[qsKey] = qsValue.replace(/\$value/g, String(value));
										} else if (qsValue.includes('replaceAll')) {
											// Handle expressions like '={{$value.replaceAll(" ", "").split(",")}}'
											if (qsValue.includes('.split(",")')) {
												qs[qsKey] = String(value).replace(/\s/g, '').split(',');
											} else {
												qs[qsKey] = String(value).replace(/\s/g, '');
											}
										} else {
											qs[qsKey] = value;
										}
									} else {
										qs[qsKey] = value;
									}
								});
							}
							
							// Handle body parameters
							if (option?.routing?.request?.body) {
								Object.keys(option.routing.request.body).forEach((bodyKey) => {
									const bodyValue = option.routing.request.body[bodyKey];
									if (typeof bodyValue === 'string') {
										// Handle $value replacement
										if (bodyValue.includes('$value')) {
											body[bodyKey] = bodyValue.replace(/\$value/g, String(value));
										} else if (bodyValue.includes('replaceAll')) {
											// Handle expressions like '={{$value.replaceAll(" ", "").split(",")}}'
											if (bodyValue.includes('.split(",")')) {
												body[bodyKey] = String(value).replace(/\s/g, '').split(',');
											} else {
												body[bodyKey] = String(value).replace(/\s/g, '');
											}
										} else {
											body[bodyKey] = value;
										}
									} else {
										body[bodyKey] = value;
									}
								});
							}
						}
					}
				}
				
				// Merge with requestConfig.body if it exists
				if (requestConfig.body) {
					body = { ...requestConfig.body, ...body };
				}

				// Execute preSend actions if they exist
				let requestOptions: any = {
					method: requestConfig.method || 'GET',
					url: url,
					qs: Object.keys(qs).length > 0 ? qs : undefined,
				};

				// Only add body if it has content or if requestConfig explicitly sets it
				if (Object.keys(body).length > 0 || requestConfig.body !== undefined) {
					// If body has content, stringify it for JSON requests
					if (Object.keys(body).length > 0) {
						requestOptions.body = JSON.stringify(body);
						// Set Content-Type header, merging with any existing headers
						requestOptions.headers = {
							...requestOptions.headers,
							'Content-Type': 'application/json',
						};
					} else if (requestConfig.body !== undefined) {
						requestOptions.body = requestConfig.body;
					}
				}

				// Execute preSend actions
				// PreSend actions expect IExecuteSingleFunctions which has item index context
				// We need to create a wrapper that provides the item index for getNodeParameter calls
				if (routing.send?.preSend) {
					// Create a wrapper object that implements IExecuteSingleFunctions
					// The key is that getNodeParameter in IExecuteSingleFunctions doesn't take an item index
					// because it's already bound to a specific item
					const singleExecuteContext = {
						...this,
						getNodeParameter: (parameterName: string, fallbackValue?: any) => {
							return this.getNodeParameter(parameterName, i, fallbackValue);
						},
						// Ensure getNode is available
						getNode: () => this.getNode(),
						// Ensure helpers are available
						helpers: this.helpers,
						// Ensure continueOnFail is available
						continueOnFail: () => this.continueOnFail(),
						// Ensure getCredentials is available for preSend actions
						getCredentials: async (type: string) => {
							return this.getCredentials(type);
						},
					} as unknown as IExecuteSingleFunctions;
					
					for (const preSendAction of routing.send.preSend) {
						requestOptions = await preSendAction.call(singleExecuteContext, requestOptions);
					}
					
					// Ensure Content-Type header is set if body exists (preSend might have set it)
					if (requestOptions.body && typeof requestOptions.body === 'string') {
						requestOptions.headers = {
							...requestOptions.headers,
							'Content-Type': 'application/json',
						};
					}
				}

				// Get credentials and apply authentication
				// This ensures baseURL and Authorization header are set
				const credentials = await this.getCredentials('meilisearchApi');
				const MeilisearchApi = (await import('../../credentials/MeilisearchApi.credentials')).MeilisearchApi;
				const credentialType = new MeilisearchApi();
				const authenticatedOptions = await credentialType.authenticate(credentials, requestOptions);
				
				// Make the HTTP request with authenticated options
				const response = await this.helpers.httpRequest(authenticatedOptions);

				// Check if we should wait for task completion
				const waitForCompletion = this.getNodeParameter('waitForCompletion', i, false) as boolean;
				const operationsWithTaskUid = OPERATIONS_WITH_TASKUID[resource as keyof typeof OPERATIONS_WITH_TASKUID] || [];
				
				if (waitForCompletion && operationsWithTaskUid.includes(operation)) {
					// Extract taskUid from response
					const taskUid = (response as any)?.taskUid;
					if (taskUid) {
						// Wait for task completion using helper function
						const task = await waitForTaskCompletion(this, taskUid, i, credentials);
						returnData.push({
							json: task,
							pairedItem: { item: i },
						});
					} else {
						// No taskUid in response, return original response
						returnData.push({
							json: response,
							pairedItem: { item: i },
						});
					}
				} else {
					// Return the response exactly as the API returns it (like HTTP node does)
					// This ensures taskUid and all other fields are preserved
					returnData.push({
						json: response,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function executeWaitForTask(
	context: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
		const items = context.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const taskUid = context.getNodeParameter('uid', i) as number;
				const credentials = await context.getCredentials('meilisearchApi');
				const task = await waitForTaskCompletion(context, taskUid, i, credentials);
				returnData.push({
					json: task,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (context.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
}
