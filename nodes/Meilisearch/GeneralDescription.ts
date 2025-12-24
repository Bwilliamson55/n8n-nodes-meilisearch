import type {
	INodeProperties,
} from 'n8n-workflow';

export const generalOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['general'],
			},
		},
		options: [
			{
				name: 'Dumps',
				value: 'dumps',
				action: 'Create a dump',
				description: 'The /dumps route allows the creation of database dumps. Dumps are .dump files that can be used to restore Meilisearch data or migrate between different versions.',
				routing: {
					request: {
						method: 'POST',
						url: '/dumps',
					},
				},
			},
			{
				name: 'Health',
				value: 'health',
				action: 'Get health',
				description: 'The /health route allows you to verify the status and availability of a Meilisearch instance',
				routing: {
					request: {
						method: 'GET',
						url: '/health',
					},
				},
			},
			// Experimental feature - coming soon
			// {
			// 	name: 'Metrics',
			// 	value: 'metrics',
			// 	action: 'Get metrics',
			// 	description: 'The /metrics endpoint exposes data compatible with Prometheus.io. You can monitor this endpoint to gain valuable insight into Meilisearchs behavior and performance. This information can then be used to optimize an applications performance, troubleshoot issues, or improve the overall reliability of a system',
			// 	routing: {
			// 		request: {
			// 			method: 'GET',
			// 			url: '/metrics',
			// 		},
			// 	},
			// },
			{
				name: 'Stats',
				value: 'stats',
				action: 'Get all index stats',
				description: 'The /stats route gives extended information and metrics about indexes and the Meilisearch database',
				routing: {
					request: {
						method: 'GET',
						url: '/stats',
					},
				},
			},
			{
				name: 'Version',
				value: 'version',
				action: 'Get version information',
				description: 'The /version route allows you to check the version of a running Meilisearch instance',
				routing: {
					request: {
						method: 'GET',
						url: '/version',
					},
				},
			},
		],
		default: 'health',
	},
];

export const generalFields: INodeProperties[] = [
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		default: false,
		description: 'Whether to wait for the task to complete before returning. If enabled, the node will poll the task status until it succeeds, fails, or is canceled.',
		displayOptions: {
			show: {
				resource: ['general'],
				operation: ['dumps'],
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
				resource: ['general'],
				operation: ['dumps'],
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
				resource: ['general'],
				operation: ['dumps'],
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
				resource: ['general'],
				operation: ['dumps'],
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
				resource: ['general'],
				operation: ['dumps'],
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
				resource: ['general'],
				operation: ['dumps'],
				waitForCompletion: [true],
			},
		},
	},
];
