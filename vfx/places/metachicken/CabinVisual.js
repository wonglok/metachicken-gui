import React, { useRef, Suspense } from "react";
import { useGLTF } from "@react-three/drei";

export function CabinVisual() {
  return (
    <group>
      {/*  */}
      {/*  */}
      {/*  */}
      {/*  */}
      <Suspense fallback={null}>
        <Cabin></Cabin>
      </Suspense>
    </group>
  );
}

export default function Cabin(props) {
  const group = useRef();
  const { nodes, materials } = useGLTF("/map/capbin/cabin.glb");
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        userData={{}}
        geometry={nodes.cabin.geometry}
        material={nodes.cabin.material}
        position={[0, 0.96, -0.1]}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes.joystick.geometry}
        material={nodes.joystick.material}
        position={[0, 0.47, -0.59]}
      />

      <mesh
        castShadow
        receiveShadow
        geometry={nodes["fly-ctrl"].geometry}
        material={nodes["fly-ctrl"].material}
        position={[0.48, 0.81, -0.94]}
      />

      <mesh
        castShadow
        receiveShadow
        userData={{
          enableBloom: true,
        }}
        geometry={nodes.screen.geometry}
        material={nodes.screen.material}
        position={[0, 0.96, -0.1]}
      />
    </group>
  );
}

useGLTF.preload("/map/capbin/cabin.glb");
