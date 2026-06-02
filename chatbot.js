(() => {
  const chatbot = document.querySelector("[data-chatbot]");

  if (!chatbot) {
    return;
  }

  const log = chatbot.querySelector("[data-chat-log]");
  const form = chatbot.querySelector("[data-chat-form]");
  const input = chatbot.querySelector("[data-chat-input]");
  const sendButton = chatbot.querySelector("[data-chat-send]");
  const feedback = chatbot.querySelector("[data-chat-feedback]");

  if (!log || !form || !input || !sendButton || !feedback) {
    return;
  }

  const endpoint = chatbot.dataset.chatEndpoint?.trim();

  const setFeedback = (message = "") => {
    feedback.textContent = message;
    feedback.classList.toggle("is-visible", Boolean(message));
  };

  const scrollToBottom = () => {
    log.scrollTop = log.scrollHeight;
  };

  const createMessage = (role, text, isTyping = false) => {
    const row = document.createElement("div");
    row.className = `chat-row chat-row--${role}`;

    if (role === "bot") {
      const author = document.createElement("span");
      author.className = "chat-author";
      author.textContent = "FRAM";
      row.appendChild(author);
    }

    const bubble = document.createElement("p");
    bubble.className = `chat-bubble chat-bubble--${role}`;

    if (isTyping) {
      bubble.classList.add("chat-bubble--typing");
      bubble.textContent = "...";
    } else {
      bubble.textContent = text;
    }

    row.appendChild(bubble);
    return row;
  };

  const addMessage = (role, text) => {
    const message = createMessage(role, text);
    log.appendChild(message);
    scrollToBottom();
  };

  const fallbackReply = (message) => {
    const lower = message.toLowerCase();

    const pickReply = (replies) => replies[Math.floor(Math.random() * replies.length)];

    if (/(farm|partner|gård|gard|source|where)/.test(lower)) {
      return pickReply([
        "We work with local partner farms selected for quality, seasonal produce and reliable delivery.",
        "Our partner farms are mostly small and medium local farms with a focus on sustainable methods.",
        "We choose farms based on freshness, transparent production and stable weekly availability.",
        "Most farms are located close to our delivery area, so produce can be packed shortly after harvest."
      ]);
    }

    if (/(produce|vegetable|fruit|season|fresh|stock)/.test(lower)) {
      return pickReply([
        "Our produce selection changes with the season, so you’ll always see what is freshest right now.",
        "We update available produce continuously, depending on harvest and farm supply.",
        "If an item is out of stock, it usually returns quickly when the next harvest is ready.",
        "You can find current produce and weights on the products page before ordering."
      ]);
    }

    if (/(order|checkout|cart|basket|payment|pay)/.test(lower)) {
      return pickReply([
        "You can place an order directly from the products page and complete it at checkout.",
        "At checkout, you’ll see available slots and a full order summary before confirming.",
        "You can add or remove products in your basket before final payment.",
        "After placing an order, we start preparing it based on farm availability and delivery window."
      ]);
    }

    if (/(delivery|levering|time|when|slot)/.test(lower)) {
      return pickReply([
        "Delivery slots are shown at checkout. Most orders are delivered in the afternoon on selected days.",
        "We group deliveries by area to reduce transport and keep produce fresher during transit.",
        "You can choose the nearest available delivery slot before confirming your order.",
        "If a slot is full, new delivery windows usually open as route capacity updates."
      ]);
    }

    if (/(price|cost|kr|dyrt|billig)/.test(lower)) {
      return "Our prices vary by season and supplier, but we keep pricing transparent for all items.";
    }

    return "Thanks for your question. I can help with farms, produce, orders and delivery.";
  };

  const getReply = async (message) => {
    if (!endpoint) {
      return fallbackReply(message);
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";

      if (!reply) {
        throw new Error("Invalid reply");
      }

      return reply;
    } finally {
      window.clearTimeout(timeout);
    }
  };

  const setSending = (sending) => {
    input.disabled = sending;
    sendButton.disabled = sending;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
      return;
    }

    setFeedback("");
    addMessage("user", message);
    input.value = "";
    setSending(true);

    const typingMessage = createMessage("bot", "", true);
    log.appendChild(typingMessage);
    scrollToBottom();

    try {
      const reply = await getReply(message);
      typingMessage.remove();
      addMessage("bot", reply);
    } catch {
      typingMessage.remove();
      setFeedback("Failed to connect. Wait and try again later.");
    } finally {
      setSending(false);
      input.focus();
      scrollToBottom();
    }
  });
})();
