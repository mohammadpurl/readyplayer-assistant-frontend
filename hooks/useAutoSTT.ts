import { useEffect, useRef, useState } from "react";
import { useVAD } from "./useVAD";
import { useChatContext } from "./useChat";

// SpeechRecognition types
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}


function normalizeText(text: string) {
  return text
    .replace(/[\s\n\r]+/g, " ")
    .replace(/[.,!?،؛:؛؟]/g, "")
    .trim()
    .toLowerCase();
}

// تابع محاسبه similarity با استفاده از Levenshtein Distance
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (str1.length === 0) return 0;
  if (str2.length === 0) return 0;

  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
}

// تابع محاسبه similarity با استفاده از Jaccard Similarity
function calculateJaccardSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 100;
  
  return Math.round((intersection.size / union.size) * 100);
}

// تابع ترکیبی برای محاسبه similarity
function calculateCombinedSimilarity(str1: string, str2: string): number {
  const levenshteinSimilarity = calculateSimilarity(str1, str2);
  const jaccardSimilarity = calculateJaccardSimilarity(str1, str2);
  
  // وزن‌دهی: 60% Levenshtein + 40% Jaccard
  const combinedSimilarity = (levenshteinSimilarity * 0.6) + (jaccardSimilarity * 0.4);
  
  return Math.round(combinedSimilarity);
}

export function useAutoSTT(
  enabled: boolean,
  onTranscript: (text: string) => void,
  isProcessing: boolean
) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);
  const { messages, isAvatarTalking } = useChatContext();
  const messagesRef = useRef(messages);

  // فراخوانی useVAD در سطح بالای هوک
  const { isSpeaking } = useVAD({ threshold: 0.015 });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!enabled || isProcessing || isAvatarTalking) {
      if (recognitionRef.current && isActiveRef.current) {
        recognitionRef.current.stop();
        isActiveRef.current = false;
        console.log("[STT] Stopped due to disabled, processing, or avatar talking");
      }
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    isActiveRef.current = false;

    recognition.lang = "fa-IR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isActiveRef.current = true;
      console.log("[STT] Started");
    };

    recognition.onend = () => {
      isActiveRef.current = false;
      console.log("[STT] Ended");
    };

    recognition.onerror = (e) => {
      console.warn("[STT] Error:", e);
      isActiveRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (isProcessing || isAvatarTalking) {
        console.log("[STT] Ignored result - processing or avatar talking");
        return;
      }

      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.length > 0) {
        const userText = normalizeText(finalTranscript);
        const currentMessages = messagesRef.current;
        const lastAvatarMessage =
          currentMessages.length > 0 && currentMessages[currentMessages.length - 1].sender === "AVATAR"
            ? currentMessages[currentMessages.length - 1]
            : null;

        if (lastAvatarMessage) {
          const avatarText = normalizeText(lastAvatarMessage.text);
          const combinedSimilarity = calculateCombinedSimilarity(userText, avatarText);
          const similarityThreshold = 85;

          if (combinedSimilarity >= similarityThreshold || userText.includes(avatarText) || avatarText.includes(userText)) {
            console.log("[STT] Ignored similar message:", {
              userText,
              avatarText,
              combinedSimilarity,
              threshold: similarityThreshold,
            });
            return;
          }
        }

        if (userText.length < 3) {
          console.log("[STT] Ignored short transcript:", userText);
          return;
        }

        console.log("[STT] Final transcript:", finalTranscript);
        onTranscript(finalTranscript);
      }
    };

    // مدیریت شروع STT بر اساس isSpeaking
    if (isSpeaking && !isActiveRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        console.log("[STT] Started after VAD trigger");
      } catch (e: any) {
        if (e.name === "InvalidStateError" || e.message?.includes("recognition has already started")) {
          // Ignore
        } else {
          console.warn("[STT] Start error:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      isActiveRef.current = false;
    };
  }, [enabled, isProcessing, isAvatarTalking, messages, onTranscript, isSpeaking]);

  return recognitionRef;
}