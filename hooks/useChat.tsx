import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from "react";
import { sendUserMessage } from "@/services/api"; 
import { Message, MessageSender } from "@/types/type";

/**
 * ChatContextType provides all chat-related state and actions for consumers.
 */
interface ChatContextType {
  // Messages
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  lastAvatarMessage: Message | null;
  
  // Chat functionality
  chat: (msg: string) => Promise<void>;
  onMessagePlayed: () => void;
  
  // UI states
  loading: boolean;
  cameraZoomed: boolean;
  setCameraZoomed: (v: boolean) => void;
  
  // Voice states
  isListening: boolean;
  setIsListening: (v: boolean) => void;
  isUserTalking: boolean;
  setIsUserTalking: (v: boolean) => void;
  isAvatarTalking: boolean;
  setIsAvatarTalking: (v: boolean) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  
  // Utility functions
  handleEndMessage: () => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * ChatProvider wraps your app and provides chat state and actions via context.
 */
export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // اضافه کردن قفل برای مدیریت درخواست‌ها
  const requestLockRef = useRef(false);
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastAvatarMessage, setLastAvatarMessage] = useState<Message | null>(null);
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [cameraZoomed, setCameraZoomed] = useState<boolean>(true);
  
  // Voice states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isUserTalking, setIsUserTalking] = useState<boolean>(false);
  const [isAvatarTalking, setIsAvatarTalking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Chat function
  const chat = async (msg: string) => {
    
    // اگر در حال پردازش هستیم، پیام جدید را نادیده بگیر
    if (isProcessing) {
      console.log("Chat: Ignoring message - already processing:", msg);
      return;
    }
    // بررسی قفل درخواست
    if (requestLockRef.current) {
      console.log("Chat: Ignoring message - request lock active:", msg);
      return;
    }

    // تنظیم قفل
    requestLockRef.current = true;
    setIsProcessing(true);
    setLoading(true);
    try {
      const userMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: msg,
        sender: MessageSender.CLIENT
      };
      
      setMessages((prev: Message[]) => [...prev, userMessage]);

      const data = await sendUserMessage(msg); 
      const resp = data.messages;
      
      const newAssistantMessage: Message = {
        id: Date.now().toString(),
        text: resp[0].text,
        audio: resp[0].audio,
        lipsync: resp[0].lipsync,
        facialExpression: resp[0].facialExpression,
        animation: resp[0].animation,
        sender: MessageSender.AVATAR
      };

      if(resp[0].audio) {
        setIsAvatarTalking(true);
      }
      else {
        setIsAvatarTalking(false);
      }
      setMessages((prev: Message[]) => [...prev,  newAssistantMessage]);
      setLastAvatarMessage(newAssistantMessage); // به‌روزرسانی مستقیم برای جلوگیری از تأخیر
      setIsAvatarTalking(!!resp[0].audio);
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      requestLockRef.current = false; // آزاد کردن قفل
    }

  };

  const onMessagePlayed = () => {
    setMessages((prev: Message[]) => prev.slice(1));
    setIsAvatarTalking(false);
    setIsProcessing(false);
    requestLockRef.current = false; // اطمینان از آزاد شدن قفل
    console.log("Chat: Message played, ready for next message");
  };
    const handleEndMessage = useCallback(() => {
      // setIsAvatarTalking(false);
      setIsUserTalking(false);
      setIsListening(false);
    }, []);

  const addMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);
  const clearMessages = () => setMessages([]);

  // Update lastAvatarMessage when messages change
  useEffect(() => {
    console.log("ChatContext: messages changed", messages);
    if (messages?.length > 0) {
      if(messages[messages?.length - 1].sender === MessageSender.AVATAR) {
        console.log("ChatContext: Setting last avatar message", messages[messages?.length - 1]);
        setLastAvatarMessage(messages[messages?.length - 1]);
      }
    } else {
      setLastAvatarMessage(null);
    }
  }, [messages]);


  

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        lastAvatarMessage,
        chat,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
        isListening,
        setIsListening,
        isUserTalking,
        setIsUserTalking,
        isAvatarTalking,
        setIsAvatarTalking,
        isProcessing,
        setIsProcessing,
        handleEndMessage,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

/**
 * useChatContext provides access to the chat context.
 */
export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within a ChatProvider");
  return ctx;
}; 