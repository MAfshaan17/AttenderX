import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, Download, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [personalStats, setPersonalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          navigate('/login');
          return;
        }
        const user = JSON.parse(userStr);
        setUserRole(user.role);

        if (user.role === 'admin') {
          const [attRes, statsRes] = await Promise.all([
            api.get('/attendance/all'),
            api.get('/attendance/stats')
          ]);
          setRecords(attRes.data);
          setStats(statsRes.data);
        } else {
          const res = await api.get('/attendance/me/stats');
          setPersonalStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const exportCSV = () => {
    if (records.length === 0) return;
    
    const headers = ['Name', 'Roll Number', 'Date', 'Time', 'Session', 'Status'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    records.forEach(r => {
      const row = [r.name, r.rollNumber, r.date, r.time, r.session, r.status];
      const escapedRow = row.map(v => `"${(v || '').toString().replace(/"/g, '""')}"`);
      csvRows.push(escapedRow.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  // ----------------------------------------------------
  // CALENDAR HELPER
  // ----------------------------------------------------
  const renderCalendar = () => {
    if (!personalStats?.allRecords) return null;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    // Create a Set of dates where attendance was marked
    const attendanceDates = new Set(
      personalStats.allRecords.map(r => r.date) // 'YYYY-MM-DD'
    );
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPresent = attendanceDates.has(dateStr);
      const isToday = d === today.getDate();
      
      days.push(
        <div 
          key={d} 
          className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
            isPresent ? 'bg-green-500/20 text-green-400 border border-green-500/30 font-bold' : 
            isToday ? 'bg-white/10 text-white border border-white/20' : 
            'text-gray-400 hover:bg-white/5'
          }`}
          title={isPresent ? 'Present' : 'No Record'}
        >
          {d}
        </div>
      );
    }
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return (
      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" /> {monthNames[month]} {year}
        </h2>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-xs text-gray-500 font-bold">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-500/20 border border-green-500/30"></div> Present</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-white/10 border border-white/20"></div> Today</div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // ADMIN DASHBOARD
  // ----------------------------------------------------
  if (userRole === 'admin') {
    const barData = {
      labels: stats ? Object.keys(stats.weeklyTrends).reverse() : [],
      datasets: [{ label: 'Daily Scans', data: stats ? Object.values(stats.weeklyTrends).reverse() : [], backgroundColor: '#3b82f6', borderRadius: 4 }]
    };
    const doughnutData = {
      labels: stats ? Object.keys(stats.sessionDistribution) : [],
      datasets: [{ data: stats ? Object.values(stats.sessionDistribution) : [], backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'], borderWidth: 0 }]
    };
    const chartOptions = { responsive: true, plugins: { legend: { position: 'top', labels: { color: '#fff' } } }, scales: { y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { ticks: { color: '#fff' }, grid: { display: false } } } };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 mt-2">Real-time attendance & analytics</p>
          </div>
          <div className="flex gap-4">
            <button onClick={exportCSV} className="glass px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="glass px-4 py-2 text-sm hover:text-red-400">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/20 text-primary rounded-xl"><Users size={24}/></div>
            <div>
              <p className="text-gray-400 text-sm">Total Scans All Time</p>
              <h3 className="text-2xl font-bold">{records.length}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-4 bg-green-500/20 text-green-400 rounded-xl"><UserCheck size={24}/></div>
            <div>
              <p className="text-gray-400 text-sm">Present Today</p>
              <h3 className="text-2xl font-bold">{stats ? stats.todayScans : 0}</h3>
            </div>
          </div>
          <div className="glass-card p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/20 text-secondary rounded-xl"><Calendar size={24}/></div>
            <div>
              <p className="text-gray-400 text-sm">Active Sessions</p>
              <h3 className="text-2xl font-bold">{stats ? Object.keys(stats.sessionDistribution).length : 0}</h3>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Weekly Attendance Trends</h2>
            {stats && <Bar data={barData} options={chartOptions} height={100} />}
          </div>
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Session Distribution</h2>
            {stats && <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } }} />}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STUDENT DASHBOARD (SUBJECT ANALYTICS)
  // ----------------------------------------------------
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold">Academic Overview</h1>
          <p className="text-gray-400 mt-2">Subject-wise attendance and credit tracking</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="glass px-4 py-2 text-sm hover:text-red-400 transition-colors">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-primary/20 text-primary rounded-xl"><UserCheck size={24}/></div>
          <div>
            <p className="text-gray-400 text-sm">Total Classes Attended</p>
            <h3 className="text-2xl font-bold">{personalStats?.totalAttended || 0}</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-4 bg-secondary/20 text-secondary rounded-xl"><BookOpen size={24}/></div>
          <div>
            <p className="text-gray-400 text-sm">Enrolled Subjects</p>
            <h3 className="text-2xl font-bold">{personalStats?.subjectStats.length || 0}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold">Subject Attendance Report</h2>
            <span className="text-sm text-gray-400 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" /> Shortage Threshold: 75%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/20 text-gray-400 text-sm border-b border-white/10">
                  <th className="p-4 font-medium">Subject Name</th>
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Attended / Total</th>
                  <th className="p-4 font-medium">Percentage</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {personalStats?.subjectStats.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">No subjects added. Go to 'My Subjects' to configure your semester.</td></tr>
                ) : (
                  personalStats?.subjectStats.map((sub, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">{sub.name}</td>
                      <td className="p-4 text-gray-300"><span className="bg-white/10 px-2 py-1 rounded text-xs">{sub.code}</span></td>
                      <td className="p-4 text-gray-300">{sub.attended} / {sub.totalClasses}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-white/10 rounded-full h-2 max-w-[100px]">
                            <div 
                              className={`h-2 rounded-full ${sub.percentage < 75 ? 'bg-red-500' : 'bg-green-500'}`} 
                              style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold ${sub.percentage < 75 ? 'text-red-400' : 'text-green-400'}`}>{sub.percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {sub.percentage < 75 ? (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium border border-red-500/20 flex items-center gap-1 w-fit">
                            <AlertTriangle size={14} /> Shortage
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/20 flex items-center gap-1 w-fit">
                            <CheckCircle size={14} /> Safe
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:col-span-1">
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
}
