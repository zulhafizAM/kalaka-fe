<script>
	/** Options to choose from: plain strings, or { value, label } objects. */
	export let options = [];
	export let value = '';
	export let placeholder = 'Select';
	export let searchPlaceholder = 'Search...';
	export let emptyText = 'No matches';
	export let disabled = false;
	/** Extra classes for the trigger button. */
	let className = '';
	export { className as class };

	let open = false;
	let search = '';

	$: normalized = options.map((o) =>
		o && typeof o === 'object' ? { value: o.value, label: o.label ?? String(o.value) } : { value: o, label: String(o) }
	);

	$: matches = search
		? normalized.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
		: normalized;

	$: selectedLabel = normalized.find((o) => o.value === value)?.label ?? '';

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) search = '';
	}

	function choose(option) {
		value = option.value;
		open = false;
	}

	function clickOutside(node, callback) {
		const handleClick = (event) => {
			if (node && !node.contains(event.target)) callback();
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

<div class="relative {className}" use:clickOutside={() => (open = false)}>
	<button
		type="button"
		{disabled}
		on:click={toggle}
		class="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 {!selectedLabel
			? 'text-gray-400'
			: 'text-gray-900'}"
	>
		<span class="truncate">{selectedLabel || placeholder}</span>
		<svg class="h-4 w-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<div
			class="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white py-1 shadow-lg"
		>
			<div class="border-b p-2">
				<!-- svelte-ignore a11y_autofocus -->
				<input
					type="text"
					bind:value={search}
					placeholder={searchPlaceholder}
					class="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					on:click|stopPropagation
				/>
			</div>
			{#each matches as option}
				<button
					type="button"
					class="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 {option.value === value
						? 'bg-blue-50 font-medium text-blue-700'
						: ''}"
					on:click={() => choose(option)}
				>
					{option.label}
				</button>
			{:else}
				<div class="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
			{/each}
		</div>
	{/if}
</div>
