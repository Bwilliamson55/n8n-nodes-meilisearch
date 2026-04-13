/**
 * Maps optional Meilisearch search / multi-search query fields onto a request body object.
 */
export function applyOptionalSearchQueryFields(
	searchQuery: Record<string, unknown>,
	queryConfig: Record<string, unknown>,
): void {
	if (queryConfig.offset !== undefined && queryConfig.offset !== null && queryConfig.offset !== '') {
		searchQuery.offset =
			typeof queryConfig.offset === 'number'
				? queryConfig.offset
				: parseInt(String(queryConfig.offset), 10);
	}
	if (queryConfig.limit !== undefined && queryConfig.limit !== null && queryConfig.limit !== '') {
		searchQuery.limit =
			typeof queryConfig.limit === 'number'
				? queryConfig.limit
				: parseInt(String(queryConfig.limit), 10);
	}
	if (queryConfig.hitsPerPage !== undefined && queryConfig.hitsPerPage !== null && queryConfig.hitsPerPage !== '') {
		searchQuery.hitsPerPage =
			typeof queryConfig.hitsPerPage === 'number'
				? queryConfig.hitsPerPage
				: parseInt(String(queryConfig.hitsPerPage), 10);
	}
	if (queryConfig.page !== undefined && queryConfig.page !== null && queryConfig.page !== '') {
		searchQuery.page =
			typeof queryConfig.page === 'number'
				? queryConfig.page
				: parseInt(String(queryConfig.page), 10);
	}
	if (queryConfig.filter) searchQuery.filter = queryConfig.filter;
	if (queryConfig.facets) {
		searchQuery.facets = String(queryConfig.facets).replace(/\s/g, '').split(',');
	}
	if (queryConfig.attributesToRetrieve) {
		searchQuery.attributesToRetrieve = String(queryConfig.attributesToRetrieve).replace(/\s/g, '').split(',');
	}
	if (queryConfig.attributesToCrop) {
		searchQuery.attributesToCrop = String(queryConfig.attributesToCrop).replace(/\s/g, '').split(',');
	}
	if (queryConfig.cropLength !== undefined && queryConfig.cropLength !== null && queryConfig.cropLength !== '') {
		searchQuery.cropLength =
			typeof queryConfig.cropLength === 'number'
				? queryConfig.cropLength
				: parseInt(String(queryConfig.cropLength), 10);
	}
	if (queryConfig.cropMarker) searchQuery.cropMarker = queryConfig.cropMarker;
	if (queryConfig.attributesToHighlight) {
		searchQuery.attributesToHighlight = String(queryConfig.attributesToHighlight).replace(/\s/g, '').split(',');
	}
	if (queryConfig.highlightPreTag) searchQuery.highlightPreTag = queryConfig.highlightPreTag;
	if (queryConfig.highlightPostTag) searchQuery.highlightPostTag = queryConfig.highlightPostTag;
	if (queryConfig.showMatchesPosition !== undefined) {
		searchQuery.showMatchesPosition = queryConfig.showMatchesPosition;
	}
	if (queryConfig.sort) {
		searchQuery.sort = String(queryConfig.sort).replace(/\s/g, '').split(',');
	}
	if (queryConfig.matchingStrategy) searchQuery.matchingStrategy = queryConfig.matchingStrategy;
}
