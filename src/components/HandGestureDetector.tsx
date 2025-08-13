import React, { useRef, useEffect, useState } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera as CameraIcon, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandResults {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: Array<{ label: string; score: number }>;
}

const HandGestureDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [detectedNumber, setDetectedNumber] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [hands, setHands] = useState<Hands | null>(null);
  const [camera, setCamera] = useState<Camera | null>(null);

  // Fungsi untuk mendeteksi angka berdasarkan landmark jari
  const detectNumber = (landmarks: HandLandmark[]): { number: number; confidence: number } => {
    if (!landmarks || landmarks.length < 21) {
      return { number: -1, confidence: 0 };
    }

    // Titik landmark jari (tip dan pip untuk setiap jari)
    const fingerTips = [4, 8, 12, 16, 20]; // Thumb, Index, Middle, Ring, Pinky tips
    const fingerPips = [3, 6, 10, 14, 18]; // Thumb, Index, Middle, Ring, Pinky PIPs
    
    // Hitung jari yang terangkat
    const fingersUp = [];
    
    // Thumb (berbeda karena orientasi horizontal)
    if (landmarks[fingerTips[0]].x > landmarks[fingerPips[0]].x) {
      fingersUp.push(1);
    } else {
      fingersUp.push(0);
    }
    
    // Jari lainnya (vertikal)
    for (let i = 1; i < 5; i++) {
      if (landmarks[fingerTips[i]].y < landmarks[fingerPips[i]].y) {
        fingersUp.push(1);
      } else {
        fingersUp.push(0);
      }
    }
    
    const fingerCount = fingersUp.reduce((sum, finger) => sum + finger, 0);
    
    // Deteksi angka berdasarkan pola jari
    let detectedNum = -1;
    let conf = 0.8;
    
    if (fingerCount === 0) {
      detectedNum = 0;
    } else if (fingerCount === 1) {
      // Cek jari mana yang terangkat
      if (fingersUp[1] === 1) detectedNum = 1; // Index finger
      else if (fingersUp[0] === 1) detectedNum = 1; // Thumb
    } else if (fingerCount === 2) {
      if (fingersUp[1] === 1 && fingersUp[2] === 1) detectedNum = 2; // Peace sign
      else if (fingersUp[0] === 1 && fingersUp[1] === 1) detectedNum = 2;
    } else if (fingerCount === 3) {
      if (fingersUp[1] === 1 && fingersUp[2] === 1 && fingersUp[3] === 1) detectedNum = 3;
      else if (fingersUp[0] === 1 && fingersUp[1] === 1 && fingersUp[2] === 1) detectedNum = 3;
    } else if (fingerCount === 4) {
      if (fingersUp[1] === 1 && fingersUp[2] === 1 && fingersUp[3] === 1 && fingersUp[4] === 1) {
        detectedNum = 4;
      }
    } else if (fingerCount === 5) {
      detectedNum = 5;
    }
    
    return { number: detectedNum, confidence: conf };
  };

  const onResults = (results: HandResults) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame
    if (videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }
    
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw hand landmarks
        drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        drawLandmarks(ctx, landmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });
        
        // Detect number
        const result = detectNumber(landmarks);
        setDetectedNumber(result.number);
        setConfidence(result.confidence);
      }
    } else {
      setDetectedNumber(null);
      setConfidence(0);
    }
  };

  const startCamera = async () => {
    try {
      if (!videoRef.current) return;
      
      // Initialize MediaPipe Hands
      const handsInstance = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });
      
      handsInstance.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
      });
      
      handsInstance.onResults(onResults);
      setHands(handsInstance);
      
      // Initialize camera
      const cameraInstance = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && handsInstance) {
            await handsInstance.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      
      setCamera(cameraInstance);
      await cameraInstance.start();
      setIsActive(true);
      toast.success("Kamera berhasil dimulai! Tunjukkan angka dengan jari Anda.");
      
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error("Gagal memulai kamera. Pastikan browser mendukung kamera.");
    }
  };

  const stopCamera = () => {
    if (camera) {
      camera.stop();
      setCamera(null);
    }
    setIsActive(false);
    setDetectedNumber(null);
    setConfidence(0);
    toast.info("Kamera dihentikan.");
  };

  useEffect(() => {
    return () => {
      if (camera) {
        camera.stop();
      }
    };
  }, [camera]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraIcon className="h-6 w-6" />
            Sistem Pakar Deteksi Angka Jari Tangan
          </CardTitle>
          <p className="text-muted-foreground">
            Gunakan machine learning untuk mendeteksi angka 0-5 dari gerakan jari tangan Anda
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={isActive ? stopCamera : startCamera}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Hentikan Kamera
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Mulai Deteksi
                </>
              )}
            </Button>
          </div>
          
          <div className="relative">
            <video
              ref={videoRef}
              className="hidden"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="border rounded-lg max-w-full h-auto bg-gray-100"
            />
            
            {isActive && (
              <div className="absolute top-4 right-4 space-y-2">
                {detectedNumber !== null && detectedNumber >= 0 ? (
                  <div className="flex flex-col gap-2">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      Angka: {detectedNumber}
                    </Badge>
                    <Badge variant="secondary" className="text-sm">
                      Confidence: {Math.round(confidence * 100)}%
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline">
                    Tidak ada angka terdeteksi
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="space-y-1">
              <div className="font-medium">Angka 0:</div>
              <div>Genggam tangan (semua jari tertutup)</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Angka 1:</div>
              <div>Jari telunjuk atau ibu jari terangkat</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Angka 2:</div>
              <div>Jari telunjuk dan tengah terangkat (peace)</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Angka 3:</div>
              <div>Tiga jari terangkat</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Angka 4:</div>
              <div>Empat jari terangkat (tanpa ibu jari)</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Angka 5:</div>
              <div>Semua jari terangkat (telapak terbuka)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandGestureDetector;