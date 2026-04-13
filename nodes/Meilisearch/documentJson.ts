export function validateJSON(json: string | undefined | any): any {
	if (json === undefined || json === null) {
		return undefined;
	}

	if (typeof json === 'object' && json !== null) {
		return json;
	}

	if (typeof json !== 'string') {
		return undefined;
	}

	const trimmed = json.trim();
	if (trimmed === '') {
		return undefined;
	}

	try {
		return JSON.parse(trimmed);
	} catch {
		return undefined;
	}
}
