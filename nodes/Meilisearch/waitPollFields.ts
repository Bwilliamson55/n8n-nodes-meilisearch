import type { INodeProperties } from 'n8n-workflow';

/** Shared "wait for Meilisearch task" polling parameters for document/index/key/general operations. */
export function buildWaitForMeiliTaskFields(options: {
	resource: string[];
	operations: string[];
}): INodeProperties[] {
	const { resource, operations } = options;
	const opShow = { resource, operation: operations };
	return [
		{
			displayName: 'Wait for Completion',
			name: 'waitForCompletion',
			type: 'boolean',
			default: false,
			description:
				'Whether to wait for the task to complete before returning. If enabled, the node will poll the task status until it succeeds, fails, or is canceled.',
			displayOptions: { show: opShow },
		},
		{
			displayName: 'Use Exponential Backoff',
			name: 'useExponentialBackoff',
			type: 'boolean',
			default: true,
			description:
				'If enabled, the polling interval will gradually increase to reduce API calls. If disabled, uses a fixed polling interval.',
			displayOptions: { show: { ...opShow, waitForCompletion: [true] } },
		},
		{
			displayName: 'Polling Interval (ms)',
			name: 'pollingInterval',
			type: 'number',
			typeOptions: { minValue: 100, maxValue: 10000 },
			default: 500,
			description:
				'Fixed interval between polling requests in milliseconds (used when exponential backoff is disabled)',
			displayOptions: {
				show: { ...opShow, waitForCompletion: [true], useExponentialBackoff: [false] },
			},
		},
		{
			displayName: 'Initial Polling Interval (ms)',
			name: 'pollingInterval',
			type: 'number',
			typeOptions: { minValue: 100, maxValue: 10000 },
			default: 500,
			description:
				'Starting interval between polling requests in milliseconds. The interval increases by 1.5x every 5 attempts',
			displayOptions: {
				show: { ...opShow, waitForCompletion: [true], useExponentialBackoff: [true] },
			},
		},
		{
			displayName: 'Max Polling Interval (ms)',
			name: 'maxPollingInterval',
			type: 'number',
			typeOptions: { minValue: 1000, maxValue: 30000 },
			default: 5000,
			description:
				'Maximum interval between polling requests. Exponential backoff will not exceed this value',
			displayOptions: {
				show: { ...opShow, waitForCompletion: [true], useExponentialBackoff: [true] },
			},
		},
		{
			displayName: 'Timeout (seconds)',
			name: 'timeout',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: 3600 },
			default: 300,
			description:
				'Maximum time to wait for task completion in seconds (default: 5 minutes)',
			displayOptions: { show: { ...opShow, waitForCompletion: [true] } },
		},
	];
}
