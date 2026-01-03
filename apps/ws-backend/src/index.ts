import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from "@repo/backend-common/config";
import * as WS from 'ws';
import { prismaClient } from "@repo/db/client"

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WS.WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'string') {
      return null;
    }

    if (!decoded || !(decoded as JwtPayload).userId) {
      return null;
    }

    return decoded.userId;
  } catch (e) {
    return null;
  }
  return null;
}

wss.on('connection', function connection(ws: WS.WebSocket, request) {
  const url = request.url;

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split('?')[1] || "");
  const token = queryParams.get('token') || '';
  const userId = checkUser(token);

  if (userId === null) {
    ws.close();
    return;
  }

  users.push({
    userId,
    rooms: [],
    ws
  });

  ws.on('message', async function message(data) {
    let parsedData;
    if (!parsedData) {
      parsedData = JSON.parse(data.toString())
    } else {
      parsedData = JSON.parse(data);
    }

    if (parsedData.type === "join_room") {
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find(x => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      // better put it in a queue
      await prismaClient.chat.create({
        data: {
          roomId: Number(roomId),
          message,
          userId,
        }
      })

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId: roomId
            })
          );
        }
      });
    }
  });
});
