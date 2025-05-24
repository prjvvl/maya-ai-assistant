<script lang="ts">
	import type { Message } from './types';
	import { afterUpdate, createEventDispatcher, onMount } from 'svelte';
	import SpeechControls from './SpeechControls.svelte';

	export let messages: Message[] = [];
	export let isLoading = false;
	export let isListening = false;

	const dispatch = createEventDispatcher();
	let messagesContainer: HTMLElement;

	function formatTime(date: Date): string {
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}

	function scrollToBottom() {
		if (messagesContainer) {
			messagesContainer.scrollTo({
				top: messagesContainer.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	function startNewChat() {
		dispatch('newChat');
	}

	function handleSpeechResult(event: CustomEvent) {
		dispatch('speechResult', event.detail);
	}

	function handleListeningChange(event: CustomEvent) {
		dispatch('listeningChange', event.detail);
	}

	// Scroll to bottom after each update
	afterUpdate(() => {
		scrollToBottom();
	});
</script>

<div class="chat-app">
	<!-- Header -->
	<div class="chat-header">
		<div class="header-background"></div>
		<div class="header-content">
			<div class="app-info">
				<div class="app-logo">
					<div class="logo-icon">
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
							<path
								d="M8 12l2 2 4-4"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</div>
					<div class="app-title">
						<h1>Maya.IO</h1>
						<span class="subtitle">AI Assistant</span>
					</div>
				</div>
				<div class="status-indicator">
					<span class="status-dot {isListening ? 'listening' : 'idle'}"></span>
					<span class="status-text">{isListening ? 'Listening...' : 'Ready'}</span>
				</div>
			</div>
			{#if messages.length > 0}
				<button class="new-chat-btn" on:click={startNewChat} title="Start new conversation">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M12 5v14m-7-7h14" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Messages -->
	<div class="messages-container" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="welcome-message">
				<div class="welcome-icon">👋</div>
				<h2>Hi there!</h2>
				<p>
					I'm Maya, your AI assistant. Tap the microphone below and start speaking to begin our
					conversation.
				</p>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div class="message-wrapper {message.sender}">
				<div class="message-bubble">
					<div class="message-text">{message.text}</div>
					<div class="message-time">{formatTime(message.timestamp)}</div>
				</div>
			</div>
		{/each}

		{#if isLoading}
			<div class="message-wrapper assistant">
				<div class="message-bubble">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input Area -->
	<div class="input-area">
		<SpeechControls
			{isListening}
			on:speechResult={handleSpeechResult}
			on:listeningChange={handleListeningChange}
		/>
	</div>
</div>

<style>
	.chat-app {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		overflow: hidden;
	} /* Header */
	.chat-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
		color: white;
		padding: 1.5rem 1rem;
		box-shadow:
			0 4px 20px rgba(102, 126, 234, 0.3),
			0 8px 40px rgba(118, 75, 162, 0.2);
		z-index: 10;
		flex-shrink: 0;
		position: sticky;
		top: 0;
		overflow: hidden;
		position: relative;
		animation: slideInDown 0.6s ease-out;
	}

	.header-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
		pointer-events: none;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 100%;
		position: relative;
		z-index: 1;
	}

	.app-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.app-logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo-icon {
		width: 32px;
		height: 32px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.logo-icon svg {
		width: 20px;
		height: 20px;
		color: white;
	}

	.app-title {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		line-height: 1;
	}

	.app-title h1 {
		margin: 0;
		font-size: 1.75rem;
		font-weight: 700;
		background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		letter-spacing: -0.025em;
	}

	.subtitle {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 400;
		margin-top: 2px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 0.75rem;
		border-radius: 20px;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		transition: all 0.3s ease;
	}

	.status-indicator:hover {
		background: rgba(255, 255, 255, 0.15);
		transform: translateY(-1px);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		transition: all 0.3s ease;
		position: relative;
	}

	.status-dot.idle {
		background: rgba(255, 255, 255, 0.6);
	}

	.status-dot.listening {
		background: #4ade80;
		box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
		animation: pulse-glow 1.5s infinite;
	}

	.status-dot.listening::after {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		border-radius: 50%;
		background: rgba(74, 222, 128, 0.3);
		animation: pulse-ring 1.5s infinite;
	}

	.status-text {
		font-size: 0.75rem;
		font-weight: 500;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 60px;
	}

	.new-chat-btn {
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.75rem;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}

	.new-chat-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.new-chat-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.new-chat-btn:hover::before {
		left: 100%;
	}

	.new-chat-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	@keyframes pulse-glow {
		0%,
		100% {
			box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
		}
		50% {
			box-shadow:
				0 0 16px rgba(74, 222, 128, 0.8),
				0 0 24px rgba(74, 222, 128, 0.4);
		}
	}

	@keyframes pulse-ring {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	@keyframes slideInDown {
		0% {
			opacity: 0;
			transform: translateY(-20px);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
		}
	}
	/* Messages */
	.messages-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 1rem;
		background: #f8f9fa;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 0;
	}

	.welcome-message {
		text-align: center;
		color: #6b7280;
		padding: 2rem 1rem;
		margin: auto 0;
	}

	.welcome-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.welcome-message h2 {
		margin: 0 0 1rem 0;
		color: #374151;
		font-size: 1.5rem;
		font-weight: 600;
	}

	.welcome-message p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.5;
		max-width: 300px;
		margin: 0 auto;
	}

	.message-wrapper {
		display: flex;
		margin-bottom: 0.5rem;
	}

	.message-wrapper.user {
		justify-content: flex-end;
	}

	.message-wrapper.assistant {
		justify-content: flex-start;
	}

	.message-bubble {
		max-width: 80%;
		padding: 0.75rem 1rem;
		border-radius: 1.25rem;
		position: relative;
		word-wrap: break-word;
	}

	.message-wrapper.user .message-bubble {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-bottom-right-radius: 0.5rem;
	}

	.message-wrapper.assistant .message-bubble {
		background: white;
		color: #374151;
		border: 1px solid #e5e7eb;
		border-bottom-left-radius: 0.5rem;
	}

	.message-text {
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	.message-time {
		font-size: 0.7rem;
		opacity: 0.7;
		text-align: right;
	}

	.message-wrapper.assistant .message-time {
		text-align: left;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0;
	}

	.typing-indicator span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #9ca3af;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: -0.16s;
	}
	/* Input Area */
	.input-area {
		background: white;
		border-top: 1px solid #e5e7eb;
		padding: 1rem;
		flex-shrink: 0;
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	/* Animations */
	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.2);
		}
	}

	@keyframes typing {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Scrollbar styling */
	.messages-container::-webkit-scrollbar {
		width: 4px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 2px;
	}
	/* Mobile optimizations */
	@media (max-width: 480px) {
		.chat-header {
			padding: 1rem 0.75rem;
		}

		.app-info {
			gap: 0.75rem;
		}

		.app-logo {
			gap: 0.5rem;
		}

		.logo-icon {
			width: 28px;
			height: 28px;
			border-radius: 10px;
		}

		.logo-icon svg {
			width: 18px;
			height: 18px;
		}

		.app-title h1 {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 0.7rem;
		}

		.status-indicator {
			padding: 0.4rem 0.6rem;
			border-radius: 16px;
		}

		.status-text {
			font-size: 0.7rem;
			min-width: 50px;
		}

		.new-chat-btn {
			width: 40px;
			height: 40px;
			padding: 0.6rem;
		}

		.messages-container {
			padding: 0.75rem;
		}

		.message-bubble {
			max-width: 85%;
		}

		.welcome-message {
			padding: 1.5rem 1rem;
		}

		.welcome-icon {
			font-size: 2.5rem;
		}

		.welcome-message h2 {
			font-size: 1.25rem;
		}

		.input-area {
			padding: 0.75rem;
		}
	}

	/* Tablet and desktop */
	@media (min-width: 768px) {
		.message-bubble {
			max-width: 70%;
		}
	}
</style>
