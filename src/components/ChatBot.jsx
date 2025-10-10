import { Bot, ChevronLeft, SendHorizontal } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import "../assets/styles/ChatBot.css";
import Loader from "./Loader";
import { API_URL } from "../utils/Constants";
import { FormatResponse } from "./FormatResponse";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../utils/FirebaseConfig";

const ChatBot = () => {
  const [isChatBot, setIsChatBot] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(() => {
    const savedChats = sessionStorage.getItem("qmcChats");
    return savedChats ? JSON.parse(savedChats) : [];
  });
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "42px";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const snapshot = await getDocs(collection(db, "ADMIN"));
        if (!snapshot.empty) {
          setAdminInfo(snapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    fetchAdminInfo();
  }, []);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "USERS"));
        const sellerList = snapshot.docs
          .map((doc) => doc.data())
          .filter((user) => user.role === "seller" && user.isActive);
        setSellers(sellerList);
      } catch (error) {
        console.error("Error fetching sellers:", error);
      }
    };
    fetchSellers();
  }, []);

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

  useEffect(() => {
    sessionStorage.setItem("qmcChats", JSON.stringify(chats));
    scrollToBottom();
  }, [chats]);

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
    if (isChatBot) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatBot]);

  const getShopStatusText = (isSwitch) => {
    return isSwitch
      ? "🟢 Qila Mobile Center is currently Open."
      : "🔴 Qila Mobile Center is currently Closed.";
  };

  const infoText = adminInfo
    ? `
Introduction:
I'm your friendly QMC chatbot, here to assist you with anything you need related to our electronics store! Whether you're looking for information about our products, business hours, or tech guidance, I'm here to help.

Owner Details:
- Name: ${adminInfo.name}
- Email: ${adminInfo.email}
- Phone: ${adminInfo.phoneNumber}

Full Form: Qila Mobile Center (QMC)

Details:
Qila Mobile Center (QMC) is your ultimate destination for high-quality electronic devices and accessories. 

📍 Location: ${adminInfo.location}
🕒 Regular Hours: ${formatTime(adminInfo.shopOpenTime)} to ${formatTime(
        adminInfo.shopEndTime
      )}
🕌 Friday Hours: ${formatTime(adminInfo.shopFriOpenTime)} to ${formatTime(
        adminInfo.shopFriEndTime
      )}
🏪 Current Status: ${getShopStatusText(adminInfo.isSwitch)}
💬 Note: ${adminInfo.impNote || "We're always here to assist you!"}

Stay connected:
- Facebook: https://facebook.com/qmc
- Instagram: https://instagram.com/qmc
- Twitter: https://twitter.com/qmc
- LinkedIn: https://linkedin.com/company/qmc

Website: https://qmc-teal.vercel.app
Email: qmc@gmail.com
Phone: +1 (555) 123-4567

============================
Products:
${
  products.length
    ? products
        .map((p, i) => `${i + 1}. ${p.name} — Rs ${p.price}`)
        .slice(0, 20)
        .join("\n")
    : "No devices available at the moment."
}

============================
Sellers:
${
  sellers.length
    ? sellers
        .map(
          (s, i) =>
            `${i + 1}. ${s.name || "N/A"} — ${s.email || "No email"} — ${
              s.phoneNumber || "No phone"
            }`
        )
        .join("\n")
    : "No active sellers found."
}
============================
`
    : "Loading QMC information...";

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      by: "user",
      message: input,
      createdAt: new Date().toString(),
    };

    setChats((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "42px";
    }
    setSendLoading(true);
    setTimeout(() => setSendLoading(false), 300);
    setResponseLoading(true);

    try {
      const rangeMatch = input.match(/(\d{2,})\D+(\d{2,})/);
      if (rangeMatch) {
        const min = Number(rangeMatch[1]);
        const max = Number(rangeMatch[2]);
        const filtered = products.filter(
          (p) => p.price >= min && p.price <= max
        );

        const aiMessageText = filtered.length
          ? `Certainly! Here are the devices available at QMC within the price range of Rs ${min.toLocaleString()} to Rs ${max.toLocaleString()}:\n\n${filtered
              .map((p, index) => `${index + 1}. ${p.name} — Rs ${p.price}`)
              .join("\n\n")}`
          : `Sorry, no devices were found in the price range of Rs ${min.toLocaleString()} to Rs ${max.toLocaleString()}.`;

        setChats((prev) => [
          ...prev,
          {
            by: "bot",
            message: aiMessageText,
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
                text: `You are QMC AI assistant. Use the following information to answer the user's question:\n${infoText}\n\nUser: ${input}`,
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
            {/*
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="chatbot-input"
            /> */}
            <textarea
              placeholder="Type your question..."
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="chatbot-textarea"
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
