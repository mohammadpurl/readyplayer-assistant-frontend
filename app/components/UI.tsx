'use client'
import { useChatContext } from "@/hooks/useChat";
import { useRef, useState, useEffect } from "react";
import { VoiceInput } from "./VoiceInput";
import { MessageHistory } from "./MessageHistory";
import { QRCodeSVG } from "qrcode.react";
import { introduction } from "@/services/api";


interface UIProps {
  hidden?: boolean;
}

export const UI = ({ hidden, ...props }: UIProps) => {
  const input = useRef<HTMLInputElement>(null);
  const { 
    chat, 
    loading, 
    cameraZoomed, 
    setCameraZoomed, 
    isSessionActive, 
    startSession, 
    getIntroduction,
    endSession,
    showQRCode,
    tripId,
    
  } = useChatContext();
  const [audioEnabled, setAudioEnabled] = useState(false);

  // فعال کردن صدا در اولین کلیک کاربر
  useEffect(() => {
    const enableAudioOnFirstClick = () => {
      if (!audioEnabled) {
        setAudioEnabled(true);
        console.log("Audio enabled on first click");
        // حذف event listener بعد از فعال شدن
        document.removeEventListener('click', enableAudioOnFirstClick);
      }
    };

    document.addEventListener('click', enableAudioOnFirstClick);
    return () => {
      document.removeEventListener('click', enableAudioOnFirstClick);
    };
  }, [audioEnabled]);

  const sendMessage = () => {
    const text = input.current?.value;
    if (!loading && text && isSessionActive) {
      chat(text);
      if (input.current) input.current.value = "";
    } else if (!isSessionActive) {
      alert("Please start a session first!");
    }
  };

  


  if (hidden) {
    return null;
  }

  return (
    <>
      <VoiceInput />
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        <div className="self-start backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">My Virtual Assistant</h1>
          {!audioEnabled && (
            <div className="text-sm text-gray-600 mt-2">
              Click anywhere to enable audio
            </div>
          )}
          
          {/* Session Management Buttons */}
          <div className="mt-4 flex gap-2">
            {!isSessionActive ? (
              <button
              onClick={async () => {
                await startSession();
                await getIntroduction(); // دوباره اجرا می‌شود
              }}
                className="pointer-events-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                🎤 Start Voice Session
              </button>
            ) : (
              <button
                onClick={endSession}
                className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                ⏹️ End Session
              </button>
            )}
          </div>
          {showQRCode && (
                <div
                  style={{
                    position: "absolute",
                    top: 26,
                    left: 16,
                    background: "white",
                    borderRadius: 8,
                    padding: 12,
                    zIndex: 30,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    minWidth: 120,
                    minHeight: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h2 style={{ fontSize: 14, marginBottom: 8 }}>
                    برای مشاهده و ویرایش بلیط، QR را اسکن کنید:
                  </h2>
                  <QRCodeSVG
                    value={`${window.location.origin}/ticket/${tripId}`}
                    size={96}
                  />
                  <a
                    href={`/ticket/${tripId}`}
                    style={{ fontSize: 12, marginTop: 8 }}
                    className="text-black"
                  >
                    اینجا کلیک کنید
                  </a>
                </div>
              )}
          
          {isSessionActive && (
            <>
            <div className="text-sm text-green-600 mt-2 font-medium">
              🟢 Session Active - Speak now!
            </div>
            <MessageHistory />
            </>
          )}
        </div>
        <div className="w-full flex flex-col items-end justify-center gap-4">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body?.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body?.classList.add("greenScreen");
              }
            }}
            className="pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
          <input
            className="w-full placeholder:text-gray-800 placeholder:italic p-4 rounded-md bg-opacity-50 bg-white backdrop-blur-md"
            placeholder="Type a message..."
            ref={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button
            disabled={loading}
            onClick={sendMessage}
            className={`bg-pink-500 hover:bg-pink-600 text-white p-4 px-10 font-semibold uppercase rounded-md ${loading ? "cursor-not-allowed opacity-30" : ""
              }`}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
};
