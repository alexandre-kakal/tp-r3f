import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { JSX } from "react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { GLTF } from "three-stdlib";
import { usePlayerControls } from "../hooks/usePlayerControls";

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

type ActionName = "idle" | "jumping" | "runtrue";
type TypedActions = Partial<Record<ActionName, THREE.AnimationAction>>;

export interface RickRef {
  getPosition: () => THREE.Vector3;
}

export const Rick = forwardRef<RickRef, JSX.IntrinsicElements["group"]>(
  (props, ref) => {
    const group = useRef<THREE.Group>(null);
    const { nodes, materials, animations } = useGLTF(
      "/models/rick.glb"
    ) as unknown as GLTFResult;
    const { actions: rawActions } = useAnimations(animations, group);
    const controls = usePlayerControls();

    const actions = rawActions as TypedActions;
    const [currentAction, setCurrentAction] = useState<ActionName>("idle");

    // Utilisation de refs pour la position, la vélocité et l'état au sol
    const positionRef = useRef<{ x: number; y: number; z: number }>({
      x: 0,
      y: 0.24,
      z: 0,
    });
    const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isGroundedRef = useRef<boolean>(true);

    // Constantes de gameplay
    const MOVE_SPEED = 5;
    const JUMP_FORCE = 10;
    const GRAVITY = -20;
    const GROUND_Y = 0.24;

    // Exposer la position à la caméra
    useImperativeHandle(
      ref,
      () => ({
        getPosition: () =>
          new THREE.Vector3(
            positionRef.current.x,
            positionRef.current.y,
            positionRef.current.z
          ),
      }),
      []
    );

    // Gestion des animations
    useEffect(() => {
      // Arrêter toutes les animations
      Object.values(actions).forEach((action) => action?.stop());
      // Jouer l'animation actuelle
      if (actions[currentAction]) {
        actions[currentAction]?.reset().fadeIn(0.2).play();
      }
    }, [currentAction, actions]);

    // Logique de gameplay optimisée
    useFrame((state, delta) => {
      if (!group.current) return;

      // Mouvement horizontal
      velocityRef.current.x = 0;
      if (controls.moveLeft) {
        velocityRef.current.x -= MOVE_SPEED;
      }
      if (controls.moveRight) {
        velocityRef.current.x += MOVE_SPEED;
      }

      // Saut (empêcher le saut multiple)
      if (controls.jump && isGroundedRef.current) {
        velocityRef.current.y = JUMP_FORCE;
        isGroundedRef.current = false;
      }

      // Gravité
      if (!isGroundedRef.current) {
        velocityRef.current.y += GRAVITY * delta;
      }

      // Mise à jour de la position
      positionRef.current.x += velocityRef.current.x * delta;
      positionRef.current.y += velocityRef.current.y * delta;

      // Collision avec le sol (basique pour le moment)
      if (positionRef.current.y <= GROUND_Y) {
        positionRef.current.y = GROUND_Y;
        velocityRef.current.y = 0;
        isGroundedRef.current = true;
      }

      // Limitation des bordures de la map
      positionRef.current.x = Math.max(
        -10,
        Math.min(150, positionRef.current.x)
      );

      // Mise à jour de la position du modèle
      group.current.position.set(
        positionRef.current.x,
        positionRef.current.y,
        positionRef.current.z
      );

      // Orientation du personnage selon la direction
      if (controls.moveLeft) {
        group.current.rotation.y = -Math.PI / 2;
      } else if (controls.moveRight) {
        group.current.rotation.y = Math.PI / 2;
      }

      // Gestion des animations basée sur l'état
      let newAction: ActionName = "idle";
      if (!isGroundedRef.current) {
        newAction = "jumping";
      } else if (controls.moveLeft || controls.moveRight) {
        newAction = "runtrue";
      }
      if (newAction !== currentAction) {
        setCurrentAction(newAction);
      }
    });

    return (
      <group
        ref={group}
        {...props}
        dispose={null}
        // On ne passe plus la position via le state, mais la ref
        position={[
          positionRef.current.x,
          positionRef.current.y,
          positionRef.current.z,
        ]}
      >
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
);

Rick.displayName = "Rick";

useGLTF.preload("/models/rick.glb");
