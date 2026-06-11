<script>
	import { onMount, onDestroy } from 'svelte';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let map;
	let markers = [];
	let locations = [];
	let selectedLocation = null;
	let searchQuery = '';
	let mapLoaded = false;

	$: filteredLocations = searchQuery
		? locations.filter((loc) => loc.name.toLowerCase().includes(searchQuery.toLowerCase()))
		: locations;

	onMount(async () => {
		const [speechRes, locationRes] = await Promise.all([
			axios.post(`${API_URL}/speeches`),
			axios.post(`${API_URL}/locations`)
		]);

		const speeches = speechRes.data;
		const locationsData = locationRes.data;

		// Group speeches by origin, matched with coordinates
		// Only publicly approved recordings (public === 2) are shown on the map.
		const originMap = {};
		for (const speech of speeches) {
			if (Number(speech.public) !== 2) continue;
			if (!speech.origin) continue;
			if (!originMap[speech.origin]) originMap[speech.origin] = [];
			originMap[speech.origin].push(speech);
		}

		locations = Object.entries(originMap)
			.map(([origin, data]) => {
				const match = locationsData.find((loc) => loc.name.toLowerCase() === origin.toLowerCase());
				if (!match) return null;
				return {
					name: origin,
					data,
					lat: parseFloat(match.latitude),
					lng: parseFloat(match.longitude)
				};
			})
			.filter(Boolean);

		const L = await import('leaflet');
		map = L.map('map').setView([3.139, 109.6869], 6);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

		markers = locations.map((loc) => {
			const marker = L.marker([loc.lat, loc.lng])
				.addTo(map)
				.bindPopup(`<b>${loc.name}</b><br>${loc.data.length} recordings`);

			marker.on('click', () => {
				selectedLocation = loc;
				map.flyTo([loc.lat, loc.lng], 12);
			});

			return marker;
		});

		mapLoaded = true;
	});

	function handleSelect(location) {
		selectedLocation = location;
		map.flyTo([location.lat, location.lng], 12);
		searchQuery = '';
	}

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<div class="flex h-screen flex-col md:flex-row">
	<!-- Map Section -->
	<div
		class="relative h-1/2 w-full md:h-full md:w-3/5 {mapLoaded
			? 'opacity-100'
			: 'opacity-0'} transition-opacity duration-500"
	>
		<div id="map" class="h-full w-full"></div>
	</div>

	<!-- Data Panel -->
	<div
		class="h-1/2 w-full overflow-y-auto border-t border-gray-200 bg-gray-50 p-5 md:h-full md:w-2/5 md:border-l md:border-t-0"
	>
		<!-- Search Section -->
		<div class="relative mb-5">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search locations (e.g., Miri)..."
				class="w-full rounded-md border border-gray-300 p-2.5 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
			/>
			{#if searchQuery && filteredLocations.length > 0}
				<ul
					class="absolute z-10 max-h-72 w-full overflow-y-auto rounded-b-md border border-t-0 border-gray-200 bg-white shadow-lg"
				>
					{#each filteredLocations as location}
						<li
							on:click={() => handleSelect(location)}
							class="cursor-pointer p-2.5 hover:bg-gray-100"
						>
							{location.name} ({location.data.length} recordings)
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Data Section -->
		<div class="rounded-md bg-white p-5 shadow-sm">
			{#if selectedLocation}
				<h2 class="mb-4 text-xl font-semibold text-gray-800">
					{selectedLocation.name}
					<span class="text-sm font-normal text-gray-500"
						>({selectedLocation.data.length} recordings)</span
					>
				</h2>

				<div class="max-h-96 overflow-x-auto overflow-y-auto">
					<table class="w-full min-w-[480px] text-sm">
						<thead class="bg-gray-50">
							<tr>
								<th class="px-4 py-2 text-left">Name</th>
								<th class="px-4 py-2 text-left">Language</th>
								<th class="px-4 py-2 text-left">Date</th>
								<th class="px-4 py-2 text-left">Audio</th>
								<th class="px-4 py-2 text-left">Text</th>
							</tr>
						</thead>
						<tbody>
							{#each selectedLocation.data as item (item.id)}
								<tr class="border-b border-gray-100 hover:bg-gray-50">
									<td class="px-4 py-2">{item.name}</td>
									<td class="px-4 py-2">{item.language}</td>
									<td class="px-4 py-2">{item.date}</td>
									<td class="px-4 py-2">
										<audio controls class="w-36">
											<source src={`${API_URL}/audio/${item.recordfile}`} type="audio/mpeg" />
											Your browser does not support the audio element.
										</audio>
									</td>
									<td class="px-4 py-2">
										<button
											on:click={async () => {
												if (!item.showText) {
													if (item.textcontent === undefined) {
														const res = await axios.get(`${API_URL}/speech/${item.id}`);
														item.textcontent = res.data.data.textcontent;
														item = item;
													}
												}
												item.showText = !item.showText;
												item = item;
											}}
											class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
										>
											{item.showText ? 'Hide' : 'Show'} Details
										</button>
									</td>
								</tr>
								{#if item.showText}
									<tr>
										<td colspan="5" class="bg-gray-50 px-4 py-2 text-sm">
											{@html item.textcontent}
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="py-10 text-center text-gray-500">
					{#if locations.length > 0}
						Select a location on the map or search to view speech recordings
					{:else}
						No location data available
					{/if}
				</p>
			{/if}
		</div>
	</div>
</div>
