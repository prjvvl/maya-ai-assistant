<script lang="ts">	import type { Message } from './types';
	import { afterUpdate, createEventDispatcher } from 'svelte';

	export let messages: Message[] = [];
	export let isLoading = false;

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

	// Scroll to bottom after each update
	afterUpdate(() => {
		scrollToBottom();
	});
</script>

<div class="chat-container">
	{#if messages.length > 0}
		<div class="chat-header">		<button class="new-chat-btn" on:click={startNewChat} title="Start new conversation">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 5v14m-7-7h14"/>
			</svg>
			New Chat
		</button>
		</div>
	{/if}
	
	<div class="messages" bind:this={messagesContainer}>
		{#if messages.length === 0}
			<div class="welcome-message">
				<h2>Welcome to Maya.IO!</h2>
				<p>Click the microphone button and start speaking to begin your conversation.</p>
			</div>
		{/if}

		{#each messages as message (message.id)}
			<div class="message {message.sender}">
				<div class="message-content">
					<div class="message-text">{message.text}</div>
					<div class="message-time">{formatTime(message.timestamp)}</div>
				</div>
			</div>
		{/each}

		{#if isLoading}
			<div class="message assistant">
				<div class="message-content">
					<div class="typing-indicator">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>	.chat-container {
		flex: 1;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 1rem;
		padding: 1rem;
		margin-bottom: 1rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.chat-header {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.new-chat-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.new-chat-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.new-chat-btn:active {
		transform: translateY(0);
	}

	.new-chat-btn svg {
		width: 14px;
		height: 14px;
	}

	.chat-header {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.new-chat-btn {
		background: #667eea;
		color: white;
		border: none;
		border-radius: 1rem;
		padding: 0.5rem 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: background 0.3s;
	}

	.new-chat-btn:hover {
		background: #5a6fdb;
	}

	.messages {
		height: 400px;
		overflow-y: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.welcome-message {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.welcome-message h2 {
		margin: 0 0 1rem 0;
		color: #333;
	}

	.welcome-message p {
		margin: 0;
		font-size: 1.1rem;
	}

	.message {
		display: flex;
		max-width: 80%;
	}

	.message.user {
		align-self: flex-end;
		justify-content: flex-end;
	}

	.message.assistant {
		align-self: flex-start;
		justify-content: flex-start;
	}

	.message-content {
		background: white;
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		position: relative;
	}

	.message.user .message-content {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.message.assistant .message-content {
		background: #f8f9fa;
		color: #333;
	}

	.message-text {
		line-height: 1.4;
		margin-bottom: 0.25rem;
	}

	.message-time {
		font-size: 0.75rem;
		opacity: 0.7;
		text-align: right;
	}

	.message.assistant .message-time {
		text-align: left;
	}

	.typing-indicator {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0;
	}

	.typing-indicator span {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #666;
		animation: typing 1.4s infinite ease-in-out;
	}

	.typing-indicator span:nth-child(1) {
		animation-delay: -0.32s;
	}

	.typing-indicator span:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes typing {
		0%, 80%, 100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Scrollbar styling */
	.messages::-webkit-scrollbar {
		width: 6px;
	}

	.messages::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	.messages::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.3);
	}

	@media (max-width: 768px) {
		.messages {
			height: 300px;
		}

		.message {
			max-width: 90%;
		}

		.welcome-message {
			padding: 1rem;
		}
	}
</style>
