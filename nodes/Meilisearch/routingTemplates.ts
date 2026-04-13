import type { INodeProperties } from 'n8n-workflow';

export type GetParamFn = (name: string) => unknown;

/**
 * Resolves n8n-style routing template strings used in parameter definitions.
 * The custom Meilisearch execute() path does not run the n8n expression engine.
 */
export function resolveRoutingTemplate(
	template: string,
	fieldValue: unknown,
	getParam: GetParamFn,
): unknown {
	if (template.includes('new Date($value)')) {
		const d = new Date(fieldValue as string | number | Date);
		if (Number.isNaN(d.getTime())) {
			throw new Error(`Invalid date value for task filter: ${String(fieldValue)}`);
		}
		return d.toISOString();
	}

	if (template.includes('replaceAll')) {
		if (template.includes('.split(",")')) {
			const s = String(fieldValue).replace(/\s/g, '');
			if (s === '') return [];
			return s.split(',').filter(Boolean);
		}
		return String(fieldValue).replace(/\s/g, '');
	}

	if (template.includes('$parameter[')) {
		return resolveParameterTemplate(template, getParam);
	}

	if (template.includes('$value')) {
		return fieldValue;
	}

	return template;
}

function resolveParameterTemplate(template: string, getParam: GetParamFn): unknown {
	const trimmed = template.trim();
	const single = /^\=\{\{\s*\$parameter\["([^"]+)"\]\s*\}\}$/.exec(trimmed);
	if (single) {
		return getParam(single[1]);
	}
	return trimmed.replace(/\$parameter\["([^"]+)"\]/g, (_m, name: string) =>
		String(getParam(name) ?? ''),
	);
}

export function propertyVisibleForOperation(
	prop: INodeProperties,
	resource: string,
	operation: string,
	getParam: GetParamFn,
): boolean {
	const show = prop.displayOptions?.show as Record<string, unknown[]> | undefined;
	if (!show) return true;
	if (show.resource && !(show.resource as string[]).includes(resource)) return false;
	if (show.operation && !(show.operation as string[]).includes(operation)) return false;
	for (const [key, allowed] of Object.entries(show)) {
		if (key === 'resource' || key === 'operation') continue;
		const allowedArr = allowed as unknown[];
		const current = getParam(key);
		if (!allowedArr.includes(current)) return false;
	}
	return true;
}

/** Merge query params from top-level node properties that declare routing.request.qs */
export function mergeTopLevelRoutingQs(
	propertyArrays: INodeProperties[][],
	resource: string,
	operation: string,
	getParam: GetParamFn,
	qs: Record<string, unknown>,
): void {
	for (const arr of propertyArrays) {
		for (const prop of arr) {
			if (!prop.name) continue;
			if (prop.name === 'additionalFields' || prop.name === 'operation' || prop.name === 'resource') {
				continue;
			}
			const qsDef = (prop as { routing?: { request?: { qs?: Record<string, string> } } }).routing?.request
				?.qs;
			if (!qsDef) continue;
			if (!propertyVisibleForOperation(prop, resource, operation, getParam)) continue;

			let rawVal: unknown;
			try {
				rawVal = getParam(prop.name);
			} catch {
				continue;
			}
			if (rawVal === undefined || rawVal === null || rawVal === '') continue;

			for (const [qsKey, tmpl] of Object.entries(qsDef)) {
				if (typeof tmpl !== 'string') {
					qs[qsKey] = tmpl;
					continue;
				}
				qs[qsKey] = resolveRoutingTemplate(tmpl, rawVal, getParam);
			}
		}
	}
}

/** Resolve ={{$parameter["x"]}} placeholders in routing.request.body (e.g. create index, update key). */
export function resolveRequestConfigBodyTemplates(
	raw: Record<string, unknown>,
	getParam: GetParamFn,
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, val] of Object.entries(raw)) {
		if (val === undefined || val === null) continue;
		if (typeof val === 'string') {
			const resolved = resolveRoutingTemplate(val, undefined, getParam);
			if (resolved === undefined) continue;
			if (
				resolved === '' &&
				(key === 'primaryKey' || key === 'name' || key === 'description')
			) {
				continue;
			}
			out[key] = resolved;
		} else {
			out[key] = val;
		}
	}
	return out;
}
