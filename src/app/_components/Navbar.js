import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Correct import for App Router

const Navbar = ({ roomUsers, roomId, handleExitGroup, copyRoomId }) => {
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleBackButton = (event) => {
            event.preventDefault();
            setIsExitModalOpen(true);
            window.history.pushState(null, "", window.location.href); // Prevent default navigation
        };

        window.history.pushState(null, "", window.location.href); // Initialize history state
        window.addEventListener("popstate", handleBackButton);

        return () => {
            window.removeEventListener("popstate", handleBackButton);
        };
    }, []);

    const handleExitConfirm = () => {
        handleExitGroup();
        router.push("/");
    };

    return (
        <>
            <div className="bg-custom-gradient w-full text-white text-center py-2 fixed top-0 left-0 z-50 shadow-md">
                <div className="flex  md:flex-row justify-between items-center px-4">
                    <div className="text-sm md:text-base text-center md:text-left mb-2 md:mb-0">
                        <p>{roomUsers.length} users</p>
                        <p>Code: <span className="font-semibold">{roomId}</span></p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button 
                            className="bg-red-600 p-1 text-sm rounded-lg hover:bg-red-700 transition w-full md:w-auto"
                            onClick={() => setIsExitModalOpen(true)}
                        >
                            Exit Room
                        </button>
                        <button
                            className={`p-1 text-sm rounded-lg transition-all duration-300 border-2 
                            ${copied ? "bg-black text-white" : "bg-slate-950 text-white hover:bg-purple-950"} w-full md:w-auto`}
                            onClick={() => {
                                copyRoomId();
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }}
                        >
                            {copied ? "Copied!" : "Copy Code"}
                        </button>
                    </div>
                </div>
            </div>
            
            {isExitModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="relative bg-gradient-to-br from-purple-900 via-black to-purple-950 border border-purple-800/50 rounded-2xl p-8 shadow-2xl shadow-purple-900/30 max-w-md w-full transform transition-all">
                    <div className="absolute -top-3 -right-3">
                        <button 
                            onClick={() => setIsExitModalOpen(false)}
                            className="p-2 bg-purple-800 hover:bg-purple-700 rounded-full transition-transform hover:scale-110"
                        >
                            <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
            
                    <div className="flex flex-col items-center space-y-6">
                        <div className="bg-purple-500/20 p-4 rounded-full animate-pulse">
                            <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
            
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent text-center">
                            Leave the Cosmic Groove?
                            <span className="block text-sm font-normal text-purple-300/80 mt-2">
                                Your vibe will be missed in the nebula
                            </span>
                        </h3>
            
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setIsExitModalOpen(false)}
                                className="flex-1 px-6 py-3 bg-purple-800/50 hover:bg-purple-700/50 border border-purple-700/30 text-purple-100 rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Keep Dancing
                            </button>
                            <button
                                onClick={handleExitConfirm}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Exit Wormhole
                            </button>
                        </div>
                    </div>
                    
                    {/* Subtle particle effect */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-twinkle" />
                        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-twinkle-delay" />
                        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-purple-200 rounded-full animate-twinkle" />
                    </div>
                </div>
            </div>
            )}
        </>
    );
};

export default Navbar;
