import {
  OrbitControls as DreiOrbit,
  Sphere,
  Text,
  useGLTF,
  useProgress,
  useTexture,
  Text as DreiText,
} from "@react-three/drei";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimationMixer,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  CubeRefractionMapping,
  CubeReflectionMapping,
  DoubleSide,
} from "three";
// import { useEnvLight } from "../vfx/utils/use-env-light";
import { useDrag, useWheel } from "@use-gesture/react";

export default function Page() {
  let [url, setURL] = useState(false);

  return (
    <div className="full">
      <style>
        {
          /* css */ `
          html,body,#__next,.full{
            height: 100%;
            width: 100%;
          }
        `
        }
      </style>
      {!url && (
        <div>
          <input
            type={`file`}
            onChange={({
              target: {
                files: [first],
              },
            }) => {
              //
              setURL(URL.createObjectURL(first));
            }}
          ></input>
          <button
            onClick={() => {
              setURL(`/map/testout/testout.glb`);
            }}
          >
            Use Default Map, Enter Game
          </button>

          <div>
            <br /> <br /> <br /> <br /> ::Please make sure your camera is
            called: <br /> OrigCamera
          </div>
          <div>
            <br /> <br /> <br /> <br /> ::use Scroll for Mouse / Drag on iPhone
          </div>
        </div>
      )}

      <Canvas dpr={[1, 3]} style={{ height: "100%" }}>
        <Suspense
          fallback={
            <group>
              <DreiText color="red" fontSize={0.5}>
                Loading....
              </DreiText>
            </group>
          }
        >
          {url && <Content url={url}></Content>}
        </Suspense>
      </Canvas>
    </div>
  );
}

function Content({ url }) {
  let { get } = useThree();

  // let { envMap } = useEnvLight();
  let gltf = useGLTF(url);
  get().gl.physicallyCorrectLights = true;
  //

  let duration = Math.min(...gltf.animations.map((e) => e.duration));

  let mixer = useMemo(() => {
    gltf.scene.traverse((it) => {
      if (it.geometry) {
        let orig = it.material.flatShading;

        it.geometry.computeVertexNormals();
        it.material = new MeshStandardMaterial({
          color: 0xffffff,
          flatShading: orig,
          side: DoubleSide,
        });
        // it.material.envMap = envMap;
        it.material.metalness = 0.5;
        it.material.roughness = 0.5;
        it.needsUpdate = true;
        // envMap.mapping = CubeReflectionMapping;
      }
    });

    return new AnimationMixer(gltf.scene);
  }, [gltf]);

  useEffect(() => {
    get().gl.autoClear = false;
    get().camera.name = "SceneControls";
    get().camera.fov = 35;
    if (window.innerWidth <= 500) {
      get().camera.fov = 60;
    }
    get().camera.updateProjectionMatrix();
    gltf.animations.forEach((c) => {
      let action = mixer.clipAction(c);
      action.reset();
      action.repetitions = Infinity;
      action.play();
    });
  });

  useEffect(() => {
    let o3d = new Object3D();
    let yas = gltf.scene.getObjectByName(`ORIGINAL_COPY_OrigCamera`);
    yas.add(o3d);

    o3d.add(get().camera);
    o3d.rotation.x = -0.5 * Math.PI;
    get().camera.rotation.set(0, 0, 0, "XYZ");
    get().camera.position.set(0, 0, 0);

    let ptl = new PointLight(0xffffff, 0.3, 50, 2);
    get().camera.add(ptl);

    return () => {
      get().camera.remove(ptl);
    };
  }, [gltf, get]);

  let prog = useRef(0);
  let vel = useRef(0);

  useWheel(
    (st) => {
      st.event.preventDefault();
      vel.current = -st.event.deltaY / 50;
    },
    {
      preventDefault: true,
      target: get().gl.domElement.parentElement,
      eventOptions: { passive: false },
    }
  );

  useDrag(
    (st) => {
      st.event.preventDefault();

      vel.current = -st.delta[1] / 15;
    },
    {
      preventDefault: true,
      target: get().gl.domElement,
      eventOptions: { passive: false },
    }
  );

  useEffect(() => {
    get().gl.domElement.style.touchAction = "none";
    get().gl.domElement.parentElement.style.touchAction = "none";
  });

  //
  useFrame(() => {
    // mixer.update(1 / 60);

    prog.current += (vel.current / 1000) * 30;
    prog.current += (1 / 60) * 0.1;
    vel.current *= 0.98;

    let max = duration * (1.0 - 0.015);
    if (prog.current >= max) {
      prog.current = max;
    }

    if (prog.current <= 0.015) {
      prog.current = 0.015;
    }

    mixer.setTime(prog.current);
  });

  return (
    <group>
      {/* {createPortal(
        <group>
          <group rotation={[Math.PI * -0.5, 0, 0]}>
            <primitive object={get().camera}> </primitive>
            <pointLight intensity={1}></pointLight>
          </group>
        </group>,
        gltf.scene.getObjectByName("ORIGINAL_COPY_OrigCamera")
      )} */}

      <ambientLight intensity={0.1} position={[1, 1, 1]} />
      <directionalLight intensity={0.2} position={[1, 1, 1]} />
      <primitive object={gltf.scene}></primitive>
      {/* <gridHelper args={[100, 100, "blue", "green"]}></gridHelper> */}
      {/*  */}
      {/*  */}
      {/*  */}
    </group>
  );
}
