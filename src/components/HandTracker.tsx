import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandTrackerProps {
  onHandUpdate: (landmarks: any[]) => void;
  isPaused?: boolean;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate, isPaused }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const requestRef = useRef<number | null>(null);
  const prevLandmarksRef = useRef<any[] | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Smoothing factor (EMA). 0.5 = smooth tracking
  const SMOOTHING_FACTOR = 0.5;

  // Use refs to avoid stale closures in the predict frame loop
  const onHandUpdateRef = useRef(onHandUpdate);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    onHandUpdateRef.current = onHandUpdate;
  }, [onHandUpdate]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Exponential moving average smoothing for landmarks
  const smoothLandmarks = (newLandmarks: any[]) => {
    if (!prevLandmarksRef.current || prevLandmarksRef.current.length === 0) {
      prevLandmarksRef.current = newLandmarks;
      return newLandmarks;
    }

    const smoothed = newLandmarks.map((hand, handIdx) => {
      const prevHand = prevLandmarksRef.current![handIdx];
      if (!prevHand) return hand;

      return hand.map((landmark: any, i: number) => {
        const prevLandmark = prevHand[i];
        if (!prevLandmark) return landmark;

        return {
          x: prevLandmark.x + (landmark.x - prevLandmark.x) * SMOOTHING_FACTOR,
          y: prevLandmark.y + (landmark.y - prevLandmark.y) * SMOOTHING_FACTOR,
          z: prevLandmark.z + (landmark.z - prevLandmark.z) * SMOOTHING_FACTOR,
        };
      });
    });

    prevLandmarksRef.current = smoothed;
    return smoothed;
  };

  // 1. Initialize the MediaPipe Hand Landmarker
  useEffect(() => {
    let active = true;
    const initTracker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
        );
        
        if (!active) return;

        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("Tracker init error:", err);
        setError("Failed to initialize hand tracker. Please check your web connection.");
      }
    };

    initTracker();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  // 2. Start the camera feed
  useEffect(() => {
    if (!isLoaded) return;

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
          }
        });
        activeStream = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.log("Video play error:", e));
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Please enable camera access inside the viewport to play the gesture game.");
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLoaded]);

  // 3. Continuous frame loop
  useEffect(() => {
    if (!isLoaded) return;

    const runLoop = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) { // 2 corresponds to HAVE_CURRENT_DATA
        try {
          const timestamp = performance.now();
          const results = landmarker.detectForVideo(video, timestamp);
          
          if (results && results.landmarks && results.landmarks.length > 0) {
            if (!isPausedRef.current) {
              const smoothed = smoothLandmarks(results.landmarks);
              onHandUpdateRef.current(smoothed);
            } else {
              // Paused, notify empty to prevent active hover selection actions
              onHandUpdateRef.current([]);
            }
          } else {
            onHandUpdateRef.current([]);
          }
        } catch (e) {
          console.debug("Tracing loop frame skip:", e);
        }
      }

      requestRef.current = requestAnimationFrame(runLoop);
    };

    requestRef.current = requestAnimationFrame(runLoop);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded]);

  if (error) {
    return (
      <div className="absolute top-22 left-1/2 -translate-x-1/2 max-w-sm w-full bg-slate-900 border-2 border-art-orange backdrop-blur-md rounded-2xl p-4 text-center z-40 pointer-events-auto shadow-2xl">
        <p className="text-sm font-black text-art-orange mb-1">📷 Camera Access Needed for Hand Gestures</p>
        <p className="text-[11px] text-white/80 leading-relaxed mb-2">
          Browsers restrict camera access inside embedded previews. To play using hand recognition, click the <strong>"Open in New Tab"</strong> button in the top right!
        </p>
        <p className="text-[10px] bg-white/10 px-3 py-1.5 rounded-md text-yellow-100 font-bold block">
          👉 Play with your mouse by clicking items below in the meantime!
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-art-orange border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold text-art-orange text-sm tracking-widest animate-pulse font-mono block">E WHAKARITE ANA • INITIALIZING GESTURES...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandTracker;
