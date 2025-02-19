import React from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // Add Image import

export  const Sliding_reply = ({ message, onSwipeReply, isCurrentUser }) => {
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
                    width={30}
                    height={30}
                    className="mr-2 h-7 rounded-full bg-purple-500 p-1"
                />
            )}

            <div
                className={`py-2 px-3 max-w-[80%] rounded-lg text-sm break-words ${
                    isCurrentUser ? "bg-purple-400 text-white" : "bg-purple-600"
                }`}
            >
                {/* Rest of the component remains the same */}
                {message.replyTo && (
                    <div className="text-sm text-gray-500 border-l-2 pl-2 mb-1">
                        Replying to: {message.replyTo.text}
                    </div>
                )}
                {/* ... other message content */}
            </div>
        </motion.div>
    );
};