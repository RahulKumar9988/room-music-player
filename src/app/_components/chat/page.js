"use client";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const ChatRoom = ({ roomId , userName}) => {
      const socket = useMemo(() => io("https://room-music-player-server.onrender.com"), []);
    // const socket = useMemo(() => io("http://localhost:3001"), []);
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState([]);
    const [userId, setUserId] = useState("");
    const [copied, setCopied] = useState(false);
    // const [userName, setUserName] = useState("");
    const [roomUsers, setRoomUsers] = useState([]);
    const [videoId, setVideoId] = useState("");
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [videoTitle, setVideoTitle] = useState("Unknown video");
    const scroll = useRef()
    const [modal, setmodal] = useState(false);
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const notificationTone = useRef(null);

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

        socket.on("play-video", (videoId, videoTitle) => {
            setVideoId(videoId);
            setVideoTitle(videoTitle);
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
            socket.emit("play-video", roomId, videoId, videoTitle);
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
    };

    const sendMessage = (type = "text", content = "") => {
        if (type === "text" && message.trim()) {
            const data = { roomId, type, message, senderId: userId, userName };
            socket.emit("send-message", data);
            setMessage(""); // Reset the input
        } else if (type === "media" && content) {
            const data = { roomId, type, content, senderId: userId };
            socket.emit("send-message", data);
        }
    };

    const handleExitGroup = () => {
        socket.emit("leaveGroup", { userId });
        console.log("User has left the group!");
        window.location.href = "/";
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);

        // Reset after 1.5 seconds
        setTimeout(() => setCopied(false), 1500);
    };
    

    return (
        <>
        <div className="bg-custom-gradient flex flex-col h-screen w-screen text-white relative overflow-hidden overflow-y-hidden py-2">
            <audio ref={notificationTone} src="/tone.mp3" preload="auto" />
            {/* <div className="h-[400px] w-[400px] bg-purple-800 rounded-full blur-3xl opacity-25 absolute top-0 -right-32"></div> */}
            <div className="w-full text-white text-center py-1 text-sm">
                <div className="flex justify-around items-center ">
                    <div className="flex flex-col justify-between items-center">                        
                        <p>{roomUsers.length} users</p>
                        <p>Code: <span className="font-semibold">{roomId}</span></p>
                    </div>
                    <>
                        {/* Exit Room Button */}
                       <div className="flex flex-col">
                            <button 
                                className="bg-red-600 px-3 py-1 text-sm rounded-lg hover:bg-red-700 transition"
                                onClick={() => setIsExitModalOpen(true)}
                            >
                                Exit room
                            </button>

                            <button
                                className={`bg-slate-950 m-1 border-2 px-3 py-1 text-sm rounded-lg transition-all duration-300 
                                ${copied ? "bg-black" : "hover:bg-purple-950"}`}
                                onClick={copyRoomId}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </button>

                       </div>

                        {/* Exit Confirmation Modal */}
                        {isExitModalOpen && (
                            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-50">
                                <div className="w-72 bg-white border-[1px] text-black p-5 rounded-lg shadow-lg text-center">
                                    <p className="text-lg font-semibold mb-4">
                                        Are you sure you want to leave the group?
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                            onClick={() => setIsExitModalOpen(false)}
                                        >
                                            No
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                                            onClick={handleExitGroup}
                                        >
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                    
                </div>
            </div>


        <div className="max-w-screen-lg w-full mx-auto rounded-xl relative z-10 lg:px-0 px-5">

        <div className="flex w-full items-center justify-between lg:py-5 py-2 px-5 bg-purple-600 rounded-xl z-20">
            <div className="flex items-center space-x-3">
                {videoId ? (
                    <div>
                        {videoTitle?.length > 20 ? videoTitle?.slice(0, 20) : ""}
                        <button
                            className={`px-4 py-2 ${isPlaying ? "bg-purple-900" : "bg-purple-300"} text-white rounded-lg`}
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                    </div>
                ) : (
                    <span> No music selected</span>
                )}
            </div>
            <Image src="/music.png" alt="music" width={30} height={30} className="cursor-pointer" onClick={() => setmodal(true)} />
        </div>

        {/* Hidden YouTube player */}
        <div id="youtube-player" className="mb-4"></div>

    {/* Chat Container */}
    <div className="flex flex-col h-[70vh] w-full mx-auto overflow-y-scroll rounded-xl p-4">
        {chat.map((msg, index) => (
            <div key={index} className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"} mb-2`}>
                
                {msg.senderId !== userId && (
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
                        msg.senderId === userId ? "bg-purple-400 text-white" : "bg-purple-600"
                    }`}
                >
                    {/* Username with underline */}
                    <p className="text-black text-sm font-bold">
                        {msg.userName}
                    </p>

                    {/* Message Content */}
                    {msg.type === "text" && (
                        <p className="whitespace-pre-wrap break-words">
                            {msg.message}
                        </p>
                    )}

                    {/* Media Handling */}
                    {msg.type === "media" && (
                        <>
                            {msg.content?.startsWith("data:image") && (
                                <img
                                    src={msg.content}
                                    alt="Shared media"
                                    className="max-w-full rounded-lg"
                                />
                            )}
                            {msg.content?.startsWith("data:video") && (
                                <video controls className="max-w-full rounded-lg">
                                    <source src={msg.content} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </>
                    )}
                </div>

            </div>
        ))}
    </div>

    {/* Message Input */}
    <div className="flex items-center w-full mx-auto">
        <textarea
            className="bg-black w-full h-10 p-2 border rounded-lg text-sm break-words whitespace-pre-wrap resize-none overflow-hidden max-h-[200px]"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
                setMessage(e.target.value);
                e.target.style.height = "auto"; // Reset height
                e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                    e.target.style.height = "auto"; // Reset after sending
                }
            }}
        />
        <button
            onClick={() => sendMessage("text")}
            className="ml-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
        >
            Send
        </button>
    </div>
    </div>
</div>


            {
                modal && <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-80 z-50">
                    <button className="absolute top-4 right-4 text-white text-2xl" onClick={() => setmodal(false)}>Close</button>
                    <div className="mb-4 flex flex-col items-center space-y-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for a song..."
                            className="w-full p-3 border border-gray-300 rounded-lg "
                        />
                        <button
                            onClick={() => searchYouTube(searchQuery)}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Search
                        </button>

                        {/* Display search results */}
                        <div className="mt-4">
                            {searchResults.map((video) => (
                                <div key={video.id.videoId} className="flex justify-between mb-2">
                                    <div className=" text-white px-10"> {video.snippet.title}</div>
                                    <button
                                        onClick={() => handleVideoSelect(video.id.videoId, video.snippet.title)}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                    >
                                        Select
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default ChatRoom;