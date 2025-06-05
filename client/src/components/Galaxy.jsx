// src/components/GalaxyModel.jsx
"use client"; // If using Next.js App Router and hooks

import React from 'react'; // useRef is not directly used in this component's render
import { useGLTF } from '@react-three/drei';

export function GalaxyModel(props) { // Renamed for clarity if you prefer, e.g., export function Galaxy(props)
  const { nodes, materials } = useGLTF('/models/need_some_space.glb'); // Path to your GLB in /public folder

  // You might want to inspect materials['Scene_-_Root']
  // console.log("Galaxy Material:", materials['Scene_-_Root']);
  // It's likely a PointsMaterial. You might be able to tweak its properties if needed,
  // for example, if it doesn't have vertexColors:
  // materials['Scene_-_Root'].size = 0.1; // Example: adjust point size
  // materials['Scene_-_Root'].color.set('lightblue'); // Example: set a base color

  return (
    <group {...props} dispose={null}> {/* Pass all props (position, rotation, scale) to the group */}
      <points
        geometry={nodes.Object_2.geometry}
        material={materials['Scene_-_Root']} // Ensure vertex colors are used if available
        rotation={[-Math.PI / 2, 0, 0]} // This is the baked-in rotation from gltfjsx
        scale={0.013}                   // This is the baked-in scale from gltfjsx
      />
    </group>
  );
}

// Preload the model for faster initial rendering
useGLTF.preload('/need_some_space.glb');