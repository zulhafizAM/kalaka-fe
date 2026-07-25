<script>
	import SearchableSelect from './SearchableSelect.svelte';
	import { applyTableQuery, distinctValues } from '$lib/helper/core/table-query.js';

	/** Source rows to search/filter. */
	export let rows = [];
	/**
	 * Column definitions: { key, label, searchable?, filterable? }.
	 * Every column is searchable and filterable unless explicitly disabled.
	 */
	export let columns = [];
	/** Result of search + filters — bind to this. */
	export let filtered = [];
	export let searchPlaceholder = 'Search all columns...';

	let search = '';
	/** @type {{ key: string, value: string }[]} */
	let filters = [];
	let pendingKey = '';
	let pendingValue = '';

	$: searchKeys = columns.filter((c) => c.searchable !== false).map((c) => c.key);
	$: filterColumns = columns.filter((c) => c.filterable !== false);
	$: columnOptions = filterColumns.map((c) => ({ value: c.key, label: c.label }));

	// Values available for the column being added, minus ones already applied.
	$: valueOptions = pendingKey
		? distinctValues(rows, pendingKey).filter(
				(v) => !filters.some((f) => f.key === pendingKey && f.value === v)
			)
		: [];

	// Selecting a value commits the filter immediately, then resets the picker.
	$: if (pendingKey && pendingValue) addFilter(pendingKey, pendingValue);

	$: filtered = applyTableQuery(rows, searchKeys, search, filters);

	function labelFor(key) {
		return columns.find((c) => c.key === key)?.label ?? key;
	}

	function addFilter(key, value) {
		if (!filters.some((f) => f.key === key && f.value === value)) {
			filters = [...filters, { key, value }];
		}
		pendingValue = '';
	}

	function removeFilter(index) {
		filters = filters.filter((_, i) => i !== index);
	}

	function clearAll() {
		filters = [];
		search = '';
		pendingKey = '';
		pendingValue = '';
	}
</script>

<div class="hidden-print mb-4 space-y-3">
	<div class="flex flex-col gap-3 lg:flex-row lg:items-center">
		<!-- Free-text search across every searchable column -->
		<div class="relative w-full lg:max-w-sm">
			<svg
				class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
				/>
			</svg>
			<input
				type="text"
				bind:value={search}
				placeholder={searchPlaceholder}
				aria-label="Search table"
				class="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>

		<!-- Dynamic filter builder: pick a column, then one of its values -->
		<div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
			<SearchableSelect
				bind:value={pendingKey}
				options={columnOptions}
				placeholder="Filter by column"
				searchPlaceholder="Search columns..."
				class="w-full sm:w-48"
			/>
			<SearchableSelect
				bind:value={pendingValue}
				options={valueOptions}
				placeholder={pendingKey ? 'Select value' : 'Pick a column first'}
				searchPlaceholder="Search values..."
				emptyText="No values left"
				disabled={!pendingKey}
				class="w-full sm:w-48"
			/>
		</div>

		<slot />
	</div>

	<!-- Active filters -->
	{#if filters.length}
		<div class="flex flex-wrap items-center gap-2">
			{#each filters as filter, index}
				<span
					class="inline-flex items-center gap-1 rounded-full bg-blue-100 py-1 pl-3 pr-1 text-xs font-medium text-blue-800"
				>
					{labelFor(filter.key)}: {filter.value}
					<button
						type="button"
						class="rounded-full px-1 text-blue-600 hover:bg-blue-200 hover:text-blue-900"
						aria-label="Remove {labelFor(filter.key)} filter"
						on:click={() => removeFilter(index)}
					>
						✕
					</button>
				</span>
			{/each}
			<button
				type="button"
				class="text-xs font-medium text-gray-600 underline hover:text-gray-900"
				on:click={clearAll}
			>
				Clear all
			</button>
		</div>
	{/if}

	<p class="text-sm text-gray-500">
		Showing <span class="font-medium">{filtered.length}</span> of
		<span class="font-medium">{rows.length}</span> records
	</p>
</div>
