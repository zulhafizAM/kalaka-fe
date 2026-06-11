<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import Sidebar from '../Sidebar.svelte';
	import { sidebarOpen } from '$lib/stores/sidebar.js';

	const API_URL = import.meta.env.VITE_API_BASE_URL;

	let question = '';
	let option_a = '';
	let option_b = '';
	let option_c = '';
	let option_d = '';
	let correct_answer = 'A';
	let editingId = null;
	let search = '';
	let quizzes = [];
	let isLoading = false;
	let error = null;

	onMount(async () => {
		await fetchQuizzes();
	});

	async function fetchQuizzes() {
		try {
			isLoading = true;
			const res = await axios.get(`${API_URL}/quizzes`);
			quizzes = res.data;
		} catch (err) {
			error = err.response?.data?.message || err.message;
		} finally {
			isLoading = false;
		}
	}

	$: filteredQuizzes = quizzes.filter((q) =>
		[q.question, q.option_a, q.option_b, q.option_c, q.option_d].some((o) =>
			o?.toLowerCase().includes(search.toLowerCase())
		)
	);

	async function submitQuiz() {
		if (!option_a || !option_b || !option_c || !option_d) {
			alert('Please fill in all options.');
			return;
		}

		const payload = { question, option_a, option_b, option_c, option_d, correct_answer };

		try {
			if (editingId === null) {
				await axios.post(`${API_URL}/quiz`, payload);
			} else {
				await axios.put(`${API_URL}/quiz/${editingId}`, payload);
				editingId = null;
			}
			clearForm();
			await fetchQuizzes();
		} catch (err) {
			alert(err.response?.data?.message || err.message);
		}
	}

	function editQuiz(quiz) {
		question = quiz.question;
		option_a = quiz.option_a;
		option_b = quiz.option_b;
		option_c = quiz.option_c;
		option_d = quiz.option_d;
		correct_answer = quiz.correct_answer;
		editingId = quiz.id;
	}

	async function deleteQuiz(id) {
		if (confirm('Are you sure you want to delete this quiz?')) {
			try {
				await axios.delete(`${API_URL}/quiz/${id}`);
				quizzes = quizzes.filter((q) => q.id !== id);
			} catch (err) {
				alert(err.response?.data?.message || err.message);
			}
		}
	}

	function clearForm() {
		question = '';
		option_a = '';
		option_b = '';
		option_c = '';
		option_d = '';
		correct_answer = 'A';
		editingId = null;
	}
</script>

<div class="flex min-h-screen bg-gray-50">
	<Sidebar role="admin" />

	<div class="flex w-full min-w-0 flex-1 flex-col p-4 sm:p-6">
		<div class="flex items-center gap-3 bg-white p-4 shadow">
			<button
				type="button"
				class="text-blue-900 md:hidden"
				aria-label="Open menu"
				on:click={() => sidebarOpen.set(true)}
			>
				☰
			</button>
			<h1 class="text-xl font-bold">Manage Quizzes</h1>
		</div>

		<main class="grid flex-1 grid-cols-1 gap-6 p-2 sm:p-6 lg:grid-cols-2">
			<!-- Add/Edit Quiz Form -->
			<div class="rounded-xl bg-white p-4 shadow">
				<h2 class="mb-4 text-lg font-semibold">{editingId === null ? 'Add Quiz' : 'Edit Quiz'}</h2>
				<div class="space-y-2">
					<label class="block"
						>Question<textarea
							bind:value={question}
							rows="2"
							class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						></textarea></label
					>
					<label class="block"
						>Option A<input
							bind:value={option_a}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/></label
					>
					<label class="block"
						>Option B<input
							bind:value={option_b}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/></label
					>
					<label class="block"
						>Option C<input
							bind:value={option_c}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/></label
					>
					<label class="block"
						>Option D<input
							bind:value={option_d}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						/></label
					>
					<label class="block"
						>Correct Answer
						<select
							bind:value={correct_answer}
							class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="A">Option A</option>
							<option value="B">Option B</option>
							<option value="C">Option C</option>
							<option value="D">Option D</option>
						</select>
					</label>
					<div class="flex gap-2">
						<button
							on:click={submitQuiz}
							class="flex-1 rounded-lg bg-blue-600 py-2 font-semibold text-white shadow hover:bg-blue-700"
							>{editingId === null ? 'Save Quiz' : 'Update Quiz'}</button
						>
						{#if editingId !== null}
							<button
								on:click={clearForm}
								class="rounded-lg bg-gray-400 px-4 py-2 font-semibold text-white shadow hover:bg-gray-500"
								>Cancel</button
							>
						{/if}
					</div>
				</div>
			</div>

			<!-- Quiz List -->
			<div class="flex flex-col rounded-xl bg-white p-4 shadow">
				<h2 class="mb-4 text-lg font-semibold">Quiz List ({filteredQuizzes.length})</h2>
				<input
					type="text"
					bind:value={search}
					placeholder="Search quizzes..."
					class="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>

				{#if isLoading}
					<p class="py-8 text-center text-gray-500">Loading...</p>
				{:else if error}
					<p class="py-8 text-center text-red-500">{error}</p>
				{:else}
					<div class="max-h-[450px] overflow-y-auto">
						<ul class="space-y-3 pr-2">
							{#each filteredQuizzes as quiz}
								<li
									class="rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
								>
									<p class="mb-1 text-sm font-medium text-gray-800">{quiz.question}</p>
									<div class="grid grid-cols-2 gap-1 text-sm">
										<span class="text-gray-600">A: {quiz.option_a}</span>
										<span class="text-gray-600">B: {quiz.option_b}</span>
										<span class="text-gray-600">C: {quiz.option_c}</span>
										<span class="text-gray-600">D: {quiz.option_d}</span>
									</div>
									<p class="mt-2 text-sm font-semibold text-green-600">
										Correct Answer: {quiz.correct_answer}
									</p>
									<div class="mt-3 flex space-x-2">
										<button
											on:click={() => editQuiz(quiz)}
											class="rounded-md bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
											>Edit</button
										>
										<button
											on:click={() => deleteQuiz(quiz.id)}
											class="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
											>Delete</button
										>
									</div>
								</li>
							{:else}
								<li class="text-center py-6 text-gray-500">
									No quizzes found {#if search}for "{search}"{:else}— add your first quiz!{/if}
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</main>
	</div>
</div>

<style>
	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}
	.overflow-y-auto::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 10px;
	}
	.overflow-y-auto::-webkit-scrollbar-thumb {
		background: #cbd5e0;
		border-radius: 10px;
	}
	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background: #a0aec0;
	}
</style>
