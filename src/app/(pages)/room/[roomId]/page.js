"use client";

import ChatRoom from '@/app/_components/chat/page';
import { useSearchParams, useParams } from 'next/navigation';
import React from 'react';

const Page = () => {
  const params = useParams();  // Correct way to access dynamic params
  const searchParams = useSearchParams();
  const userName = searchParams.get("user") || "admin"; // Get username from query

  return <ChatRoom roomId={params.roomId} userName={userName} />;
};

export default Page;
