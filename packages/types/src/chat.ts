import { Game } from "./game";

export type Message = {
  id: number;
  chatRoomId: number;
  content: string;
  authorId: string;
  author?: any;
  gameId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewMessage = {
  chatRoomId: number;
  content: string;
  authorId: string;
  gameId: number;
};

export type Reader = {
  playerId: string;
  gameId: number;
  chatRoomId: number;
};

export type Writer = {
  playerId: string;
  gameId: number;
  chatRoomId: number;
};

export type ChatRoomType = "night" | "day" | "spirit";

export type NightChatRoom = {
  id: number;
  game: Game;
  chatRoom: ChatRoom;
};

export type DayChatRoom = {
  id: number;
  game: Game;
  chatRoom: ChatRoom;
};

export type SpiritChatRoom = {
  id: number;
  game: Game;
  chatRoom: ChatRoom;
};

export type ChatRoom = {
  id: number;
  messages: Message[];
  readers: Reader[];
  writers: Writer[];
  createdAt: Date;
  updatedAt: Date;
  nightChat: NightChatRoom[];
  dayChat: DayChatRoom[];
  spirit: SpiritChatRoom[];
};

export type NewChatroom = {
  createdAt: Date;
  updatedAt: Date;
  nightChat: Omit<NightChatRoom, "id">[];
  dayChat: Omit<DayChatRoom, "id">[];
  spirit: Omit<SpiritChatRoom, "id">[];
};
