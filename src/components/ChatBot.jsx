import { Bot, ChevronLeft, SendHorizontal } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/ChatBot.css";
import Loader from "./Loader";
import { API_URL, Info } from "../utils/Constants";
import { FormatResponse } from "./FormatResponse";

const ChatBot = () => {
  const [isChatBot, setIsChatBot] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, isChatBot]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target)
      ) {
        setIsChatBot(false);
      }
    };

    if (isChatBot) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatBot]);

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
    setTimeout(() => {
      setSendLoading(false);
    }, 300);
    setResponseLoading(true);

    try {
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

//       const payload = {
//         contents: [
//           {
//             parts: [
//               {
//                 text: `You are a QMC AI assistant. ONLY provide information about Qila Mobile Center (QMC) products, services, store hours, location, or contact info. 
// If the user asks something outside of QMC, DO NOT generate your own explanation. Instead, return: "Sorry, I couldn't understand that. How can I help you today? Do you have any questions about our products, store hours, location, or anything else related to QMC?"

// Here is the QMC info for context:
// ${Info}

// User: ${input}`,
//               },
//             ],
//           },
//         ],
//       };

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

      const botMessage = {
        by: "bot",
        message: aiMessageText,
        createdAt: new Date().toString(),
      };

      setChats((prev) => [...prev, botMessage]);
      setResponseLoading(false);
    } catch (error) {
      console.error("AI API error:", error);
      const errorMessage = {
        by: "bot",
        message: "Something went wrong. Please try again later.",
        createdAt: new Date().toString(),
      };
      setChats((prev) => [...prev, errorMessage]);
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
