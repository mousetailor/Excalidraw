import { HTTP_BACKEND } from "@/tsconfig";
import axios from "axios";
import { type } from "os";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
  } | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
  }

export async function InitDraw(canvas: HTMLCanvasElement , roomId : string, socket: WebSocket) {
    const ctx = canvas?.getContext("2d");
    const existingShapes: Shape[] = await getExistingShapes(roomId);
    if(!ctx || !canvas) return;
   
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if(message.type == "chat"){
        const parsedShape = JSON.parse(message.message);
        existingShapes.push(parsedShape.shape);
        clearCanvas(existingShapes,ctx, canvas);
    }
  }

    clearCanvas(existingShapes,ctx, canvas);
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas?.addEventListener("mousedown", (e) => {
      clicked = true;
      startX = e.clientX;
      startY = e.clientY;
});
    canvas?.addEventListener("mouseup", (e) => {
      clicked = false;
      const width = e.clientX - startX;
      const height = e.clientY - startY;
      const shape: Shape= {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height
      }
      existingShapes.push(shape);
      socket.send(JSON.stringify({
      type: "chat",
      message: JSON.stringify({shape}),
      roomId
    }),
    )
  });

    canvas?.addEventListener("mousemove", (e) => {
      if(clicked){
        const width = e.clientX - startX;
        const height = e.clientY - startY;
        clearCanvas(existingShapes,ctx, canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgba(255,255,255)";
        ctx.strokeRect(startX, startY, width, height);
};
});
}

function clearCanvas(existingShapes: Shape[],ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if(shape.type === "rect"){
      ctx.strokeStyle = "rgba(255,255,255)";
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }
})
}

async function getExistingShapes(roomId: string){
  const res = await axios.get(`${HTTP_BACKEND}/chat/${roomId}`);
  const messages = res.data.messages;

  const shapes = messages.map((x: {messages: string}) => {
    const messageData = JSON.parse(x.messages);
    return messageData.shape;
  })
  return shapes;
}
