// Components/SlidingReply.jsx
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export const SlidingReply = ({ message, onSwipeReply, isCurrentUser }) => {
  return (
    <motion.div
      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
      drag="x"
      dragConstraints={{ left: -100, right: 0 }} // Allow left swipe
      onDragEnd={(_, info) => {
        if (info.offset.x < -50) onSwipeReply(message);
      }}
    >
      {/* Add user avatar for received messages */}
      {!isCurrentUser && (
        <Image
          src="/heart.png"
          alt="User"
          width={24}
          height={24}
          className="mr-1.5 h-6 w-6 rounded-full bg-purple-500 p-1 hidden sm:block"
        />
      )}

      <div
        className={`py-1.5 px-2.5 sm:py-2 sm:px-3 max-w-[85%] xs:max-w-[90%] sm:max-w-[80%] rounded-lg text-sm break-words ${
          isCurrentUser ? "bg-purple-400 text-white" : "bg-purple-600"
        } relative group`}
      >
        {/* Username with responsive font size */}
        <p className="text-black text-sm font-bold">
          {message.userName}
        </p>

        {/* Reply button - improved for touch */}
        <button 
          onClick={() => onSwipeReply(message)}
          className="absolute -top-4 right-0 bg-purple-700 text-white text-[10px] xs:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-t-md opacity-0 group-hover:opacity-100 touch-action:opacity-100 transition-opacity"
          aria-label="Reply to message"
        >
          Reply
        </button>

        {/* Message Content */}
        <div>
          {/* If this message is a reply to another message */}
          {message.replyTo && (
            <div className="bg-purple-800 p-1.5 rounded-md mb-1.5 text-xs border-l-2 border-white">
              <p className="font-semibold text-gray-300">{message.replyTo.userName || "Unknown"}:</p>
              <p className="truncate text-purple-200">{message.replyTo.message || ""}</p>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words text-sm">
            {message.message}
          </p>  
        </div>
      </div>
    </motion.div>
  );
};

export default SlidingReply;