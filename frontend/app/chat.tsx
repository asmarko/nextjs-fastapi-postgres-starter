"use client";

import { useState, useEffect } from "react";

interface Message {
    sender: "user" | "bot";
    text: string;
  }

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect(() => {
        // For now, just hardcode to only support a single user.
        const ws = new WebSocket("ws://localhost:8000/ws");
        
        ws.onmessage = (event) => {
            setMessages((prev) => [...prev, { sender: "bot", text: event.data }]);
        };

        setSocket(ws);

        return () => ws.close();
    }, []);
    
    const sendMessage = () => {
        if (input.trim() && socket) {
            socket.send(input);
            setMessages((messages) => [...messages, { sender: "user", text: input }]);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-white shadow-lg rounded-lg flex flex-col">
                <div className="bg-lime-700 text-white text-lg font-bold py-3 px-4 rounded-t-lg text-center">
                    Chatbot
                </div>

                <div className="flex-1 overflow-y-auto p-4 h-96 space-y-2">
                {messages.map((msg, index) => (
                    <div
                    key={index}
                    className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                    >
                    <div
                        className={`p-3 rounded-lg max-w-xs text-sm ${
                        msg.sender === "user"
                            ? "bg-lime-700 text-white self-end"
                            : "bg-gray-200 text-gray-900"
                        }`}
                    >
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                    </div>
                ))}
                </div>

                <div className="flex border-t p-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 p-2 border rounded-l-md focus:outline-none"
                    placeholder="Type your message..."
                />
                <button
                    onClick={sendMessage}
                    className="bg-lime-700 text-white px-4 py-2 rounded-r-md hover:bg-lime-900 transition"
                >
                    Send
                </button>
                </div>
            </div>
        </div>
    );
}