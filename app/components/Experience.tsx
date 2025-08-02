'use client'
import {
  CameraControls,
  Environment,
  Float,
  MeshReflectorMaterial,
  RenderTexture,
  Text,
  useFont,
  ContactShadows,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useChatContext } from "@/hooks/useChat";
import { Suspense, useEffect, useRef } from "react";

import { Color } from "three";
import { Avatar } from "./Avatar";
import React from "react";

const Dots = (props: React.ComponentProps<'group'>) => {
  const { loading } = useChatContext();
  const [loadingText, setLoadingText] = React.useState("");
  React.useEffect(() => {
    if (!loading) {
      setLoadingText("");
      return;
    }
    const interval = setInterval(() => {
      setLoadingText((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [loading]);
  if (!loading) {
    return null;
  }
  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

export const Experience = () => {
  const cameraControls = useRef<CameraControls>(null);
  const { cameraZoomed } = useChatContext();

  useEffect(() => {
    cameraControls.current?.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed && cameraControls.current) {
      cameraControls.current?.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current?.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);
  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="city" />
      {/* Wrapping Dots into Suspense to prevent Blink when Troika/Font is loaded */}
      <Suspense>
        <Dots position-y={1.75} position-x={-0.02} />
      </Suspense>
      <Avatar />
      <ContactShadows opacity={0.7} />
    </>
  );
};
