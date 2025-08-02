import { useMessageHistory } from "@/hooks/useMessageHistory";
import { MessageSender } from "@/types/type";
import React, { useEffect, useRef } from "react";



export const MessageHistory: React.FC = () => {
  const { messages } = useMessageHistory();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || messages.length === 0) return;

    container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="  w-[600px] overflow-y-auto flex flex-col gap-2 px-2 py-2 text-black self-center max-h-[150px]"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col gap-1 max-w-[350px] ${
            message.sender === MessageSender.CLIENT
              ? "self-end items-end"
              : "self-start items-start"
          }`}
        >
          <p className="text-xs text-zinc-400">
            {message.sender === MessageSender.AVATAR ? "Avatar" : "You"}
          </p>
          <p className="text-sm">{message.text}</p>
        </div>
      ))}
    </div>
  );
};
