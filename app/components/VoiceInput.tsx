import { useAutoSTT } from "@/hooks/useAutoSTT";
import { useChatContext } from "@/hooks/useChat";


// Helper function to normalize text
function normalizeText(text: string): string {
  return text
    .replace(/[\s\n\r]+/g, " ")
    .replace(/[.,!?،؛:؛؟]/g, "")
    .trim()
    .toLowerCase();
}



export const VoiceInput = () => {
    const { chat, isProcessing, isAvatarTalking, isSessionActive } = useChatContext();
  
    console.log("VoiceInput: isProcessing:", isProcessing, "isAvatarTalking:", isAvatarTalking, "isSessionActive:", isSessionActive);
  
    useAutoSTT(
      isSessionActive && !isProcessing && !isAvatarTalking, // فقط وقتی session فعال است و نه در حال پردازش هستیم و نه آواتار صحبت می‌کند
      (text) => {
        if (!isSessionActive || isProcessing || isAvatarTalking) {
          console.log("VoiceInput: Ignored transcript - session not active, processing, or avatar talking");
          return;
        }
        debugger;
        const normalizedText = normalizeText(text);
        if (normalizedText.length < 3) {
          console.log("[STT] Ignored short message:", normalizedText);
          return;
        }
  
        console.log("VoiceInput: Processing user input:", text);
        chat(text);
      },
      isProcessing
    );
  
    return null;
  };