<script>
	export let year = new Date().getFullYear();
	export let institution = 'Universiti Malaysia Sarawak';
	export let text = 'All rights reserved.';
</script>

<div class="flex flex-col">
	<!-- Main Content 
  <main class="flex-grow">
    Your page content goes here 
  </main>-->

	<!-- Footer -->
	<footer class="footer bg-gray-800 px-6 py-4 text-center text-white">
		&copy; {year}
		{institution}. {text}
	</footer>
</div>
