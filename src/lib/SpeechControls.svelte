<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
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
			error =
				'Speech recognition is not supported in your browser. Please ensure you are using Chrome, Edge, or Safari and have allowed microphone access.';
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

<div class="speech-controls">
	{#if !isSupported}
		<div class="error-message">
			<div class="error-icon">⚠️</div>
			<div class="error-content">
				<p><strong>Speech recognition unavailable</strong></p>
				<details>
					<summary>What can I try?</summary>
					<ul>
						<li>Use Chrome, Edge, or Safari</li>
						<li>Allow microphone permissions</li>
						<li>Ensure you're using HTTPS</li>
						<li>Refresh the page</li>
					</ul>
				</details>
			</div>
		</div>
	{:else}
		<div class="controls">
			{#if transcript && isListening}
				<div class="transcript-preview">
					<div class="transcript-text">{transcript}</div>
					<div class="wave-indicator">
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			{/if}

			<div class="input-row">
				<button
					class="mic-button {isListening ? 'listening' : ''}"
					on:click={toggleListening}
					disabled={!isSupported}
					aria-label={isListening ? 'Stop listening' : 'Start listening'}
				>
					{#if isListening}
						<svg viewBox="0 0 24 24" fill="currentColor">
							<rect x="6" y="6" width="12" height="12" rx="2" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
							<path d="M7 12H5a7 7 0 0014 0h-2a5 5 0 01-10 0z" />
							<path d="M12 19v2" />
						</svg>
					{/if}
				</button>

				<div class="status-text">
					{#if isListening}
						<span class="listening-text">Listening...</span>
					{:else}
						<span class="idle-text">Tap to speak</span>
					{/if}
				</div>
			</div>
		</div>

		{#if error}
			<div class="error-banner">
				<span class="error-text">{error}</span>
				<button class="clear-error" on:click={clearError}>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.speech-controls {
		width: 100%;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.transcript-preview {
		background: #f1f5f9;
		border: 1px solid #e2e8f0;
		border-radius: 1rem;
		padding: 0.75rem 1rem;
		margin-bottom: 0.5rem;
		position: relative;
		animation: slideUp 0.3s ease-out;
	}

	.transcript-text {
		font-size: 0.9rem;
		color: #475569;
		line-height: 1.4;
		margin-bottom: 0.5rem;
	}

	.wave-indicator {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		justify-content: center;
	}

	.wave-indicator span {
		width: 3px;
		height: 12px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 2px;
		animation: wave 1.2s infinite ease-in-out;
	}

	.wave-indicator span:nth-child(1) {
		animation-delay: -0.4s;
	}
	.wave-indicator span:nth-child(2) {
		animation-delay: -0.3s;
	}
	.wave-indicator span:nth-child(3) {
		animation-delay: -0.2s;
	}
	.wave-indicator span:nth-child(4) {
		animation-delay: -0.1s;
	}

	.input-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.mic-button {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
		flex-shrink: 0;
	}

	.mic-button:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.mic-button:active:not(:disabled) {
		transform: scale(0.95);
	}

	.mic-button.listening {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		animation: pulse-mic 1.5s infinite;
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
	}

	.mic-button:disabled {
		background: #9ca3af;
		cursor: not-allowed;
		box-shadow: none;
	}

	.mic-button svg {
		width: 24px;
		height: 24px;
	}

	.status-text {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.listening-text {
		color: #ef4444;
		font-weight: 500;
		animation: fadeIn 0.3s ease-out;
	}

	.idle-text {
		color: #6b7280;
	}

	/* Error States */
	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.error-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.error-content {
		flex: 1;
	}

	.error-content p {
		margin: 0 0 0.5rem 0;
		color: #991b1b;
		font-size: 0.9rem;
	}

	.error-content details {
		margin-top: 0.5rem;
	}

	.error-content summary {
		color: #991b1b;
		font-size: 0.85rem;
		cursor: pointer;
		font-weight: 500;
	}

	.error-content ul {
		margin: 0.5rem 0 0 0;
		padding-left: 1.25rem;
		color: #991b1b;
		font-size: 0.8rem;
	}

	.error-content li {
		margin-bottom: 0.25rem;
	}

	.error-banner {
		background: #fef2f2;
		border: 1px solid #fecaca;
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		margin-top: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		animation: slideDown 0.3s ease-out;
	}

	.error-text {
		color: #991b1b;
		font-size: 0.85rem;
		flex: 1;
	}

	.clear-error {
		background: none;
		border: none;
		color: #991b1b;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: background 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.clear-error:hover {
		background: rgba(239, 68, 68, 0.1);
	}

	/* Animations */
	@keyframes wave {
		0%,
		40%,
		100% {
			transform: scaleY(0.4);
		}
		20% {
			transform: scaleY(1);
		}
	}

	@keyframes pulse-mic {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.mic-button {
			width: 48px;
			height: 48px;
		}

		.mic-button svg {
			width: 20px;
			height: 20px;
		}

		.transcript-preview {
			padding: 0.5rem 0.75rem;
		}

		.transcript-text {
			font-size: 0.85rem;
		}

		.status-text {
			font-size: 0.9rem;
		}

		.error-banner {
			padding: 0.5rem 0.75rem;
		}

		.error-text {
			font-size: 0.8rem;
		}
	}

	/* Touch targets for mobile */
	@media (max-width: 768px) {
		.mic-button {
			min-height: 44px;
			min-width: 44px;
		}

		.clear-error {
			min-height: 32px;
			min-width: 32px;
		}
	}
</style>
