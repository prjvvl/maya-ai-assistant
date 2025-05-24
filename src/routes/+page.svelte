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

<div class="container">
	<header>
		<h1>Maya.IO</h1>
		<p>Your Talking AI Assistant</p>
	</header>
	<main class="app-main">
		<ChatInterface 
			{messages} 
			{isLoading} 
			on:newChat={handleNewChat}
		/>
		<SpeechControls 
			{isListening} 
			on:speechResult={e => handleSpeechResult(e.detail)}
			on:listeningChange={e => handleListeningChange(e.detail)}
		/>
	</main>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		text-align: center;
		margin-bottom: 2rem;
		color: white;
	}

	header h1 {
		font-size: 3rem;
		margin: 0;
		font-weight: bold;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
	}

	header p {
		font-size: 1.2rem;
		margin: 0.5rem 0 0 0;
		opacity: 0.9;
	}

	.app-main {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		header h1 {
			font-size: 2rem;
		}

		header p {
			font-size: 1rem;
		}
	}
</style>
