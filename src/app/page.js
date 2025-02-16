"use client"
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { Meteors } from './_components/ui/meteors';
import { StarsBackground } from './_components/ui/stars-background';

const Page = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [errors, setErrors] = useState({ roomId: "", userName: "" });

  const handleCreateRoom = () => {
    const newRoom = `room-${Math.random().toString(36).substring(7)}`;
    router.push(`/room/${newRoom}?user=${encodeURIComponent(userName)}`);
  };

  const handleJoinRoom = () => {
    let newErrors = { roomId: "", userName: "" };

    if (!roomId) newErrors.roomId = "Room ID is required";
    if (!userName) newErrors.userName = "Username is required";

    setErrors(newErrors);

    if (!newErrors.roomId && !newErrors.userName) {
      console.log(userName, roomId);
      router.push(`/room/${roomId}?user=${encodeURIComponent(userName)}`);
    }
  };

  return (
    <div className='w-full h-[100vh] bg-black overflow-hidden'>
      <StarsBackground/>
      <Meteors/>      
      <div className='flex items-center justify-center max-w-screen-xl flex-col space-y-6 mx-auto h-screen'>
        <div className='max-w-screen-xl mx-auto flex items-center flex-col justify-center relative z-20'>
          <h1 className='md:text-8xl text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r font-serif from-purple-500 to-purple-400 z-20'>Chill Zone</h1>
          <p className='lg:text-2xl text-xl font-bold text-white text-center'>music taste matters</p>
          <Image src="/hugy.png" alt="music" width={100} height={100} className='absolute -top-8 -right-20 animate-pulse' />
          
        </div>

        <div className='flex items-center flex-col space-y-6'>
          <button className='bg-gradient-to-r px-10 w-full from-purple-500 z-30 to-purple-700
          text-white py-3 rounded-3xl' onClick={handleCreateRoom}>Create a room</button>

          <div className='flex items-center flex-col space-y-4 z-30 w-full'>
            <input 
              type="text" 
              onChange={(e) => setRoomId(e.target.value)} 
              value={roomId} 
              placeholder='Enter room code' 
              className={`border ${errors.roomId ? 'border-red-500' : 'border-gray-300'} rounded-3xl px-3 py-2 w-full`} 
            />
            {errors.roomId && <p className="text-red-500 text-sm">{errors.roomId}</p>}

            <input 
              type="text" 
              onChange={(e) => setUserName(e.target.value)} 
              value={userName} 
              placeholder='Enter your name' 
              className={`border ${errors.userName ? 'border-red-500' : 'border-gray-300'} rounded-3xl px-3 py-2 w-full`} 
            />
            {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}

            <button className='bg-gradient-to-r px-10 from-purple-500 to-purple-700 text-white py-3 rounded-3xl' onClick={handleJoinRoom}>
              Join a room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
