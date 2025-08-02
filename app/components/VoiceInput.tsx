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
    const { chat, isProcessing, isAvatarTalking } = useChatContext();
  
    // console.log("VoiceInput: isProcessing:", isProcessing, "isAvatarTalking:", isAvatarTalking);
  
    useAutoSTT(
      !isProcessing && !isAvatarTalking, // فقط وقتی نه در حال پردازش هستیم و نه آواتار صحبت می‌کند
      (text) => {
        debugger;
        if (isProcessing || isAvatarTalking) {
          console.log("VoiceInput: Ignored transcript - processing or avatar talking");
          return;
        }
  
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