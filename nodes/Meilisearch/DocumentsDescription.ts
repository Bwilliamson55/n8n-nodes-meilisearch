import type {
	INodeProperties
} from 'n8n-workflow';

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
				name: 'Get Documents',
				value: 'getMany',
				action: 'Get documents',
				routing: {
					request: {
						method: 'GET',
						url: '={{"/indexes/" + $parameter["uid"] + "/documents"}}',
						qs: {}
					},
				},
			},
		],
	}
];

export const documentsFields: INodeProperties[] = [
	{
		displayName: 'UID',
		name: 'uid',
		description: 'Name of the index',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['documents'],
			},
		},
	},
]
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
				description: 'Comma-separated list of fields to display for an API resource. By default it contains all fields of an API resource.',
				default: '*',
				routing: {
					request: {
						qs: {
							fields: '={{$value.replaceAll(" ", "")}}',
						},
					},
				},
			},
		],
	},
];