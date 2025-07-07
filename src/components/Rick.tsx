import * as THREE from "three";
import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { JSX } from "react";

type GLTFResult = GLTF & {
  nodes: {
    Sphere002: THREE.SkinnedMesh;
    Sphere002_1: THREE.SkinnedMesh;
    Sphere002_2: THREE.SkinnedMesh;
    Sphere002_3: THREE.SkinnedMesh;
    Sphere002_4: THREE.SkinnedMesh;
    Sphere002_5: THREE.SkinnedMesh;
    Sphere002_6: THREE.SkinnedMesh;
    Sphere002_7: THREE.SkinnedMesh;
    Sphere002_8: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
  };
  materials: {
    ["Shoes and Eyes"]: THREE.MeshStandardMaterial;
    ["Skin.001"]: THREE.MeshStandardMaterial;
    ["Hair.001"]: THREE.MeshStandardMaterial;
    ["White.001"]: THREE.MeshStandardMaterial;
    ["Shirt.001"]: THREE.MeshStandardMaterial;
    ["Belt.001"]: THREE.MeshStandardMaterial;
    ["Buckle.001"]: THREE.MeshStandardMaterial;
    ["Trousers.001"]: THREE.MeshStandardMaterial;
    ["Socks.001"]: THREE.MeshStandardMaterial;
  };
};

type ActionName = "idle" | "jumping" | "run";
type TypedActions = Partial<Record<ActionName, THREE.AnimationAction>>;

export function Rick(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF(
    "/models/rick.glb"
  ) as unknown as GLTFResult;
  const { actions: rawActions } = useAnimations(animations, group);

  const actions = rawActions as TypedActions;

  useEffect(() => {
    actions["idle"]?.play();
  }, [actions]);

  return (
    <group ref={group} {...props} dispose={null} rotation={[0, Math.PI / 2, 0]}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <group name="Rick">
            <skinnedMesh
              name="Sphere002"
              geometry={nodes.Sphere002.geometry}
              material={materials["Shoes and Eyes"]}
              skeleton={nodes.Sphere002.skeleton}
            />
            <skinnedMesh
              name="Sphere002_1"
              geometry={nodes.Sphere002_1.geometry}
              material={materials["Skin.001"]}
              skeleton={nodes.Sphere002_1.skeleton}
            />
            <skinnedMesh
              name="Sphere002_2"
              geometry={nodes.Sphere002_2.geometry}
              material={materials["Hair.001"]}
              skeleton={nodes.Sphere002_2.skeleton}
            />
            <skinnedMesh
              name="Sphere002_3"
              geometry={nodes.Sphere002_3.geometry}
              material={materials["White.001"]}
              skeleton={nodes.Sphere002_3.skeleton}
            />
            <skinnedMesh
              name="Sphere002_4"
              geometry={nodes.Sphere002_4.geometry}
              material={materials["Shirt.001"]}
              skeleton={nodes.Sphere002_4.skeleton}
            />
            <skinnedMesh
              name="Sphere002_5"
              geometry={nodes.Sphere002_5.geometry}
              material={materials["Belt.001"]}
              skeleton={nodes.Sphere002_5.skeleton}
            />
            <skinnedMesh
              name="Sphere002_6"
              geometry={nodes.Sphere002_6.geometry}
              material={materials["Buckle.001"]}
              skeleton={nodes.Sphere002_6.skeleton}
            />
            <skinnedMesh
              name="Sphere002_7"
              geometry={nodes.Sphere002_7.geometry}
              material={materials["Trousers.001"]}
              skeleton={nodes.Sphere002_7.skeleton}
            />
            <skinnedMesh
              name="Sphere002_8"
              geometry={nodes.Sphere002_8.geometry}
              material={materials["Socks.001"]}
              skeleton={nodes.Sphere002_8.skeleton}
            />
          </group>
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/rick.glb");
