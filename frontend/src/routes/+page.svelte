<script lang="ts">
  let messages: { sender: "user" | "ai"; text: string }[] = [];
  let input = "";
  let loading = false;
  let sessionId: string | null = null;

  async function sendMessage() {
    if (!input.trim() || loading) return;

    messages = [...messages, { sender: "user", text: input }];
    loading = true;

    const res = await fetch("http://localhost:4000/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        sessionId,
      }),
    });

    const data = await res.json();
    sessionId = data.sessionId;

    messages = [...messages, { sender: "ai", text: data.reply }];
    input = "";
    loading = false;
  }
</script>

<style>
  .chat {
    max-width: 500px;
    margin: auto;
    border: 1px solid #ddd;
    padding: 1rem;
  }
  .user { text-align: right; color: blue; }
  .ai { text-align: left; color: green; }
</style>

<div class="chat">
  {#each messages as msg}
    <div class={msg.sender}>
      <p>{msg.text}</p>
    </div>
  {/each}

  {#if loading}
    <p><em>Agent is typing...</em></p>
  {/if}

  <input
    bind:value={input}
    on:keydown={(e) => e.key === "Enter" && sendMessage()}
    placeholder="Type your message..."
  />
  <button on:click={sendMessage} disabled={loading}>Send</button>
</div>
