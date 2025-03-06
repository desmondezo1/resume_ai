import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AudioReactiveGlobeProps {
  isListening: boolean;
  onInitAudio: () => Promise<{ analyser: AnalyserNode; dataArray: Uint8Array }>;
}

const AudioReactiveGlobe: React.FC<AudioReactiveGlobeProps> = ({ 
  isListening, 
  onInitAudio 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const origVerticesRef = useRef<Float32Array | null>(null);
  
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  
  // For visualizing AI speech when no microphone input is detected
  const [aiSpeakingSimulator, setAiSpeakingSimulator] = useState<NodeJS.Timeout | null>(null);
  const [simulatedVolume, setSimulatedVolume] = useState<number[]>([]);

  // Initialize the scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 2.5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(
      containerRef.current.clientWidth, 
      containerRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create ambient light
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // Create directional light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 3, 5);
    scene.add(light);
    
    // Create globe geometry
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create material with style
    const material = new THREE.MeshPhongMaterial({
      color: 0xE50914, // Netflix red
      wireframe: true,
      emissive: 0xE50914, // Netflix red glow
      emissiveIntensity: 0.4,
      shininess: 30
    });
    
    // Create globe mesh
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globeRef.current = globe;
    
    // Store the original vertices
    origVerticesRef.current = new Float32Array(geometry.attributes.position.array);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(
        containerRef.current.clientWidth, 
        containerRef.current.clientHeight
      );
    };
    
    window.addEventListener('resize', handleResize);

    // Start animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (!globeRef.current) return;
      
      // Rotate globe
      globeRef.current.rotation.y += 0.003;
      
      // If audio is active, deform the globe based on sound
      if (isListening && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        
        // Check if there's actual audio input (user speaking)
        let hasSignificantAudio = false;
        let averageVolume = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
          averageVolume += dataArray[i];
          // Check if any frequency bin has significant volume
          if (dataArray[i] > 25) {
            hasSignificantAudio = true;
          }
        }
        averageVolume /= dataArray.length;
        
        // If no significant audio input detected, this might be the AI speaking
        // or a moment of silence. Either way, we'll simulate some movement
        if (!hasSignificantAudio && isListening) {
          if (!aiSpeakingSimulator) {
            // Start simulating AI speaking pattern
            const simulatorInterval = setInterval(() => {
              // Generate new simulated volume values
              const newVolumes = Array(dataArray.length).fill(0).map(() => 
                Math.random() * 100 + 50 // Random values between 50-150
              );
              setSimulatedVolume(newVolumes);
            }, 100);
            setAiSpeakingSimulator(simulatorInterval);
          }
          
          // Use simulated volumes when no real audio is detected
          for (let i = 0; i < dataArray.length; i++) {
            dataArray[i] = simulatedVolume[i] || 50;
          }
          averageVolume = 70; // Set a default "speaking" volume
        } else if (hasSignificantAudio && aiSpeakingSimulator) {
          // If real audio detected, stop simulation
          clearInterval(aiSpeakingSimulator);
          setAiSpeakingSimulator(null);
        }
        
        // Get position attribute to modify
        const positions = globeRef.current.geometry.attributes.position;
        const origPositions = origVerticesRef.current;
        
        if (!origPositions) return;
        
        // Deform the globe
        for (let i = 0; i < positions.array.length; i += 3) {
          // Get original vertex position
          const x = origPositions[i];
          const y = origPositions[i + 1];
          const z = origPositions[i + 2];
          
          // Calculate direction from center
          const direction = new THREE.Vector3(x, y, z).normalize();
          
          // Calculate deformation amount based on sound
          const frequencyBand = Math.floor(Math.abs((i / positions.array.length) * dataArray.length));
          const deformAmount = (dataArray[frequencyBand % dataArray.length] / 255) * 0.3;
          
          // Apply deformation in the direction from center
          positions.array[i] = x + direction.x * deformAmount * averageVolume / 40;
          positions.array[i + 1] = y + direction.y * deformAmount * averageVolume / 40;
          positions.array[i + 2] = z + direction.z * deformAmount * averageVolume / 40;
        }
        
        // Update geometry
        positions.needsUpdate = true;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (aiSpeakingSimulator) {
        clearInterval(aiSpeakingSimulator);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, [isListening, analyser, dataArray, aiSpeakingSimulator, simulatedVolume]);

  // Effect for initializing audio when isListening changes
  useEffect(() => {
    if (isListening && !analyser) {
      onInitAudio().then(({ analyser, dataArray }) => {
        setAnalyser(analyser);
        setDataArray(dataArray);
      }).catch(err => {
        console.error('Failed to initialize audio:', err);
      });
    }
    
    // Initialize simulated volume array
    setSimulatedVolume(Array(128).fill(0).map(() => Math.random() * 80 + 20));
    
    // Cleanup when not listening
    if (!isListening) {
      if (aiSpeakingSimulator) {
        clearInterval(aiSpeakingSimulator);
        setAiSpeakingSimulator(null);
      }
    }
  }, [isListening, analyser, onInitAudio, aiSpeakingSimulator]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '500px' }}
    />
  );
};

export default AudioReactiveGlobe;