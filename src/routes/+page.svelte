<script lang="ts">
	import { onMount } from 'svelte';
	import ChatInterface from '$lib/ChatInterface.svelte';
	import SpeechControls from '$lib/SpeechControls.svelte';
	import { speechService } from '$lib/speechService';
	import type { Message } from '$lib/types';

	let messages: Message[] = [];
	let isListening = false;
	let isLoading = false;

	onMount(() => {
		// Initialize speech service
		speechService.init();
	});
	async function handleSpeechResult(transcript: string) {
		if (!transcript.trim()) return;

		// Add user message
		const userMessage: Message = {
			id: Date.now().toString(),
			text: transcript,
			sender: 'user',
			timestamp: new Date()
		};
		messages = [...messages, userMessage];

		isLoading = true;

		try {
			// Send to API with conversation history
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: transcript,
					conversationHistory: messages.slice(-10) // Send last 10 messages for context
				})
			});

			if (!response.ok) {
				throw new Error('Failed to get response');
			}

			const data = await response.json();

			// Add AI response
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: data.response,
				sender: 'assistant',
				timestamp: new Date()
			};
			messages = [...messages, aiMessage];

			// Speak the response
			await speechService.speak(data.response);
		} catch (error) {
			console.error('Error:', error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: 'Sorry, I encountered an error. Please try again.',
				sender: 'assistant',
				timestamp: new Date()
			};
			messages = [...messages, errorMessage];
		} finally {
			isLoading = false;
		}
	}

	function handleListeningChange(listening: boolean) {
		isListening = listening;
	}

	function handleNewChat() {
		messages = [];
		// Stop any ongoing speech
		speechService.stop();
	}
</script>

<svelte:head>
	<title>Maya.IO - Talking AI Assistant</title>
	<meta name="description" content="A voice-enabled AI assistant powered by Google Gemini" />
</svelte:head>

<div class="app-container">
	<ChatInterface
		{messages}
		{isLoading}
		{isListening}
		on:newChat={handleNewChat}
		on:speechResult={(e) => handleSpeechResult(e.detail)}
		on:listeningChange={(e) => handleListeningChange(e.detail)}
	/>
</div>

<style>
	.app-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
	}

	@media (min-width: 768px) {
		.app-container {
			max-width: 450px;
			margin: 0 auto;
			border-left: 1px solid #e0e0e0;
			border-right: 1px solid #e0e0e0;
			background: white;
		}
	}
</style>
