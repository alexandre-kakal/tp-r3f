import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Map from "./components/Map";
import "./App.css";
import { Rick } from "./components/Rick";

function App() {
  return (
    <Canvas camera={{ position: [10, 7, 18], fov: 50 }} shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <Map />
      <Rick />
      <OrbitControls />
    </Canvas>
  );
}

export default App;
