import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    days: []
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.days.length === 0) {
      return setError('Please select at least one day for the class.');
    }
    setError('');
    try {
      const res = await api.post('/subjects', formData);
      setSubjects(res.data);
      setFormData({ name: '', code: '', credits: 3, days: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleDelete = async (code) => {
    try {
      const res = await api.delete(`/subjects/${code}`);
      setSubjects(res.data);
    } catch (err) {
      setError('Failed to delete subject');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-8">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="p-3 bg-secondary/20 text-secondary rounded-xl">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Subjects</h1>
            <p className="text-gray-400 mt-1">Manage your enrolled courses and schedules.</p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-500/20 text-red-200 rounded-lg">{error}</div>}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Subject Form */}
          <div className="md:col-span-1 glass-card p-6 space-y-6 h-fit">
            <h2 className="text-xl font-bold flex items-center gap-2"><Plus size={20} className="text-primary"/> Add New Subject</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Subject Name</label>
                <input type="text" required className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Artificial Intelligence" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm text-gray-400 mb-1">Course Code</label>
                  <input type="text" required className="input-field" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="CS101" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm text-gray-400 mb-1">Credits</label>
                  <input type="number" min="1" max="6" required className="input-field" value={formData.credits} onChange={e => setFormData({...formData, credits: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Schedule (Days)</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button 
                      type="button" 
                      key={day} 
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${formData.days.includes(day) ? 'bg-primary border-primary text-white' : 'bg-transparent border-white/20 text-gray-400 hover:border-white/50'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-2">Add Subject</button>
            </form>
          </div>

          {/* Subjects List */}
          <div className="md:col-span-2 space-y-4">
            {loading ? <p>Loading subjects...</p> : subjects.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-400">
                No subjects enrolled yet. Add your first class on the left!
              </div>
            ) : (
              subjects.map(sub => (
                <div key={sub.code} className="glass-card p-6 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold">{sub.name}</h3>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-gray-300">{sub.code}</span>
                      <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary rounded-md">{sub.credits} Credits</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {sub.days.map(day => (
                        <span key={day} className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{day}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(sub.code)} className="text-red-400/50 hover:text-red-400 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
