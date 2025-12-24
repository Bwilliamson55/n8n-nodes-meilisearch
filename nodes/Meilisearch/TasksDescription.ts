import type {
	INodeProperties,
} from 'n8n-workflow';

export const tasksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tasks'],
			},
		},
		default: 'getAllTasks',
		options: [
			{
				name: 'Get A Single Task',
				value: 'getTask',
				action: 'Get one task by UID',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/tasks/" + $parameter["uid"]}}',
						qs: {}
					},
				},
			},
			{
				name: 'Get All Tasks',
				value: 'getAllTasks',
				action: 'Get all tasks',
				description: 'The /tasks route allows you to List all tasks globally, regardless of index. The task objects are contained in the results array.',
				routing: {
					request: {
						method: 'GET',
						url: '/tasks',
						qs: {}
					},
				},
			},
			{
				name: 'Delete Tasks',
				value: 'deleteTasks',
				action: 'Delete tasks',
				description: 'Delete a finished (succeeded, failed, or canceled) task based on uid, status, type, indexUid, canceledBy, or date. Task deletion is an atomic transaction: either all tasks are successfully deleted, or none are.',
				routing: {
					request: {
						method: 'DELETE',
						url: '/tasks',
						qs: {}
					},
				},
			},
			{
				name: 'Cancel Tasks',
				value: 'cancelTasks',
				action: 'Cancel tasks',
				description: 'Cancel any number of enqueued or processing tasks based on their uid, status, type, indexUid, or the date at which they were enqueued, processed, or completed. Task cancelation is an atomic transaction: either all tasks are successfully canceled or none are.',
				routing: {
					request: {
						method: 'POST',
						url: '/tasks/cancel',
						qs: {}
					},
				},
			},
			{
				name: 'Wait for Task',
				value: 'waitForTask',
				action: 'Wait for task completion',
				description: 'Poll a task until it completes (succeeded, failed, or canceled). Uses exponential backoff to reduce API calls.',
			},
		],
	},
];

const commonOptions: INodeProperties[] = [
	{
		displayName: 'UIDs',
		name: 'uids',
		description: 'Comma delimited list of UID(s) to filter results by',
		type: 'string',
		default: '',
		routing: {
			request: {
				qs: {
					uids: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
	{
		displayName: 'Index UIDs',
		name: 'indexUids',
		description: 'Comma delimited list of Index UID(s) to filter results by',
		type: 'string',
		default: '',
		routing: {
			request: {
				qs: {
					indexUids: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
	{
		displayName: 'Statuses',
		name: 'statuses',
		description: 'Comma delimited list of Task Status(es) to filter results by',
		type: 'string',
		default: '',
		routing: {
			request: {
				qs: {
					statuses: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
	{
		displayName: 'Types',
		name: 'types',
		description: 'Comma delimited list of Task Type(s) to filter results by',
		type: 'string',
		default: '',
		routing: {
			request: {
				qs: {
					types: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
	{
		displayName: 'Canceled By',
		name: 'canceledBy',
		description: 'Comma delimited list of Task UID(s) that canceled another task(s)',
		type: 'string',
		default: '',
		routing: {
			request: {
				qs: {
					canceledBy: '={{$value.replaceAll(" ", "")}}',
				},
			},
		},
	},
	{
		displayName: 'Before Enqueued At',
		name: 'beforeEnqueuedAt',
		description: 'Permits to filter tasks based on their enqueuedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					beforeEnqueuedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
	{
		displayName: 'After Enqueued At',
		name: 'afterEnqueuedAt',
		description: 'Permits to filter tasks based on their enqueuedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					afterEnqueuedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
	{
		displayName: 'Before Started At',
		name: 'beforeStartedAt',
		description: 'Permits to filter tasks based on their startedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					beforeStartedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
	{
		displayName: 'After Started At',
		name: 'afterStartedAt',
		description: 'Permits to filter tasks based on their startedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					afterStartedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
	{
		displayName: 'Before Finished At',
		name: 'beforeFinishedAt',
		description: 'Permits to filter tasks based on their finishedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					beforeFinishedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
	{
		displayName: 'After Finished At',
		name: 'afterFinishedAt',
		description: 'Permits to filter tasks based on their finishedAt time',
		type: 'dateTime',
		default: '',
		routing: {
			request: {
				qs: {
					afterFinishedAt: '={{new Date($value).toJSON()}}',
				},
			},
		},
	},
]

export const getTaskFields: INodeProperties[] = [
	{
		displayName: 'Task UID',
		name: 'uid',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: null,
		displayOptions: {
			show: {
				resource: ['tasks'],
				operation: ['getTask'],
			},
		},
	},
]

export const getAllTasksFields: INodeProperties[] = [
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
				resource: ['tasks'],
				operation: ['getAllTasks'],
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
				displayName: 'From',
				name: 'from',
				description: 'Fetch the next set of results from the given UID',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: null,
				routing: {
					request: {
						qs: {
							from: '={{$value}}',
						},
					},
				},
			},
			...commonOptions,
		],
	},
];

export const deleteTasksFields: INodeProperties[] = [
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
				resource: ['tasks'],
				operation: ['deleteTasks'],
			},
		},
		options: [
			...commonOptions,
		],
	},
];

export const cancelTasksFields: INodeProperties[] = [
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
				resource: ['tasks'],
				operation: ['cancelTasks'],
			},
		},
		options: [
			...commonOptions,
		],
	},
];

export const waitForTaskFields: INodeProperties[] = [
	{
		displayName: 'Task UID',
		name: 'uid',
		type: 'number',
		required: true,
		typeOptions: {
			minValue: 1,
		},
		default: null,
		description: 'The UID of the task to wait for',
		displayOptions: {
			show: {
				resource: ['tasks'],
				operation: ['waitForTask'],
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
		description: 'Initial interval between polling requests in milliseconds. Uses exponential backoff.',
		displayOptions: {
			show: {
				resource: ['tasks'],
				operation: ['waitForTask'],
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
				resource: ['tasks'],
				operation: ['waitForTask'],
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
		description: 'Maximum interval between polling requests when using exponential backoff',
		displayOptions: {
			show: {
				resource: ['tasks'],
				operation: ['waitForTask'],
			},
		},
	},
];
