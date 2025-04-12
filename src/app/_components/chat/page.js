"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Navbar from "../Navbar";

const ChatRoom = ({ roomId, userName }) => {
    const socket = useMemo(() => io("https://room-music-player-server.onrender.com"), []);

    // const socket = useMemo(() => io("http://localhost:3001"), []);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState("");
    const [copied, setCopied] = useState(false);
    const [roomUsers, setRoomUsers] = useState([]);
    const [videoId, setVideoId] = useState("");
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [videoTitle, setVideoTitle] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [textareaHeight, setTextareaHeight] = useState("40px");
    const scroll = useRef();
    const [modal, setmodal] = useState(false);
    const notificationTone = useRef(null);
    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [navigationAttempt, setNavigationAttempt] = useState(null);

    useEffect(() => {
        const id = uuidv4();
        setUserId(id);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            console.log("Connected to server");
        });
        socket.on("receive-message", (data) => {
            console.log("Received message:", data);
            setChat((prev) => [...prev, data]);
            if (notificationTone.current) {
                notificationTone.current.play().catch((err) => {
                    console.error("Error playing notification tone:", err);
                });
            } // Add the received message to the chat state
        });


        socket.on("room-users", (users) => {
            setRoomUsers(users);
        });

        socket.on("play-video", videoId, title => {
            setVideoId(videoId);
            setVideoTitle(title || "Unknown video");
            if (player) {
                player.loadVideoById(videoId);
                player.playVideo();
            }
            setIsPlaying(true);
        });

        socket.on("pause-video", () => {
            if (player) {
                player.pauseVideo();
            }
            setIsPlaying(false);
        });

        socket.on("video-state", (isPlaying) => {
            setIsPlaying(isPlaying);
            if (player) {
                isPlaying ? player.playVideo() : player.pauseVideo();
            }
        });

        socket.emit("join-room", roomId, userName);

        return () => {
            socket.off("connect");
            socket.off("receive-message");
            socket.off("room-users");
            socket.off("play-video");
            socket.off("pause-video");
            socket.off("video-state");
        };
    }, [socket, player, roomId, userName]);

    // Enhanced reload prevention for all devices
    useEffect(() => {
        // Set unsaved changes flag when there are messages in the chat or active input
        if (chat.length > 0 || message.trim() !== '') {
            setUnsavedChanges(true);
        }

        // Handler for beforeunload event (works on desktop browsers)
        const handleBeforeUnload = (e) => {
            if (unsavedChanges) {
                const confirmationMessage = "You have unsaved changes or active conversations. Are you sure you want to leave this page?";
                e.preventDefault();
                e.returnValue = confirmationMessage; // Required for Chrome
                return confirmationMessage; // For other browsers
            }
        };

        // Handle popstate event (for back/forward navigation)
        const handlePopState = (e) => {
            if (unsavedChanges) {
                e.preventDefault();
                // Save the navigation attempt for potential use later
                setNavigationAttempt(() => () => window.history.back());
                // Show confirmation modal
                setConfirmModal(true);
                // Push a new dummy state to prevent navigation
                window.history.pushState(null, "", window.location.href);
                return;
            }
        };

        // Add history state on component mount to enable popstate catching
        window.history.pushState(null, "", window.location.href);

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Handle mobile device pagehide event (works better than beforeunload on iOS)
        const handlePageHide = (e) => {
            if (unsavedChanges) {
                // We can't prevent navigation on pagehide, but at least we can
                // attempt to save any important data to localStorage here if needed
                try {
                    localStorage.setItem(`chat_backup_${roomId}`, JSON.stringify(chat));
                    localStorage.setItem(`message_backup_${roomId}`, message);
                } catch (err) {
                    console.error("Failed to backup chat data:", err);
                }
            }
        };
        
        window.addEventListener('pagehide', handlePageHide);

        // Clean up event listeners
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [chat, message, unsavedChanges, roomId]);

    // Check for backed up chat data on load
    useEffect(() => {
        try {
            const backedUpChat = localStorage.getItem(`chat_backup_${roomId}`);
            const backedUpMessage = localStorage.getItem(`message_backup_${roomId}`);
            
            if (backedUpChat && chat.length === 0) {
                const parsedChat = JSON.parse(backedUpChat);
                setChat(parsedChat);
            }
            
            if (backedUpMessage && message === '') {
                setMessage(backedUpMessage);
            }
            
            // Clear backups after successful restoration
            localStorage.removeItem(`chat_backup_${roomId}`);
            localStorage.removeItem(`message_backup_${roomId}`);
        } catch (err) {
            console.error("Failed to restore chat backup:", err);
        }
    }, [roomId]);

    useEffect(() => {
        if (typeof window.YT === "undefined") {
            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.async = true;
            script.onload = () => {
                window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
            };
            document.body.appendChild(script);
        } else {
            window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
        }
    }, []);

    useEffect(() => {
        if (scroll.current) {
            scroll.current.scrollTop = scroll.current.scrollHeight;
        }
    }, [chat]);

    useEffect(() => {
        if (videoId && typeof window.YT !== "undefined") {
            onYouTubeIframeAPIReady();
        }
    }, [videoId]);

    const searchYouTube = async (query) => {
        const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API;
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${API_KEY}`
            );
            const data = await response.json();
            console.log(data)
            setSearchResults(data.items);
        } catch (error) {
            console.error("Error fetching YouTube data:", error);
        }
    };

    const onYouTubeIframeAPIReady = () => {
        if (videoId) {
            const newPlayer = new window.YT.Player("youtube-player", {
                height: "1",
                width: "1",
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    showinfo: 0,
                    fs: 0,
                    rel: 0,
                },
                events: {
                    onReady: (event) => {
                        setPlayer(event.target);
                        if (isPlaying) {
                            event.target.playVideo();
                        } else {
                            event.target.pauseVideo();
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setIsPlaying(true);
                        }
                        if (event.data === window.YT.PlayerState.PAUSED) {
                            setIsPlaying(false);
                        }
                    },
                },
            });
        }
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            socket.emit("pause-video", roomId);
            setIsPlaying(false);

            if (player) {
                player.pauseVideo();
            }
        } else {
            socket.emit("play-video", videoId, videoTitle);
            setVideoTitle(videoTitle);
            if (player) {
                player.playVideo();
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleVideoSelect = (videoId, videoTitle) => {
        setVideoId(videoId);
        setVideoTitle(videoTitle);
        socket.emit("play-video", roomId, videoId, videoTitle);
        if (player) {
            player.loadVideoById(videoId);
            player.playVideo();
        }
        setIsPlaying(true);
        setmodal(false);
    };

    const handleReply = (msg) => {
        setReplyTo(msg);
        document.getElementById('message-input').focus();
    };

    const cancelReply = () => {
        setReplyTo(null);
    };

    const sendMessage = (type = "text", content = "") => {
        if (type === "text" && message.trim()) {
            const data = { 
                roomId, 
                type, 
                message, 
                senderId: userId, 
                userName,
                replyTo: replyTo
            };
            socket.emit("send-message", data);
            setMessage(""); // Reset the input
            setReplyTo(null); // Clear reply after sending
            setTextareaHeight("40px"); // Reset textarea height
        } else if (type === "media" && content) {
            const data = { 
                roomId, 
                type, 
                content, 
                senderId: userId,
                userName,
                replyTo: replyTo
            };
            socket.emit("send-message", data);
            setReplyTo(null); // Clear reply after sending
        }
    };

    const handleExitGroup = () => {
        if (unsavedChanges) {
            // Show confirmation modal
            setNavigationAttempt(() => () => {
                // This function will run if user confirms the navigation
                setUnsavedChanges(false);
                socket.emit("leaveGroup", { userId });
                window.location.href = "/";
            });
            setConfirmModal(true);
        } else {
            // No unsaved changes, proceed directly
            setUnsavedChanges(false);
            socket.emit("leaveGroup", { userId });
            window.location.href = "/";
        }
    };

    const confirmNavigation = () => {
        setUnsavedChanges(false);
        setConfirmModal(false);
        if (navigationAttempt) {
            navigationAttempt();
            setNavigationAttempt(null);
        }
    };

    const cancelNavigation = () => {
        setConfirmModal(false);
        setNavigationAttempt(null);
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);

        // Reset after 1.5 seconds
        setTimeout(() => setCopied(false), 1500);
    };

    const handleTextareaChange = (e) => {
        setMessage(e.target.value);
        // Reset height to auto to get actual scrollHeight
        e.target.style.height = "auto";
        // Set new height based on scrollHeight
        const newHeight = `${Math.min(Math.max(40, e.target.scrollHeight), 120)}px`;
        setTextareaHeight(newHeight);
        e.target.style.height = newHeight;
    };
    

    return (
        <>
        <div className="fixed bg-custom-gradient flex flex-col h-full w-screen text-white overflow-hidden">
            <audio ref={notificationTone} src="/tone.mp3" preload="auto" />
            
            <Navbar 
                roomUsers={roomUsers} 
                roomId={roomId} 
                handleExitGroup={handleExitGroup} 
                copyRoomId={copyRoomId} 
            />

        <div className="max-w-screen-lg w-full mx-auto rounded-xl relative z-10 px-2 sm:px-5">

        <div className=" h-auto min-h-10 flex w-full items-center justify-between py-2 px-2 sm:px-5 bg-purple-600 rounded-lg sm:rounded-xl z-20">
            <div className="flex items-center space-x-3 overflow-hidden">
                {videoId ? (
                    <div className="flex sm:flex-row items-start sm:items-center gap-1 sm:gap-3">
                        <span className="text-xs sm:text-sm truncate max-w-32 sm:max-w-48">
                            {videoTitle || "Unknown video"}
                        </span>
                        <button
                            className={`px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm ${isPlaying ? "bg-purple-900" : "bg-purple-300"} text-white rounded-lg`}
                            onClick={handlePlayPause}
                        >   
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                    </div>
                ) : (
                    <span className="text-xs sm:text-sm"> No music selected</span>
                )}
            </div>
            <Image 
                src="/music.png" 
                alt="music" 
                width={24} 
                height={24} 
                className="cursor-pointer sm:w-8 sm:h-8" 
                onClick={() => setmodal(true)} 
            />
        </div>

        {/* Hidden YouTube player */}
        <div id="youtube-player" className="hidden"></div>

        {/* Chat Container */}
        <div 
    ref={scroll} 
    className="flex flex-col w-full mx-auto overflow-y-auto rounded-xl p-2 md:p-4 scrollbar-thin scrollbar-thumb-purple-400 h-[calc(100vh-300px)]"
>
    {chat.map((msg, index) => (
        <div key={index} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"} mb-2`}>
            
            {msg.senderId !== userId && (
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
                    msg.senderId === userId ? "bg-purple-400 text-white" : "bg-purple-600"
                } relative group`}
            >
                {/* Username with responsive font size */}
                <p className="text-black text-sm font-bold">
                    {msg.userName}
                </p>

                {/* Reply content if this message is a reply - Enhanced version */}
                {msg.replyTo && (
                    <div className="bg-purple-800 bg-opacity-60 p-1.5 rounded-md mb-2 text-[10px] xs:text-xs border-l-2 border-white">
                        <p className="font-semibold text-purple-200">↩️ Reply to {msg.replyTo.userName}:</p>
                        <p className="italic truncate max-w-full text-gray-200">"{msg.replyTo.message?.substring(0, 50)}{msg.replyTo.message?.length > 50 ? "..." : ""}"</p>
                    </div>
                )}

                {/* Message Content */}
                {msg.type === "text" && (
                    <p className="whitespace-pre-wrap break-words text-sm">
                        {msg.message}
                    </p>
                )}

                {/* Media Handling with improved responsive behavior */}
                {msg.type === "media" && (
                    <>
                        {msg.content?.startsWith("data:image") && (
                            <div className="max-w-full overflow-hidden">
                                <img
                                    src={msg.content}
                                    alt="Shared media"
                                    className="max-w-full rounded-lg object-contain max-h-[200px] sm:max-h-[300px]"
                                />
                            </div>
                        )}
                        {msg.content?.startsWith("data:video") && (
                            <div className="max-w-full overflow-hidden">
                                <video 
                                    controls 
                                    className="max-w-full rounded-lg max-h-[200px] sm:max-h-[300px]"
                                    controlsList="nodownload nofullscreen"
                                    playsInline
                                >
                                    <source src={msg.content} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </>
                )}

                {/* Reply button - improved for touch */}
                <button 
                    onClick={() => handleReply(msg)}
                    className="absolute -top-4 right-0 bg-purple-700 text-white text-[10px] xs:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-t-md opacity-0 group-hover:opacity-100 touch-action:opacity-100 transition-opacity"
                    aria-label="Reply to message"
                >
                    Reply
                </button>
            </div>
        </div>
    ))}
</div>

        {/* Message Input Area with Reply Preview */}
        <div className="flex flex-col w-full mx-auto mb-2 sm:mb-4 bg-black bg-opacity-30 rounded-lg">
            {/* Reply preview */}
            {replyTo && (
                <div className="flex items-center justify-between bg-purple-800 p-2 rounded-t-lg">
                    <div className="flex-1 text-xs sm:text-sm">
                        <span className="font-bold">Replying to {replyTo.userName}: </span>
                        <span className="truncate">{replyTo.message?.substring(0, 30)}{replyTo.message?.length > 30 ? "..." : ""}</span>
                    </div>
                    <button 
                        onClick={cancelReply}
                        className="text-white hover:text-red-300 ml-2"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Message input */}
            <div className="flex items-center p-2">
                <textarea
                    id="message-input"
                    className="bg-black bg-opacity-50 w-full p-2 border border-purple-400 rounded-lg text-sm break-words whitespace-pre-wrap resize-none overflow-hidden"
                    placeholder="Type a message..."
                    value={message}
                    onChange={handleTextareaChange}
                    style={{ height: textareaHeight }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                            setTextareaHeight("40px");
                        }
                    }}
                />
                <button
                    onClick={() => sendMessage("text")}
                    className="ml-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm"
                >
                    Send
                </button>
            </div>
        </div>
        </div>
        </div>

        {/* Music selection modal */}
        {modal && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
                <div className="bg-purple-900 rounded-xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Select Music</h2>
                        <button 
                            className="text-white text-xl hover:text-purple-300" 
                            onClick={() => setmodal(false)}
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="mb-4 flex flex-col items-center space-y-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a song..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-black"
                        />
                        <button
                            onClick={() => searchYouTube(searchQuery)}
                            className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                            Search
                        </button>

                        {/* Display search results */}
                        <div className="w-full mt-4 space-y-3">
                            {searchResults.map((video) => (
                                <div key={video.id.videoId} className="flex sm:items-center justify-between p-2 border border-purple-700 rounded-lg">
                                    <div className="text-white text-sm mb-2 sm:mb-0 sm:mr-2 truncate"> 
                                        {video.snippet.title}
                                    </div>
                                    <button
                                        onClick={() => handleVideoSelect(video.id.videoId, video.snippet.title)}
                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 whitespace-nowrap"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-50 p-4">
                <div className="bg-purple-900 rounded-xl p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Leave this chat?</h2>
                    <p className="mb-6">You have unsaved changes or active conversations. Are you sure you want to leave this page?</p>
                    
                    <div className="flex justify-between">
                        <button 
                            onClick={cancelNavigation}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Stay
                        </button>
                        <button 
                            onClick={confirmNavigation}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ChatRoom;