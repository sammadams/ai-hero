import { db } from "./index";
import { chats, messages } from "./schema";
import { eq, and } from "drizzle-orm";
import type { Message as AIMessage } from "ai";

/**
 * Upsert a chat and its messages. If the chat exists and belongs to the user, replace all messages. If not, create a new chat. Fails if the chat exists but does not belong to the user.
 */
export const upsertChat = async ({
  userId,
  chatId,
  title,
  messages: newMessages,
}: {
  userId: string;
  chatId: string;
  title: string;
  messages: AIMessage[];
}) => {
  // Check if chat exists and belongs to user
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId)),
  });
  if (chat) {
    if (chat.userId !== userId) {
      throw new Error("Chat not found");
    }
    // Delete existing messages
    await db.delete(messages).where(eq(messages.chatId, chatId));
    // Insert new messages
    if (newMessages.length > 0) {
      await db.insert(messages).values(
        newMessages.map((msg, idx) => ({
          chatId,
          role: msg.role,
          parts: msg,
          order: idx,
        }))
      );
    }
    // Update chat title if needed
    await db.update(chats).set({ title }).where(eq(chats.id, chatId));
    return chatId;
  } else {
    // Create new chat
    await db.insert(chats).values({
      id: chatId,
      userId,
      title,
    });
    if (newMessages.length > 0) {
      await db.insert(messages).values(
        newMessages.map((msg, idx) => ({
          chatId,
          role: msg.role,
          parts: msg,
          order: idx,
        }))
      );
    }
    return chatId;
  }
};

/**
 * Get a chat by id with its messages (ordered by 'order'). Only if the user owns the chat.
 */
export const getChat = async ({ userId, chatId }: { userId: string; chatId: string }) => {
  const chat = await db.query.chats.findFirst({
    where: and(eq(chats.id, chatId), eq(chats.userId, userId)),
  });
  if (!chat) return null;
  const chatMessages = await db.query.messages.findMany({
    where: eq(messages.chatId, chatId),
    orderBy: [messages.order],
  });
  return { ...chat, messages: chatMessages };
};

/**
 * Get all chats for a user (without messages).
 */
export const getChats = async ({ userId }: { userId: string }) => {
  return db.query.chats.findMany({
    where: eq(chats.userId, userId),
    orderBy: [chats.createdAt],
  });
}; 