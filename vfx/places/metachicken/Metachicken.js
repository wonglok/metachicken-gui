import { useGLTF } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Preload } from "../../canvas/Preload/Preload";
import { Starter } from "../../canvas/Starter/Starter";
import { Assets, AQ } from "./Assets";
import {
  AxesHelper,
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
import { SimpleBloomer } from "../../canvas/PostProcessing/SimpleBloomer";
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

export default function Metachicken() {
  let o3d = new Object3D();
  let trackers = useMemo(() => {
    o3d.children.forEach((e) => {
      o3d.remove(e);
    });
    let list = [];

    for (let i = 0; i < 512; i++) {
      let o = new Object3D();
      o.position.x = Math.random() - 0.5;
      o.position.y = Math.random() - 0.5;
      o.position.z = Math.random() - 0.5;
      o.position.multiplyScalar(50);
      o.position.z += -35;
      o3d.add(o);
      list.push(o);
    }

    return list;
  }, [o3d]);

  return (
    <div className="h-full w-full">
      <Starter>
        <Preload Assets={Assets}>
          <CabinControls Now={Now} higherCamera={2.0}>
            <pointLight intensity={30} position={[0, 1, 0]} />

            <group name={"place"}>
              <CabinVisual></CabinVisual>
            </group>
            <group position={[0, 0, 0]} name={"dots"}>
              <primitive object={o3d} />
            </group>
          </CabinControls>

          <TrackerFly trackers={trackers}></TrackerFly>
          {/* <FunSimCom></FunSimCom> */}

          {/* <MapLoader></MapLoader> */}
          <SimpleBloomer></SimpleBloomer>

          <gridHelper
            position={[0, -15, 0]}
            args={[1500, 50, "cyan", "cyan"]}
          />

          <AutoSky />
        </Preload>
      </Starter>
    </div>
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

  let sim = useMemo(() => {
    return new TrackO3D({
      node: mini,
      tailLength: 32, // 512, 1024
      howManyTrackers: trackers.length,
    });
  }, [trackers, trackers.length]);

  useFrame(() => {
    sim.track({ trackers, lerp: 0.5 });
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
