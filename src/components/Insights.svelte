<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as echarts from 'echarts';
	import axios from 'axios';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let barChartEl, pieChartEl, genderPieChartEl;
	let barChart, pieChart, genderPieChart;

	let availableYears = [];
	let byYear = {};
	let selectedYear = new Date().getFullYear();

	$: languageCounts = (byYear[selectedYear] ?? []).sort((a, b) => b.count - a.count);
	$: totalSpeeches = languageCounts.reduce((sum, l) => sum + l.count, 0);
	$: totalLanguages = languageCounts.length;
	$: categories = languageCounts.map((item) => item.name);
	$: data = languageCounts.map((item) => item.count);
	$: totalFemale = languageCounts.reduce((sum, l) => sum + l.femaleCount, 0);
	$: totalMale = languageCounts.reduce((sum, l) => sum + l.maleCount, 0);

	function getBarOption() {
		return {
			xAxis: { max: 'dataMax' },
			yAxis: {
				type: 'category',
				data: categories,
				inverse: true,
				max: categories.length > 10 ? 9 : categories.length - 1
			},
			series: [
				{
					name: 'Speeches',
					type: 'bar',
					data,
					label: { show: true, position: 'right' }
				}
			],
			legend: { show: true },
			animationDuration: 0,
			animationEasing: 'linear'
		};
	}

	function getLanguagePieOption() {
		return {
			tooltip: {
				trigger: 'item',
				formatter: (params) => `${params.name}: ${params.value} Speeches`
			},
			series: [
				{
					name: 'Speeches',
					type: 'pie',
					radius: '50%',
					data: languageCounts.map((lang) => ({ value: lang.count, name: lang.name })),
					emphasis: {
						itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
					},
					label: { formatter: '{b}: {d}%', color: '#333' }
				}
			]
		};
	}

	function getGenderPieOption() {
		return {
			title: {
				text: 'Gender Distribution',
				subtext: `Year ${selectedYear}`,
				left: 'center'
			},
			tooltip: { trigger: 'item', formatter: '{b}: {c}' },
			legend: { orient: 'vertical', left: 'left', data: ['Female', 'Male'] },
			series: [
				{
					name: 'Gender',
					type: 'pie',
					radius: '50%',
					data: [
						{ value: totalFemale, name: 'Female' },
						{ value: totalMale, name: 'Male' }
					],
					emphasis: {
						itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' }
					},
					label: { formatter: '{b}: {d}%', color: '#333' }
				}
			]
		};
	}

	$: if (barChart && categories.length) {
		barChart.setOption(getBarOption());
		barChart.resize();
	}
	$: if (pieChart && languageCounts.length) {
		pieChart.setOption(getLanguagePieOption());
		pieChart.resize();
	}
	$: if (genderPieChart && (totalFemale > 0 || totalMale > 0)) {
		genderPieChart.setOption(getGenderPieOption());
		genderPieChart.resize();
	}

	onMount(async () => {
		const res = await axios.get(`${API_URL}/insights`);
		availableYears = res.data.years;
		byYear = res.data.byYear;
		if (availableYears.length > 0) selectedYear = availableYears[0];

		await tick();

		console.log(0);
		barChart = echarts.init(barChartEl);
		console.log(1);
		pieChart = echarts.init(pieChartEl);
		console.log(2);
		genderPieChart = echarts.init(genderPieChartEl);

		console.log(3);
		barChart.setOption(getBarOption());
		console.log(4);
		pieChart.setOption(getLanguagePieOption());
		console.log(5);
		genderPieChart.setOption(getGenderPieOption());
		console.log(6);

		window.addEventListener('resize', () => {
			barChart.resize();
			pieChart.resize();
			genderPieChart.resize();
		});

		console.log(7);

		return () => {
			barChart.dispose();
			pieChart.dispose();
			genderPieChart.dispose();
		};
	});
</script>

<div class="space-y-6 bg-gray-100 p-6">
	<!-- Filters -->
	<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
		<h1 class="text-3xl font-bold text-gray-900">Language Speech Insights</h1>
		<select bind:value={selectedYear} class="rounded-lg border bg-gray-50 p-2">
			{#each availableYears as year}
				<option value={year}>{year}</option>
			{/each}
		</select>
	</div>

	<!-- Stat Cards -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<p class="text-sm font-medium text-gray-600">Selected Year</p>
			<p class="text-2xl font-semibold text-gray-900">{selectedYear}</p>
		</div>
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<p class="text-sm font-medium text-gray-600">Total Speeches</p>
			<p class="text-2xl font-semibold text-gray-900">{totalSpeeches}</p>
		</div>
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<p class="text-sm font-medium text-gray-600">Languages Spoken</p>
			<p class="text-2xl font-semibold text-gray-900">{totalLanguages}</p>
		</div>
	</div>

	<!-- Charts -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Language Distribution</h2>
			{#if languageCounts.length > 0}
				<div bind:this={pieChartEl} style="width: 100%; height: 400px;"></div>
			{:else}
				<p class="text-center text-gray-500">No data available</p>
			{/if}
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			<h2 class="mb-4 text-xl font-semibold text-gray-900">Overall Gender Distribution</h2>
			<div
				bind:this={genderPieChartEl}
				style="width: 100%; height: 400px;"
				class={totalFemale === 0 && totalMale === 0 ? 'hidden' : ''}
			></div>
			{#if totalFemale === 0 && totalMale === 0}
				<p class="text-center text-gray-500">No data available</p>
			{/if}
		</div>
	</div>

	<div class="rounded-lg border border-gray-200 bg-white p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Language Counts</h2>
		<p class="text-l mb-2 text-center font-semibold text-gray-500">Year {selectedYear}</p>
		{#if languageCounts.length > 0}
			<div bind:this={barChartEl} style="width: 100%; height: 400px;"></div>
		{:else}
			<p class="text-center text-gray-500">No data available</p>
		{/if}
	</div>

	<!-- Data Table -->
	<div class="overflow-x-auto rounded-lg border border-gray-200 bg-white p-4">
		<h2 class="mb-4 text-xl font-semibold text-gray-900">Language Details</h2>
		<table class="min-w-full text-left text-sm">
			<thead class="bg-blue-400 text-white">
				<tr>
					<th class="px-6 py-3 text-xs font-medium uppercase tracking-wider">Language</th>
					<th class="px-6 py-3 text-xs font-medium uppercase tracking-wider">Total Speeches</th>
					<th class="px-6 py-3 text-xs font-medium uppercase tracking-wider">Female</th>
					<th class="px-6 py-3 text-xs font-medium uppercase tracking-wider">Male</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 bg-white">
				{#each languageCounts as language}
					<tr>
						<td class="whitespace-nowrap px-6 py-4 text-gray-900">{language.name}</td>
						<td class="whitespace-nowrap px-6 py-4 text-gray-500">{language.count}</td>
						<td class="whitespace-nowrap px-6 py-4 text-gray-500">{language.femaleCount}</td>
						<td class="whitespace-nowrap px-6 py-4 text-gray-500">{language.maleCount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
