<script lang="ts">
	import '../app.css';
	// Remove unused data prop as it's not needed for this layout
</script>

<main>
	<slot />
</main>

<style>
	main {
		min-height: 100vh;
	}
</style>
