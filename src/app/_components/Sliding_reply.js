import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const Sliding_reply = ({messages}) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello!", replyTo: null },
    { id: 2, text: "How are you?", replyTo: null },
  ]);
  const [replyMessage, setReplyMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, text: newMessage, replyTo: replyMessage },
      ]);
      setNewMessage("");
      setReplyMessage(null);
    }
  };

  const handleSwipeReply = (message) => {
    setReplyMessage(message);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border rounded-lg shadow-lg">
      <div className="h-64 overflow-y-auto space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="relative">
            <motion.div
              className="p-2 border rounded bg-gray-100"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(event, info) => {
                if (info.offset.x < -50) handleSwipeReply(msg);
              }}
            >
              {msg.replyTo && (
                <div className="text-sm text-gray-500 border-l-2 pl-2 mb-1">
                  Replying to: {msg.replyTo.text}
                </div>
              )}
              {msg.text}
            </motion.div>
          </div>
        ))}
      </div>
      {replyMessage && (
        <div className="p-2 bg-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Replying to: {replyMessage.text}</span>
          </div>
          <button onClick={() => setReplyMessage(null)} className="text-red-500">X</button>
        </div>
      )}
      <div className="mt-2 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">
          Send
        </button>
      </div>
    </div>
  );
};

export default Sliding_reply;