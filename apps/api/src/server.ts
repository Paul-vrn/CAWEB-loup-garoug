import cors from "cors";
import { Server, Socket } from "socket.io";
import { Message, NewMessage } from "types";
import app from "./app";
import prisma from "./prisma";
import { relaunchGames } from "./services/scheduler";
import { IP, PORT } from "./utils/env";
app.use(cors());
relaunchGames();

const serv = app.listen(PORT, () => console.log(`Listening on http://${IP}:${PORT}`));

// Websocket server
const io = new Server(serv, {
  cors: {
    origin: "*",
  },
});

// Listen for incoming socket connections
io.on("connection", (socket: Socket) => {
  console.log("a user is connected to the chat");

  socket.on("joinChatRoom", ({ chatRoomId, userId }) => {
    socket.join(`chatRoom-${chatRoomId}`);
    console.log(`User ${userId} joined chat room ${chatRoomId}`);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("messagePosted", async (args: [NewMessage, boolean]) => {
    const [message, gotPermission] = args;
    if (!gotPermission) {
      console.error("You don't have permission to post a message");
    }
    try {
      // author is the user of userId message.authorId and in the game of gameId message.gameId
      const author = await prisma.user.findUnique({
        where: {
          id: message.authorId,
        },
      });
      const messageObj: Message = await prisma.message.create({
        data: {
          content: message.content,
          // author is the user of userId message.authorId and in the game of gameId message.gameId
          author: {
            connect: {
              userId_gameId: {
                userId: message.authorId,
                gameId: message.gameId,
              },
            },
          },
          chatRoom: {
            connect: {
              id: message.chatRoomId,
            },
          },
        },
        include: {
          author: true,
        },
      });

      console.log("args of messagePosted:", [messageObj, author]);
      io.to(`chatRoom-${message.chatRoomId}`).emit("newMessage", [messageObj, author]);
    } catch (error) {
      console.error("Error creating and sending message:", error);
    }
  });
});
