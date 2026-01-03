"use client";
import { useEffect, useState } from "react";
import { WS_BACKEND } from "@/tsconfig";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
  
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${WS_BACKEND}?token={}`);

    ws.onopen = () => {
       setSocket(ws);
      ws.send(JSON.stringify({type: "join_room", roomId}));
    }
  },[])

  if(!socket) 
    return <div>Loading...</div>

  return <div>
    <Canvas roomId = {roomId} socket={socket}/>
  </div>
}
