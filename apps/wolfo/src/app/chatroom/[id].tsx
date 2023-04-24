import { Button, Input, Text } from "@ui-kitten/components";
import { useRouter, useSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import io from "socket.io-client";
import { getMessages } from "../../utils/api/chat";

import { Message, NewMessage } from "types";

const IP = process.env.IP || "localhost";
const PORT = process.env.PORT || 3000;
const socketEndpoint = `http://${IP}:${PORT}`;

const ChatRoomView = () => {
  const [messageInput, setMessageInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const { id, gameId, userId } = useSearchParams(); // id du chatroom
  const socket = io(socketEndpoint);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getMessages(Number(id));
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("joinChatRoom", { chatRoomId: id, userId });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    const handleNewMessage = (msg: Message) => {
      setMessages(prevMessages => [...prevMessages, msg]);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage); // désactive l'écoute de l'événement lors du nettoyage de l'effet.
      socket.disconnect();
    };
  }, [id, userId, socket, messages]);

  const sendMessage = () => {
    try {
      const userId = "512daa49-a394-4afc-99b3-1e6a0e7daf88";
      const gameId = "1";
      console.log(
        `Sending message: ${messageInput} from ${userId} in game ${gameId} in chatroom ${id}`
      );
      const newMessage: NewMessage = {
        chatRoomId: Number(id),
        content: messageInput,
        authorId: userId,
        gameId: Number(gameId),
      };
      socket.emit("messagePosted", newMessage);
      setMessageInput(""); // Vider le champ de texte après l'envoi du message
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <SafeAreaProvider>
      <Text>ChatRoom | {Number(id)}</Text>
      {messages &&
        messages.map((msg: Message, index: number) => <Text key={index}>{msg.content}</Text>)}
      <Button onPress={() => router.back()}>Go Back</Button>
      <Input
        placeholder="Type your message..."
        value={messageInput}
        onChangeText={text => setMessageInput(text)}
      />
      <Button onPress={sendMessage}>Send Message</Button>
    </SafeAreaProvider>
  );
};

export default ChatRoomView;
