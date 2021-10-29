import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import {
  AxesHelper,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  SphereBufferGeometry,
  Vector3,
} from "three";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { ColliderManager } from "../../classes/ColliderManager";
import { PlayerCollider } from "../../canvas/PlayerCollider/PlayerCollider";
import { Now } from "../../store/Now";
import { SimpleBloomerStrong } from "../../canvas/PostProcessing/SimpleBloomerStrong";
import { StarSky } from "../../canvas/StarSky/StarSky";
import { useEnvLight } from "../../utils/use-env-light";
// import { WalkerFollowerControls } from "../../canvas/Controls/WalkerFollowerControls";
import { PlayerDisplay } from "../../canvas/PlayerDisplay/PlayerDisplay";
// import { ForceGraphR3F } from "../../explore/ForceGraphR3F";
// import { useAutoEvent } from "../../utils/use-auto-event";
// import { baseURL } from "..";
// import router from "next/router";
import { useMiniEngine } from "../../utils/use-mini-engine";
import { FunSim } from "../simulation/FunSim";
import { CabinControls } from "../../canvas/Controls/CabinControls";
import { CabinVisual } from "./CabinVisual";
import { TrackO3D } from "../fly/TrackO3D";

const CHICKEN_COUNT = 64;

export default function Metachicken() {
  let o3d = new Object3D();
  let { trackers } = useMemo(() => {
    o3d.children.forEach((e) => {
      o3d.remove(e);
    });
    let list = [];

    for (let i = 0; i < CHICKEN_COUNT; i++) {
      let o = new Object3D();
      o.name = "chick" + i;
      o.position.x = Math.random() - 0.5;
      o.position.y = Math.random() - 0.5;
      o.position.z = Math.random() - 0.5;
      o.position.multiplyScalar(25);

      o.userData.lerp = Math.random();
      o.userData.oPos = o.position.clone();
      o.scale.setScalar(0.5);
      o3d.add(o);
      list.push(o);
    }

    return { trackers: list };
  }, [o3d]);

  return (
    <div
      className="h-full w-full"
      style={{ userSelect: "none", touchAction: "none" }}
    >
      <Starter reducedMaxDPI={2}>
        <Preload Assets={Assets}>
          <CabinControls Now={Now} higherCamera={2.0}>
            <pointLight intensity={30} position={[0, 1, 0]} />

            <group
              name={"place"}
              position={[0, 0.02, 0]}
              rotation={[-0.09 * Math.PI, 0, 0]}
            >
              <CabinVisual></CabinVisual>
            </group>

            <group name="chickensCentral" position={[0, 0, -30]}></group>
          </CabinControls>

          <group position={[0, 0, 0]} name={"dots"}>
            <primitive object={o3d} />
          </group>

          <Suspense fallback={null}>
            <ChickenPlacement trackers={trackers}></ChickenPlacement>
          </Suspense>
          <TrackerFly trackers={trackers}></TrackerFly>
          {/* <FunSimCom></FunSimCom> */}

          {/* <MapLoader></MapLoader> */}
          {/* <SimpleBloomerStrong></SimpleBloomerStrong> */}

          <gridHelper
            userData={{
              enableBloom: false,
            }}
            position={[0, -25, 0]}
            args={[1500, 50, "cyan", "cyan"]}
          />

          <AutoSky />
        </Preload>
      </Starter>
    </div>
  );
}

function ChickenPlacement({ trackers }) {
  // let chick = `/objects/spacechicken/chicken-space-suit.glb`;
  let group = useRef();
  // let gltf = useGLTF(chick);
  const { nodes, materials } = useGLTF(
    "/objects/spacechicken/chicken-merged-mesh.glb"
  );

  useEffect(() => {
    nodes.Mesh_0.geometry.rotateY(Math.PI);
    nodes.Mesh_0_1.geometry.rotateY(Math.PI);
    nodes.Mesh_0_2.geometry.rotateY(Math.PI);
  }, []);

  let v3 = new Vector3();
  useFrame(({ camera, scene }) => {
    if (group.current) {
      /** @type {InstancedMesh} */
      let body = group.current.getObjectByName("body");
      /** @type {InstancedMesh} */
      let red = group.current.getObjectByName("red");
      /** @type {InstancedMesh} */
      let yellow = group.current.getObjectByName("yellow");

      let chickensCentral = scene.getObjectByName("chickensCentral");

      if (chickensCentral) {
        trackers.forEach((tt, idx) => {
          chickensCentral.getWorldPosition(v3);
          v3.add(tt.userData.oPos);

          tt.position.lerp(v3, 0.015 * tt.userData.lerp * 2.0);

          v3.multiplyScalar(2);
          tt.lookAt(v3.x, v3.y, v3.z);

          //
          // tt.lookAt(camera.position);
          // tt.rotation.y += -1 * Math.PI;

          body.setMatrixAt(idx, tt.matrix);
          red.setMatrixAt(idx, tt.matrix);
          yellow.setMatrixAt(idx, tt.matrix);

          body.instanceMatrix.needsUpdate = true;
          red.instanceMatrix.needsUpdate = true;
          yellow.instanceMatrix.needsUpdate = true;
        });
      }
    }
  });

  return (
    <group ref={group}>
      <instancedMesh
        userData={{ enableBloom: false }}
        name="body"
        args={[nodes.Mesh_0.geometry, materials.body, CHICKEN_COUNT]}
      />
      <instancedMesh
        userData={{ enableBloom: false }}
        name="red"
        args={[nodes.Mesh_0_1.geometry, materials.red, CHICKEN_COUNT]}
      />
      <instancedMesh
        userData={{ enableBloom: false }}
        name="yellow"
        args={[nodes.Mesh_0_2.geometry, materials.yellow, CHICKEN_COUNT]}
      />
    </group>
  );
}

function AutoSky() {
  useFrame(({ scene, camera }) => {
    let starskyA = scene.getObjectByName("starskyA");
    if (starskyA) {
      starskyA.position.lerp(camera.position, 0.3);
    }
  });

  return (
    <group name="starskyA">
      <StarSky></StarSky>
    </group>
  );
}

function TrackerFly({ trackers }) {
  let { mini } = useMiniEngine();

  let near = (aSize) => {
    return Math.pow(2, Math.ceil(Math.log(aSize) / Math.log(2)));
  };
  let sim = useMemo(() => {
    return new TrackO3D({
      node: mini,
      tailLength: 128, // 512, 1024
      howManyTrackers: near(trackers.length),
    });
  }, [trackers, trackers.length]);

  useFrame(() => {
    sim.track({ trackers, lerp: 0.1 });
  });

  return (
    <group>
      <primitive object={sim.o3d} />
    </group>
  );
}

function MapLoader() {
  return (
    <group>
      <Suspense fallback={null}>
        <MapContent></MapContent>
      </Suspense>
    </group>
  );
}

function MapContent() {
  let { get } = useThree();
  let gltf = useGLTF(AQ.floorMap.url);
  let { envMap } = useEnvLight();

  let floor = useMemo(() => {
    let floor = SkeletonUtils.clone(gltf.scene);
    // floor.rotation.y = Math.PI * 0.5;

    let startAt = floor.getObjectByName("startAt");
    if (startAt) {
      startAt.getWorldPosition(Now.startAt);
      startAt.getWorldPosition(Now.avatarAt);
      startAt.getWorldPosition(Now.goingTo);
      Now.goingTo.y += 1.3;
    }
    return floor;
  }, [gltf]);

  let colliderManager = useMemo(() => {
    return new ColliderManager({ floor, scene: get().scene });
  }, [floor]);

  let o3d = new Object3D();

  let metagraph = useRef();

  useEffect(() => {
    //
    //
    if (metagraph.current) {
      floor
        .getObjectByName("startAt")
        .getWorldPosition(metagraph.current.position);
      metagraph.current.position.x += -1;
      metagraph.current.position.y += 1.3;
      metagraph.current.position.z += -5;
      metagraph.current.scale.setScalar(0.03);
    }
    //
    //
  }, []);

  return (
    <group rotation={[0, Math.PI * -1, 0]}>
      <directionalLight intensity={3} position={[3, 3, 3]} />
      <primitive object={o3d}></primitive>
      {createPortal(<primitive object={floor}></primitive>, o3d)}

      {createPortal(
        <group visible={false}>
          <primitive object={colliderManager.preview}></primitive>
        </group>,
        o3d
      )}

      {/* <PlayerCollider
        Now={Now}
        colliderMesh={colliderManager.collider}
      ></PlayerCollider>

      <PlayerDisplay
        lookBack={true}
        envMap={envMap}
        Now={Now}
        floor={floor}
        isSwim={true}
      ></PlayerDisplay> */}

      {/*
      <group ref={metagraph}>
        <ForceGraphR3F></ForceGraphR3F>
      </group> */}

      {/* <WalkerFollowerControls floor={floor}></WalkerFollowerControls> */}
    </group>
  );
}
