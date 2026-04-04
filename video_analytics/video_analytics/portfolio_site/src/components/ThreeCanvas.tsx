import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function NeuralWeb() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Creates glowing point cloud
  const particleCount = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 15;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#38bdf8" transparent opacity={0.6} sizeAttenuation={true} />
    </points>
  );
}

export default function ThreeCanvas() {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" color="#020617" near={2} far={15} />
        <ambientLight intensity={0.5} />
        <NeuralWeb />
        <Stars radius={10} depth={50} count={3000} factor={4} saturation={1} fade speed={1} />
      </Canvas>
    </div>
  );
}
