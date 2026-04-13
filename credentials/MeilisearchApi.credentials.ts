import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class MeilisearchApi implements ICredentialType {
	name = 'meilisearchApi';

	displayName = 'Meilisearch API';

	documentationUrl = 'https://www.meilisearch.com/docs/reference/api/overview';

	properties: INodeProperties[] = [
		{
			displayName: 'Host URL',
			name: 'host_url',
			type: 'string',
			placeholder: 'Your Meilisearch host URL - https://yourindex.com',
			default: '',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			description: 'This is tested against the /version endpoint',
			typeOptions: { password: true },
			default: '',
		},
		{
			displayName: 'The authentication test is against the /version endpoint - you can save your credentials regardless of the test result!',
			name: 'notice',
			type: 'notice',
			default: '/version',
		},
	];

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${credentials.apiKey}`,
		};
		requestOptions.baseURL = (credentials.host_url as string).replace(new RegExp("/$"), "")
		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			url: '/version',
			method: 'GET',
		},
	};
}
