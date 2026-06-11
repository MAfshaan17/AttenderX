import React from 'react';
import { Link } from 'react-router-dom';
import { ScanFace, Activity, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 mt-12 w-full max-w-4xl">
        <div className="inline-block glass px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-4 border-primary/20">
          ✨ Next-Gen AI Attendance System
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight">
          Smart Attendance, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Verified by Liveness.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to proxy attendance. AttenderX uses advanced Face Detection and Real-time Blink Verification to ensure secure and seamless tracking.
        </p>
        <div className="flex justify-center gap-4 pt-4 relative z-50">
          <a href="/register" className="btn-primary px-8 py-3 text-lg">Get Started</a>
          <a href="/attendance" className="glass px-8 py-3 rounded-lg text-lg hover:bg-white/10 transition-colors">Try Live Demo</a>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 w-full mt-24">
        <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-primary/20 rounded-2xl text-primary">
            <ScanFace size={40} />
          </div>
          <h3 className="text-xl font-bold">Face Recognition</h3>
          <p className="text-gray-400">Instantly matches student faces against our secure database with high precision.</p>
        </div>
        
        <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-secondary/20 rounded-2xl text-secondary">
            <Activity size={40} />
          </div>
          <h3 className="text-xl font-bold">Blink Liveness</h3>
          <p className="text-gray-400">Calculates Eye Aspect Ratio (EAR) in real-time to prevent photo spoofing.</p>
        </div>

        <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-green-500/20 rounded-2xl text-green-400">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-xl font-bold">Secure Dashboard</h3>
          <p className="text-gray-400">Comprehensive analytics and unforgeable attendance records for admins.</p>
        </div>
      </section>
    </div>
  );
}
