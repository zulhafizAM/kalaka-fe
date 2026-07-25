// ===============================================================
// Table Query Helpers — dynamic search + column/value filtering
// ===============================================================

/**
 * Read a cell as plain searchable text. HTML is stripped so rich-text
 * columns (e.g. transcriptions) match on their visible words, not markup.
 * @param {Record<string, any>} row
 * @param {string} key
 * @returns {string}
 */
export function cellText(row, key) {
	const value = row?.[key];
	if (value === null || value === undefined) return '';
	if (Array.isArray(value)) return value.map((v) => (v == null ? '' : String(v))).join(' ');
	const text = String(value);
	return text.includes('<') ? text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : text;
}

/**
 * True when any of the given keys contains the search term.
 * An empty term matches everything.
 * @param {Record<string, any>} row
 * @param {string[]} keys
 * @param {string} term
 * @returns {boolean}
 */
export function matchesSearch(row, keys, term) {
	const needle = term?.trim().toLowerCase();
	if (!needle) return true;
	return keys.some((key) => cellText(row, key).toLowerCase().includes(needle));
}

/**
 * Distinct, non-empty values for a column, naturally sorted.
 * Used to populate the filter value dropdown.
 * @param {Record<string, any>[]} rows
 * @param {string} key
 * @returns {string[]}
 */
export function distinctValues(rows, key) {
	const seen = new Set();
	for (const row of rows) {
		const text = cellText(row, key).trim();
		if (text) seen.add(text);
	}
	return [...seen].sort((a, b) =>
		a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
	);
}

/**
 * Active filters are OR'd within the same column and AND'd across columns,
 * so "Language: Iban or Malay" + "Origin: Miri" behaves as expected.
 * @param {Record<string, any>} row
 * @param {{ key: string, value: string }[]} filters
 * @returns {boolean}
 */
export function matchesFilters(row, filters) {
	if (!filters?.length) return true;

	/** @type {Map<string, string[]>} */
	const byColumn = new Map();
	for (const { key, value } of filters) {
		if (!byColumn.has(key)) byColumn.set(key, []);
		byColumn.get(key).push(value);
	}

	for (const [key, values] of byColumn) {
		const text = cellText(row, key).trim();
		if (!values.includes(text)) return false;
	}
	return true;
}

/**
 * Apply the free-text search and the active column filters together.
 * @param {Record<string, any>[]} rows
 * @param {string[]} keys
 * @param {string} term
 * @param {{ key: string, value: string }[]} filters
 * @returns {Record<string, any>[]}
 */
export function applyTableQuery(rows, keys, term, filters) {
	return rows.filter((row) => matchesSearch(row, keys, term) && matchesFilters(row, filters));
}
