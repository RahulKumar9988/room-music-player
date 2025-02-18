import React from "react";
import { motion } from "framer-motion";

const Sliding_reply = ({ message, onSwipeReply, isCurrentUser }) => {
    return (
        <motion.div
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-2`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(event, info) => {
                if (info.offset.x < -50) onSwipeReply(message); // Trigger reply on swipe
            }}
        >
            <div
                className={`py-2 px-3 max-w-[80%] rounded-lg text-sm break-words ${
                    isCurrentUser ? "bg-purple-400 text-white" : "bg-purple-600"
                }`}
            >
                {/* Display "Replying to" if the message is a reply */}
                {message.replyTo && (
                    <div className="text-sm text-gray-500 border-l-2 pl-2 mb-1">
                        Replying to: {message.replyTo.text}
                    </div>
                )}

                {/* Username */}
                <p className="text-black text-sm font-bold">
                    {message.userName}
                </p>

                {/* Message Content */}
                {message.type === "text" && (
                    <p className="whitespace-pre-wrap break-words">
                        {message.message}
                    </p>
                )}

                {/* Media Handling */}
                {message.type === "media" && (
                    <>
                        {message.content?.startsWith("data:image") && (
                            <img
                                src={message.content}
                                alt="Shared media"
                                className="max-w-full rounded-lg"
                            />
                        )}
                        {message.content?.startsWith("data:video") && (
                            <video controls className="max-w-full rounded-lg">
                                <source src={message.content} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    );
};

export default Sliding_reply;