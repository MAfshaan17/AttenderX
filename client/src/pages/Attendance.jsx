import React, { useRef, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { loadModels, detectBlink } from '../ai/faceProcessor';

export default function Attendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [status, setStatus] = useState('initializing'); // initializing, models_loaded, active, processing, success, failed
  const [message, setMessage] = useState('Loading AI Models...');
  const [rollNumber, setRollNumber] = useState('');
  const [session, setSession] = useState('');
  const [customSession, setCustomSession] = useState('');
  const [todaySubjects, setTodaySubjects] = useState([]);
  
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Initialize AI Models
  useEffect(() => {
    const initAI = async () => {
      const loaded = await loadModels();
      if (loaded) {
        setStatus('models_loaded');
        setMessage('Ready. Enter Roll Number and Start Webcam.');
      } else {
        setStatus('failed');
        setMessage('Failed to load AI Models. Check public/models folder.');
      }
    };
    initAI();

    const initUserAndSubjects = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setRollNumber(user.rollNumber);
          
          // Fetch subjects and filter by today
          const res = await api.get('/subjects');
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const filtered = res.data.filter(sub => sub.days.includes(today));
          setTodaySubjects(filtered);
          if (filtered.length > 0) setSession(filtered[0].name);
        } catch(e) {
          console.error("Error fetching subjects", e);
        }
      }
    };
    initUserAndSubjects();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        setStatus('active');
        setMessage('Position your face in the frame. Click Verify & Blink.');
        speak('Camera active. Please position your face and click Verify.');
      }
    } catch (err) {
      setStatus('failed');
      setMessage('Camera access denied or not available.');
      speak('Camera access denied.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  };

  // Process video continuously for a few seconds to catch a blink
  const verifyAttendance = async () => {
    if (!rollNumber) {
      setMessage('Please enter your roll number first.');
      return;
    }
    
    setStatus('processing');
    setMessage('Analyzing frame...');
    speak('Please look at the camera and blink slowly.');

    let blinkDetected = false;
    let confidence = 0;
    
    // Poll the camera for up to 5 seconds
    const startTime = Date.now();
    
    const checkFrame = async () => {
      if (Date.now() - startTime > 5000) {
         setStatus('active');
         setMessage('Timeout: No blink detected. Please try again.');
         speak('Verification failed. No blink detected.');
         return;
      }
      
      if (!videoRef.current) return;
      
      const result = await detectBlink(videoRef.current);
      
      if (result.detected) {
        confidence = result.confidence;
        setMessage(`Face Detected. EAR: ${result.ear.toFixed(2)}. Waiting for blink...`);
        
        if (result.isBlinking) {
          blinkDetected = true;
          markAttendance(confidence);
          return;
        }
      } else {
        setMessage('No face detected. Please adjust your position.');
      }
      
      // Keep checking
      requestAnimationFrame(checkFrame);
    };
    
    checkFrame();
  };

  const markAttendance = async (aiConfidence) => {
    setMessage('Liveness verified! Marking attendance...');
    try {
      // Direct JSON POST to Node.js backend (no image upload)
      const finalSession = session === 'Custom' ? customSession : session;
      const payload = {
        rollNumber,
        session: finalSession,
        confidenceScore: Math.round(aiConfidence * 100)
      };
      
      const markRes = await api.post('/attendance/mark', payload);
      
      if (markRes.data.success) {
        setStatus('success');
        setMessage(`Attendance marked! Confidence: ${payload.confidenceScore}%`);
        speak(`Liveness verified. Attendance marked successfully with ${payload.confidenceScore} percent confidence.`);
        setTimeout(() => stopCamera(), 3000);
      } else {
        setStatus('failed');
        setMessage(markRes.data.message || 'Failed to mark attendance.');
        speak('Failed to mark attendance. You may have already marked it for this session.');
      }
      
    } catch (err) {
      setStatus('failed');
      setMessage(err.response?.data?.message || 'Server error during verification.');
      speak('Server error occurred.');
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-8">
      <div className="glass-card p-8 w-full max-w-3xl space-y-8 flex flex-col items-center">
        
        <div className="text-center w-full">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Camera className="text-primary" /> Live AI Attendance
          </h2>
          <p className="text-gray-400 mt-2">Secure browser-based face & blink detection</p>
        </div>

        {!isCameraOn && status !== 'success' && (
          <div className="w-full max-w-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Roll Number</label>
              <input 
                type="text" 
                className="input-field text-center text-xl font-bold" 
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter Roll No."
                disabled={status === 'initializing'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Select Class / Session</label>
              <select 
                className="input-field bg-black text-center text-lg mb-2" 
                value={session}
                onChange={(e) => setSession(e.target.value)}
                disabled={status === 'initializing'}
              >
                {todaySubjects.length === 0 && <option value="">No classes scheduled today</option>}
                {todaySubjects.map(sub => (
                  <option key={sub.code} value={sub.name}>{sub.name} ({sub.code})</option>
                ))}
                <option value="Custom">Add Custom Class...</option>
              </select>
              
              {session === 'Custom' && (
                <input 
                  type="text" 
                  className="input-field text-center" 
                  value={customSession}
                  onChange={(e) => setCustomSession(e.target.value)}
                  placeholder="Type class name"
                  disabled={status === 'initializing'}
                />
              )}
            </div>
            <button 
              onClick={startCamera} 
              className="btn-primary w-full text-lg py-3 flex justify-center items-center gap-2"
              disabled={status === 'initializing' || status === 'failed'}
            >
              {status === 'initializing' ? <Loader2 className="animate-spin" /> : 'Start Webcam'}
            </button>
          </div>
        )}

        <div className={`relative w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden border-2 ${
            status === 'success' ? 'border-green-500' : 
            status === 'failed' ? 'border-red-500' : 
            status === 'processing' ? 'border-primary animate-pulse' : 'border-white/10'
          }`}
        >
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
          />
          {!isCameraOn && status !== 'success' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
               {status === 'initializing' ? <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" /> : 'Webcam is off'}
               {status === 'initializing' ? 'Downloading AI Weights...' : ''}
             </div>
          )}
          
          {message && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full text-white text-sm whitespace-nowrap z-10 font-medium border border-white/10">
              {status === 'success' && <CheckCircle className="inline w-4 h-4 text-green-400 mr-2" />}
              {status === 'failed' && <XCircle className="inline w-4 h-4 text-red-400 mr-2" />}
              {status === 'processing' && <Loader2 className="inline w-4 h-4 text-primary animate-spin mr-2" />}
              {message}
            </div>
          )}
        </div>
        
        {isCameraOn && status !== 'processing' && status !== 'success' && (
           <div className="flex gap-4">
             <button 
               onClick={() => { stopCamera(); setStatus('models_loaded'); setMessage('Ready. Enter Roll Number and Start Webcam.'); }} 
               className="glass px-8 py-4 text-lg hover:bg-red-500/20 text-red-400 border-red-500/20 transition-colors"
             >
               Close Camera
             </button>
             <button onClick={verifyAttendance} className="btn-primary px-12 py-4 text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/20">
               Verify & Blink
             </button>
           </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
