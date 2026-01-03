import { InitDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({roomId, socket}: {roomId: string, socket: WebSocket}) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if(canvasRef.current){
      InitDraw(canvasRef.current, roomId, socket);
    };

  }, [canvasRef]);
  return <div>
    <canvas ref = {canvasRef} width = {500} height = {500}></canvas>
    </div>
}
