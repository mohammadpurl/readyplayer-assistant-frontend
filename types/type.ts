export declare enum VoiceEmotion {
    EXCITED = "excited",
    SERIOUS = "serious",
    FRIENDLY = "friendly",
    SOOTHING = "soothing",
    BROADCASTER = "broadcaster"
}
export declare enum ElevenLabsModel {
    eleven_flash_v2_5 = "eleven_flash_v2_5",
    eleven_multilingual_v2 = "eleven_multilingual_v2"
}
export interface ElevenLabsSettings {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    use_speaker_boost?: boolean;
}
export declare enum STTProvider {
    DEEPGRAM = "deepgram",
    GLADIA = "gladia"
}
export interface STTSettings {
    provider?: STTProvider;
    confidence?: number;
}

export interface StartAvatarResponse {
    session_id: string;
    access_token: string;
    url: string;
    is_paid: boolean;
    session_duration_limit: number;
}
export declare enum TaskType {
    TALK = "talk",
    REPEAT = "repeat"
}
export declare enum TaskMode {
    SYNC = "sync",
    ASYNC = "async"
}
export interface SpeakRequest {
    text: string;
    task_type?: TaskType;
    taskType?: TaskType;
    taskMode?: TaskMode;
}
export interface CommonRequest {
    [key: string]: any;
}
export declare enum StreamingEvents {
    AVATAR_START_TALKING = "avatar_start_talking",
    AVATAR_STOP_TALKING = "avatar_stop_talking",
    AVATAR_TALKING_MESSAGE = "avatar_talking_message",
    AVATAR_END_MESSAGE = "avatar_end_message",
    USER_TALKING_MESSAGE = "user_talking_message",
    USER_END_MESSAGE = "user_end_message",
    USER_START = "user_start",
    USER_STOP = "user_stop",
    USER_SILENCE = "user_silence",
    STREAM_READY = "stream_ready",
    STREAM_DISCONNECTED = "stream_disconnected",
    CONNECTION_QUALITY_CHANGED = "connection_quality_changed"
}
export type EventHandler = (...args: any[]) => void;
export interface EventData {
    [key: string]: unknown;
    task_id: string;
}
export interface StreamingStartTalkingEvent extends EventData {
    type: StreamingEvents.AVATAR_START_TALKING;
}
export interface StreamingStopTalkingEvent extends EventData {
    type: StreamingEvents.AVATAR_STOP_TALKING;
}
export interface StreamingTalkingMessageEvent extends EventData {
    type: StreamingEvents.AVATAR_TALKING_MESSAGE;
    message: string;
}
export interface StreamingTalkingEndEvent extends EventData {
    type: StreamingEvents.AVATAR_END_MESSAGE;
}
export interface UserTalkingMessageEvent extends EventData {
    type: StreamingEvents.USER_TALKING_MESSAGE;
    message: string;
}
export interface UserTalkingEndEvent extends EventData {
    type: StreamingEvents.USER_END_MESSAGE;
}
export enum MessageSender {
    CLIENT = "CLIENT",
    AVATAR = "AVATAR",
  }
  
  
  
export interface Passenger {
    fullName: string;
    nationalId: string;
    luggageCount: number;
  }
  
  export interface TicketInfo {
    airportName?: string;
    flightType?: "ورودی" | "خروجی";
    travelDate?: string;
    flightNumber?: string;
    passengers: Passenger[];
  }
  export interface MouthCue {
    start: number;
    end: number;
    value: string; // e.g., "A", "B", ..., "X"
  }
  
  export interface LipsyncMetadata {
    soundFile: string;
    duration: number;
  }
  
  export interface Lipsync {
    metadata: LipsyncMetadata;
    mouthCues: MouthCue[];
  }
  
  export interface Message {
    id?: string;
    text: string;
    audio?: string;
    lipsync?: Lipsync;
    facialExpression?: string; // e.g., "smile"
    animation?: string;        // e.g., "Laughing"
    sender?: MessageSender;
  }
  
    