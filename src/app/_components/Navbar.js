import { useState } from "react";

const Navbar = ({ roomUsers, roomId, handleExitGroup, copyRoomId }) => {
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    return (
        <div className="w-full text-white text-center py-1 text-sm fixed top-0 left-0 z-50">
            <div className="flex justify-around items-center">
                <div className="flex flex-col justify-between items-center">
                    <p>{roomUsers.length} users</p>
                    <p>Code: <span className="font-semibold">{roomId}</span></p>
                </div>
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
                        onClick={() => {
                            copyRoomId();
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                        }}
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>

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
        </div>
    );
};

export default Navbar;
