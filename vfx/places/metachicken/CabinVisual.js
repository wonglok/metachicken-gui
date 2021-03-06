import React, { useRef, Suspense, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Object3D, Camera } from "three";

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
  const group = useRef(new Object3D());
  const { nodes, materials } = useGLTF("/map/capbin/cabin-v1.glb");

  let fk = new Camera();
  useFrame(({ camera }) => {
    if (group.current) {
      let joystick = group.current.getObjectByName("joystick");
      if (joystick) {
        // joystick.rotation.y = camera.rotation.y;
        // joystick.rotation.x = (Math.PI * 0.25 + camera.rotation.x) * 0.1;

        fk.quaternion.slerp(camera.quaternion, 0.05);

        fk.rotation.x *= 0.5;
        fk.rotation.y *= 0.5;
        fk.rotation.z *= 0.5;

        joystick.rotation.copy(fk.rotation);

        if (joystick.rotation.x <= -0.1) {
          joystick.rotation.x = -0.1;
        }
        if (joystick.rotation.x >= 0.1) {
          joystick.rotation.x = 0.1;
        }

        if (joystick.rotation.z <= -0.1) {
          joystick.rotation.z = -0.1;
        }
        if (joystick.rotation.z >= 0.1) {
          joystick.rotation.z = 0.1;
        }

        if (joystick.rotation.y <= -0.1) {
          joystick.rotation.y = -0.1;
        }
        if (joystick.rotation.y >= 0.1) {
          joystick.rotation.y = 0.1;
        }
      }
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        userData={{}}
        geometry={nodes.cabin.geometry}
        material={nodes.cabin.material}
        position={[0, 0.96, -0.1]}
      />
      <mesh
        name="joystick"
        geometry={nodes.joystick.geometry}
        material={nodes.joystick.material}
        position={[0, 0.47, -0.59]}
      />
      <mesh
        geometry={nodes["fly-ctrl"].geometry}
        material={nodes["fly-ctrl"].material}
        position={[0.48, 0.81, -0.94]}
      />
      <mesh
        userData={{
          enableBloom: true,
        }}
        geometry={nodes.screen.geometry}
        material={nodes.screen.material}
        position={[0, 0.96, -0.1]}
      />
      <mesh
        geometry={nodes.Cube.geometry}
        material={materials.thecross}
        position={[0.22, 1.06, -0.93]}
        rotation={[-0.34, 0, 0]}
        scale={[0.15, 0.15, 0.15]}
      />
    </group>
  );
}

// useGLTF.preload("/map/capbin/cabin.glb");
