<script lang="ts">	import { createEventDispatcher, onMount } from 'svelte';
	import { speechService } from './speechService';

	export let isListening = false;

	const dispatch = createEventDispatcher<{
		speechResult: string;
		listeningChange: boolean;
	}>();

	let transcript = '';
	let error = '';
	let isSupported = false;

	onMount(() => {
		// Initialize speech service and check support
		isSupported = speechService.supported;
		console.log('Speech recognition supported:', isSupported);
	});

	function toggleListening() {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	}
	function startListening() {
		if (!speechService.supported) {
			error = 'Speech recognition is not supported in your browser. Please ensure you are using Chrome, Edge, or Safari and have allowed microphone access.';
			return;
		}

		error = '';
		transcript = '';
		const success = speechService.startListening(
			(text: string, isFinal: boolean) => {
				transcript = text;
				if (isFinal && text.trim()) {
					dispatch('speechResult', text.trim());
					transcript = '';
				}
			},
			(errorMessage: string) => {
				error = errorMessage;
				isListening = false;
				dispatch('listeningChange', false);
			},
			() => {
				isListening = true;
				dispatch('listeningChange', true);
			},
			() => {
				isListening = false;
				dispatch('listeningChange', false);
			}
		);

		if (!success) {
			error = 'Failed to start speech recognition. Please check your microphone permissions.';
		}
	}

	function stopListening() {
		speechService.stopListening();
		isListening = false;
		dispatch('listeningChange', false);
	}

	function clearError() {
		error = '';
	}
</script>

<div class="speech-controls">	{#if !isSupported}
		<div class="error-message">
			<p><strong>Speech recognition is not available.</strong></p>
			<p>This could be due to:</p>
			<ul>
				<li>Using an unsupported browser (Chrome, Edge, or Safari required)</li>
				<li>Not using HTTPS (required for speech recognition)</li>
				<li>Browser security settings blocking microphone access</li>
			</ul>
			<p>Please try:</p>
			<ul>
				<li>Using Chrome, Edge, or Safari</li>
				<li>Allowing microphone permissions when prompted</li>
				<li>Refreshing the page</li>
			</ul>
		</div>
	{:else}
		<div class="controls">
			<button 
				class="mic-button {isListening ? 'listening' : ''}"
				on:click={toggleListening}
				disabled={!isSupported}
				aria-label={isListening ? 'Stop listening' : 'Start listening'}
			>
				{#if isListening}
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM9 12V4a3 3 0 116 0v8a3 3 0 11-6 0z"/>
						<path d="M7 12H5a7 7 0 0014 0h-2a5 5 0 01-10 0z"/>
						<path d="M12 19v2"/>
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
						<path d="M7 12H5a7 7 0 0014 0h-2a5 5 0 01-10 0z"/>
						<path d="M12 19v2"/>
					</svg>
				{/if}
			</button>

			<div class="status">
				{#if isListening}
					<p class="status-text listening">Listening...</p>
					{#if transcript}
						<p class="transcript">{transcript}</p>
					{/if}
				{:else}
					<p class="status-text">Click to speak</p>
				{/if}
			</div>
		</div>

		{#if error}
			<div class="error-message">
				<p>{error}</p>
				<button class="clear-error" on:click={clearError}>
					Dismiss
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.speech-controls {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.mic-button {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
	}

	.mic-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
	}

	.mic-button:active:not(:disabled) {
		transform: scale(0.95);
	}

	.mic-button.listening {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
		animation: pulse 1.5s infinite;
		box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
	}

	.mic-button:disabled {
		background: #ccc;
		cursor: not-allowed;
		box-shadow: none;
	}

	.mic-button svg {
		width: 32px;
		height: 32px;
	}

	.status {
		text-align: center;
		min-height: 60px;
	}

	.status-text {
		font-size: 1.1rem;
		margin: 0;
		font-weight: 500;
		color: #333;
	}

	.status-text.listening {
		color: #ff6b6b;
		animation: blink 1s infinite;
	}

	.transcript {
		font-size: 0.9rem;
		color: #666;
		font-style: italic;
		margin: 0.5rem 0 0 0;
		padding: 0.5rem;
		background: rgba(102, 126, 234, 0.1);
		border-radius: 0.5rem;
		border-left: 3px solid #667eea;
	}
	.error-message {
		background: rgba(255, 107, 107, 0.1);
		border: 1px solid rgba(255, 107, 107, 0.3);
		border-radius: 0.5rem;
		padding: 1rem;
		margin-top: 1rem;
		text-align: left;
	}

	.error-message p {
		margin: 0 0 0.5rem 0;
		color: #d63031;
		font-size: 0.9rem;
	}

	.error-message ul {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
		color: #d63031;
		font-size: 0.85rem;
	}

	.error-message li {
		margin-bottom: 0.25rem;
	}

	.clear-error {
		background: #ff6b6b;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.8rem;
		transition: background 0.2s ease;
	}

	.clear-error:hover {
		background: #ee5a24;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}

	@keyframes blink {
		0%, 50% {
			opacity: 1;
		}
		51%, 100% {
			opacity: 0.5;
		}
	}

	@media (max-width: 768px) {
		.speech-controls {
			padding: 1rem;
		}

		.mic-button {
			width: 60px;
			height: 60px;
		}

		.mic-button svg {
			width: 24px;
			height: 24px;
		}

		.status-text {
			font-size: 1rem;
		}
	}
</style>
