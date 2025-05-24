<script lang="ts">
	import { onMount } from 'svelte';
	import ChatInterface from '$lib/ChatInterface.svelte';
	import SpeechControls from '$lib/SpeechControls.svelte';
	import { speechService } from '$lib/speechService';
	import type { Message } from '$lib/types';
	let messages: Message[] = [];
	let isListening = false;
	let isLoading = false;
	let isSpeaking = false;

	// Update speaking status periodically
	setInterval(() => {
		isSpeaking = speechService.isSpeaking();
	}, 500);

	onMount(() => {
		// Initialize speech service
		speechService.init();

		// Add initial greeting message
		// addInitialGreeting();
	});

	function addInitialGreeting() {
		const greetingMessage: Message = {
			id: 'greeting-' + Date.now().toString(),
			text: "Hello! I'm Maya, your AI assistant. I'm here to help you with anything you need. Feel free to speak to me by tapping the microphone button on the right!",
			sender: 'assistant',
			timestamp: new Date()
		};
		messages = [greetingMessage]; // Speak the greeting
		setTimeout(async () => {
			try {
				console.log('Speaking initial greeting');
				// Ensure speech synthesis is ready
				await new Promise((resolve) => setTimeout(resolve, 500));
				await speechService.speak(greetingMessage.text);
				console.log('Initial greeting completed');
			} catch (error) {
				console.error('Error speaking greeting:', error);
				// Try to reset and retry once
				speechService.resetSpeechSynthesis();
				setTimeout(async () => {
					try {
						await speechService.speak(greetingMessage.text);
					} catch (retryError) {
						console.error('Retry failed for greeting:', retryError);
					}
				}, 1000);
			}
		}, 1000); // Small delay to ensure everything is loaded
	}
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
			messages = [...messages, aiMessage]; // Speak the response
			console.log('About to speak AI response:', data.response.substring(0, 50) + '...');
			try {
				await speechService.speak(data.response);
				console.log('Speech completed successfully');
			} catch (speechError) {
				console.error('Speech error:', speechError);
				// Try to reset and retry once
				console.log('Attempting to reset speech synthesis and retry...');
				speechService.resetSpeechSynthesis();
				setTimeout(async () => {
					try {
						await speechService.speak(data.response);
						console.log('Speech retry successful');
					} catch (retryError) {
						console.error('Speech retry failed:', retryError);
					}
				}, 1000);
			}
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
		// Add initial greeting for new chat
		addInitialGreeting();
	}
</script>

<svelte:head>
	<title>Maya - AI Assistant</title>
	<meta name="description" content="A voice-enabled AI assistant powered by Google Gemini" />
</svelte:head>

<div class="app-container" class:loaded={true}>
	<ChatInterface
		{messages}
		{isLoading}
		{isListening}
		{isSpeaking}
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
		opacity: 0;
		animation: fadeInApp 0.8s ease-out forwards;
	}

	.app-container.loaded {
		opacity: 1;
	}

	@keyframes fadeInApp {
		0% {
			opacity: 0;
			transform: scale(0.98);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Desktop improvements */
	@media (min-width: 768px) {
		.app-container {
			max-width: 1200px;
			margin: 0 auto;
			background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
			border-radius: 0;
			box-shadow:
				0 20px 40px rgba(0, 0, 0, 0.08),
				0 8px 16px rgba(0, 0, 0, 0.04);
		}
	}

	@media (min-width: 1024px) {
		.app-container {
			margin: 2rem auto;
			border-radius: 24px;
			overflow: hidden;
			height: calc(100vh - 4rem);
			border: 1px solid rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(20px);
		}
	}

	@media (min-width: 1440px) {
		.app-container {
			max-width: 1400px;
			margin: 3rem auto;
			height: calc(100vh - 6rem);
		}
	}
</style>
