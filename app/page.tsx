'use client'
import { UI } from "./components/UI";
import { Experience } from "./components/Experience";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ChatProvider } from "@/hooks/useChat";
import { Leva } from "leva";
import { Loader } from "@react-three/drei";
import { MessageHistory } from "./components/MessageHistory";
import { ColorTest } from "./components/ColorTest";

export default function Home() {
  return (
    <main className="h-screen">
      <ChatProvider>
        <div className="h-full">
          <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </Canvas>
        <Loader />
        <Leva hidden />
        <UI hidden={false}/>
       

        </div>
        
        {/* Uncomment the line below to test colors */}
        {/* <ColorTest /> */}
      </ChatProvider>
    </main>
  );
}
