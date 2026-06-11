import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    navigate('/login');
    return null;
  }
  
  const user = JSON.parse(userStr);
  // Payload for the QR Scanner (which could be verified by a backend service)
  const qrPayload = JSON.stringify({ rollNumber: user.rollNumber, type: 'backup_auth' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="glass-card p-10 flex flex-col items-center text-center space-y-6 max-w-sm w-full">
        <div className="p-4 bg-primary/20 text-primary rounded-full mb-2">
          <UserCircle size={40} />
        </div>
        <h2 className="text-3xl font-bold">Student ID</h2>
        <p className="text-gray-400 text-sm">Use this secure QR code as a backup if camera scanning fails.</p>
        
        <div className="bg-white p-4 rounded-2xl shadow-2xl transition-transform hover:scale-105">
          <QRCodeSVG value={qrPayload} size={200} level="H" includeMargin={true} />
        </div>
        
        <div className="w-full text-left bg-black/40 p-5 rounded-xl mt-4 border border-white/5">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Name</p>
          <p className="font-bold text-lg mb-3">{user.name}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Roll Number</p>
          <p className="font-bold text-lg text-primary">{user.rollNumber}</p>
        </div>
      </div>
    </div>
  );
}
