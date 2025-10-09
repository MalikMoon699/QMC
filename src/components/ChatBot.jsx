import { Bot, ChevronLeft, SendHorizontal } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/ChatBot.css";
import Loader from "./Loader";
import { API_URL, Info } from "../utils/Constants";
import { FormatResponse } from "./FormatResponse";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";

const ChatBot = () => {
  const [isChatBot, setIsChatBot] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [products, setProducts] = useState([]);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, isChatBot]);

  // Fetch products dynamically from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const categories = ["SMARTDEVICES", "ACCESSORIES"];
        let allProducts = [];

        for (const category of categories) {
          const snapshot = await getDocs(collection(db, category));
          const categoryProducts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: `${data.brandName || ""} ${data.deviceModel || ""}`.trim(),
              price: data.price || 0,
              category,
            };
          });
          allProducts = [...allProducts, ...categoryProducts];
        }

        setProducts(allProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target)
      ) {
        setIsChatBot(false);
      }
    };

    if (isChatBot) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatBot]);

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      by: "user",
      message: input,
      createdAt: new Date().toString(),
    };

    setChats((prev) => [...prev, userMessage]);
    setInput("");
    setSendLoading(true);
    setTimeout(() => setSendLoading(false), 300);
    setResponseLoading(true);

    try {
      const sellerRegex = /\b(show|view)\s*(me\s*)?(your\s*)?sellers?\b/i;
      if (sellerRegex.test(input)) {
        const snapshot = await getDocs(collection(db, "USERS"));
        const sellers = snapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.role === "seller" && user.isActive);

        const messageText = sellers.length
          ? "Here are the active sellers:\n" +
            sellers
              .map(
                (s, index) =>
                  `${index + 1}. Name: ${s.name},\n\n   Email: ${
                    s.email
                  },\n\n   Phone: ${s.phoneNumber}`
              )
              .join("\n\n")
          : "No active sellers found.";

        setChats((prev) => [
          ...prev,
          { by: "bot", message: messageText, createdAt: new Date().toString() },
        ]);
        setResponseLoading(false);
        return;
      }

      const priceRangeMatch = input.match(/(\d+)\s*to\s*(\d+)/i);
      const maxPriceMatch = /best device|max price/i.test(input);

      if (priceRangeMatch) {
        const min = parseInt(priceRangeMatch[1]);
        const max = parseInt(priceRangeMatch[2]);
        const filtered = products.filter(
          (p) =>
            p.price >= min &&
            p.price <= max
        );

        const messageText = filtered.length
          ? `Here are devices in the range Rs ${min} to Rs ${max}:\n` +
            filtered
              .map((p, index) => `${index + 1}. ${p.name} - Rs ${p.price}`)
              .join("\n")
          : `Sorry, we don't have devices in the range Rs ${min} to Rs ${max}.`;

        setChats((prev) => [
          ...prev,
          { by: "bot", message: messageText, createdAt: new Date().toString() },
        ]);
        setResponseLoading(false);
        return;
      }

      if (maxPriceMatch) {
        if (products.length === 0) {
          setChats((prev) => [
            ...prev,
            {
              by: "bot",
              message: "No products available right now.",
              createdAt: new Date().toString(),
            },
          ]);
          setResponseLoading(false);
          return;
        }

        const maxDevice = products.reduce((prev, curr) =>
          curr.price > prev.price ? curr : prev
        );

        setChats((prev) => [
          ...prev,
          {
            by: "bot",
            message: `The most expensive device we have is ${maxDevice.name} at Rs ${maxDevice.price}.`,
            createdAt: new Date().toString(),
          },
        ]);
        setResponseLoading(false);
        return;
      }

      const payload = {
        contents: [
          {
            parts: [
              {
                text: `You are QMC AI assistant. Use the following information to answer the user's question:\n${Info}\n\nUser: ${input}`,
              },
            ],
          },
        ],
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const rawAiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      const fallbackText =
        "Sorry, I couldn't understand that. How can I help you today? Do you have any questions about our products, store hours, location, or anything else related to QMC?";

      const lowerText = rawAiText.toLowerCase();

      const aiMessageText =
        !rawAiText ||
        lowerText.includes("outside my area of expertise") ||
        lowerText.includes("beyond my capabilities") ||
        lowerText.includes("can't help you") ||
        lowerText.includes("cannot help")
          ? fallbackText
          : rawAiText;

      setChats((prev) => [
        ...prev,
        { by: "bot", message: aiMessageText, createdAt: new Date().toString() },
      ]);
      setResponseLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setChats((prev) => [
        ...prev,
        {
          by: "bot",
          message: "Something went wrong. Please try again later.",
          createdAt: new Date().toString(),
        },
      ]);
      setResponseLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isChatBot && (
        <div className="chatbot-container" ref={chatContainerRef}>
          <div className="chatbot-header">
            <button
              className="chatbot-back-btn"
              onClick={() => setIsChatBot(false)}
            >
              <ChevronLeft />
            </button>
            <div className="chatbot-title">
              <Bot /> <span>AI Assistant</span>
            </div>
            <div className="chatbot-header-extra"></div>
          </div>

          <div className="chatbot-messages" ref={messagesEndRef}>
            <div className="chat-message bot-message">
              <p>Hey there 👋</p>
              <p>How can I help you today?</p>
            </div>

            {chats.map((item, index) => (
              <div
                key={index}
                className={`chat-message ${
                  item.by === "bot" ? "bot-message" : "user-message"
                }`}
              >
                {item.message && <FormatResponse text={item.message} />}
              </div>
            ))}

            {responseLoading && (
              <div className="chat-message bot-message">
                <Loader size="30" className="" />
              </div>
            )}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="chatbot-input"
            />
            <button onClick={handleSend} className="chatbot-send-btn">
              {sendLoading ? (
                <Loader
                  loading={true}
                  size="20"
                  style={{ height: "24px", width: "24px" }}
                  color="white"
                  className=""
                />
              ) : (
                <SendHorizontal />
              )}
            </button>
          </div>
          <span className="chat-bot-corner"></span>
        </div>
      )}

      <div className="chatbot-icon" onClick={() => setIsChatBot(!isChatBot)}>
        <Bot />
      </div>
    </div>
  );
};

export default ChatBot;
