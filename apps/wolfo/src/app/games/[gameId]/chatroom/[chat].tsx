import { useQuery } from "@tanstack/react-query";
import { Card, Text } from "@ui-kitten/components";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { default as React, useContext, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Day, GiftedChat, IMessage, InputToolbar } from "react-native-gifted-chat";
import { SafeAreaProvider } from "react-native-safe-area-context";
import io, { Socket } from "socket.io-client";
import { Game, Message, NewMessage, Player, StateGame } from "types";
import { AuthContext } from "../../../../components/context/tokenContext";
import { getMessages, getPermissions } from "../../../../utils/api/chat";
import { getGame } from "../../../../utils/api/game";
import { getPlayer } from "../../../../utils/api/player";
import useFont from "../../../../utils/hooks/useFont";

const socketEndpoint = `http://localhost:3000`;
//const socketEndpoint = "https://wolfo-backend.osc-fr1.scalingo.io:22769";

const ChatRoomView = () => {
  //console.log(usePathname());
  const [messagesList, setMessagesList] = useState<IMessage[]>([]);
  // const [imageBackground, setImgBackground] = useState(imgChatroomDay);
  const { chat, gameId } = useSearchParams();
  const { id: userId } = useContext(AuthContext);
  const fontsLoaded = useFont();
  const [chatLoaded, setChatLoaded] = useState(false);

  const [textReason, setTextReason] = useState<string>("");

  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(socketEndpoint);
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const { data, isLoading, isError } = useQuery({
    enabled: !isNaN(Number(chat)),
    queryKey: ["permissions", Number(chat), userId],
    queryFn: () => getPermissions(Number(chat)),
  });

  const { data: game } = useQuery<Game, Error>({
    enabled: !isNaN(Number(gameId)),
    queryKey: ["mygames", gameId],
    queryFn: () => getGame(Number(gameId)),
    staleTime: 1000 * 60 * 5,
  });
  // get player data
  const { data: player } = useQuery<Player, Error>({
    enabled: Boolean(game),
    queryKey: ["player", userId],
    queryFn: () => getPlayer(game?.id!, userId),
    staleTime: 1000 * 60 * 5,
  });

  const fetchMessages = async () => {
    if (data?.read === true) {
      try {
        const messages: Message[] = await getMessages(Number(chat));
        const convertedMessages: any = messages.map((msg: Message) => ({
          _id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.createdAt),
          authorId: msg.authorId,
          user: {
            _id: msg.authorId,
            name: msg.author?.user?.name,
          },
        }));

        setMessagesList(convertedMessages.reverse());
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    } else {
      console.error("You don't have permission to view this chatroom");
    }
  };

  if (!chatLoaded && data?.read === true) {
    fetchMessages();
    setChatLoaded(true);
  }

  useEffect(() => {
    const setUpAssets = () => {
      if (player?.power === "INSOMNIAC") {
        if (player?.usedPower === true) {
          // setImgBackground(imgChatroomInsomniac);
        } else {
          setTextReason("You can use your power to spy werewolves, go to power menu.");
        }
      } else if (player?.power === "SPIRIT" && game?.spiritChatRoomId === Number(chat)) {
        // setImgBackground(imgChatroomSpirit);
      } else if (game?.state === "NIGHT") {
        // setImgBackground(imgChatroomNight);
        if (player?.role === "VILLAGER") {
          setTextReason("You are a villager. You can't see anything at night.");
        }
      } else {
        // setImgBackground(imgChatroomDay);
      }
    };

    if (!chat || !fontsLoaded) {
      return;
    }

    setUpAssets();

    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to socket server");
        socket.emit("joinChatRoom", { chatRoomId: chat, userId });
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
      });

      const handleNewMessage = (args: [Message, any]) => {
        const msg = args[0];
        const author = args[1];

        const convertedMessage: IMessage = {
          _id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.authorId,
            name: author.name,
          },
        };
        setMessagesList(previousMessages => [convertedMessage, ...previousMessages]);
      };

      socket.on("newMessage", handleNewMessage);

      return () => {
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [chat, userId, socket, data, game, player, fontsLoaded, router]);

  const onSend = (msgList: IMessage[] = []) => {
    console.log("in onsend, we got: data", data);
    if (data?.write === true) {
      msgList.forEach(msg => {
        const newMessage: NewMessage = {
          chatRoomId: Number(chat),
          content: msg.text,
          authorId: String(userId),
          gameId: Number(gameId),
        };
        socket?.emit("messagePosted", [newMessage, data.write]);
      });
    } else {
      console.error("You don't have permission to write in this chatroom");
    }
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (isError || !data) {
    return router.back();
  }
  const renderDay = (props: any) => {
    return <Day {...props} textStyle={styles.title} />;
  };

  const renderInputToolbar = (props: any) => {
    if (data.write === true) {
      return <InputToolbar {...props} />;
    }
    return null;
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <Stack.Screen
        options={{
          title: `Chatroom ${game?.state === StateGame.NIGHT ? "Night" : "Day"}`,
          headerRight: () => null,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        {data.read === true ? (
          <GiftedChat
            messages={messagesList}
            onSend={messages => onSend(messages)}
            user={{ _id: String(userId) }}
            renderUsernameOnMessage={true}
            renderDay={renderDay}
            renderInputToolbar={props => renderInputToolbar(props)}
          />
        ) : (
          <View style={styles.centeredContainer}>
            <Card style={styles.cardReason}>
              <Text style={styles.cardText}>{textReason}</Text>{" "}
            </Card>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141313",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardReason: {
    alignSelf: "center",
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 24,
    textAlign: "center",
  },
  cardText: {
    color: "white",
    fontSize: 16,
  },
  keyboard: {
    flex: 1,
  },
});

export default ChatRoomView;
