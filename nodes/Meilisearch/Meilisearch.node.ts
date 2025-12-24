/* eslint-disable n8n-nodes-base/node-param-resource-with-plural-option */
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { generalOperations } from './GeneralDescription';
import {
	tasksOperations,
	getAllTasksFields,
	deleteTasksFields,
	cancelTasksFields,
	getTaskFields,
	waitForTaskFields,
} from './TasksDescription';
import { indexesFields, indexesOperations, searchFields, searchOperations, swapIndexesFields } from './IndexesDescription';
import {
	createKeyFields,
	getKeyFields,
	getKeysFields,
	keysOperations,
	updateKeyFields,
} from './KeysDescription';
import { documentsAdditionalFields, documentsFields, documentsOperations } from './DocumentsDescription';
import { settingsFields, settingsOperations } from './SettingsDescription';

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
				//TODO
				//multi-search
				//indexes settings sub routes
			},
			...generalOperations,
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

		// For all other operations, use the default routing-based execution
		// n8n will handle these automatically via the routing configuration
		return [];
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
				const pollingInterval = (context.getNodeParameter('pollingInterval', i) as number) || 500;
				const timeoutSeconds = (context.getNodeParameter('timeout', i) as number) || 300;
				const maxPollingInterval = (context.getNodeParameter('maxPollingInterval', i) as number) || 5000;

				const startTime = Date.now();
				const timeoutMs = timeoutSeconds * 1000;
				let currentInterval = Math.min(pollingInterval, maxPollingInterval);
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
					const response = await context.helpers.httpRequest({
						method: 'GET',
						url: `/tasks/${taskUid}`,
					});

					const task = response as {
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
						returnData.push({
							json: task,
							pairedItem: { item: i },
						});
						break;
					}

					// Task is still in progress, wait before next poll
					attemptCount++;
					const waitTime = Math.min(
						currentInterval * Math.pow(1.5, Math.min(attemptCount / 5, 3)),
						maxPollingInterval,
					);

					// Wait using exponential backoff
					await new Promise((resolve) => setTimeout(resolve, waitTime));
					currentInterval = Math.min(waitTime, maxPollingInterval);
				}
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
