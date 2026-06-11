import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return true;
  
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error("Failed to load models:", error);
    return false;
  }
};

// Calculate Eye Aspect Ratio (EAR)
const calculateEAR = (eye) => {
  // Euclidean distance between vertical eye landmarks
  const p2_p6 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
  const p3_p5 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
  // Euclidean distance between horizontal eye landmarks
  const p1_p4 = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
  
  if (p1_p4 === 0) return 0.0;
  return (p2_p6 + p3_p5) / (2.0 * p1_p4);
};

export const detectBlink = async (videoElement) => {
  if (!modelsLoaded) return { error: 'Models not loaded' };

  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
    .withFaceLandmarks();
  
  if (!detection) return { detected: false };

  const landmarks = detection.landmarks;
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const leftEAR = calculateEAR(leftEye);
  const rightEAR = calculateEAR(rightEye);
  const avgEAR = (leftEAR + rightEAR) / 2.0;

  // Face-api.js landmarks tend to give EAR ~0.25 to 0.3 when eyes are open, and < 0.20 when closed.
  return {
    detected: true,
    ear: avgEAR,
    isBlinking: avgEAR < 0.22,
    confidence: detection.detection.score,
    box: detection.detection.box
  };
};
