import type { INodeProperties } from 'n8n-workflow';
import { buildWaitForMeiliTaskFields } from './waitPollFields';

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

export const generalFields: INodeProperties[] = buildWaitForMeiliTaskFields({
	resource: ['general'],
	operations: ['dumps'],
});
