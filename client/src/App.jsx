import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Attendance from './pages/Attendance';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Subjects from './pages/Subjects';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="glass fixed w-full top-0 z-50 flex justify-between items-center px-8 py-4 rounded-none border-t-0 border-l-0 border-r-0 border-b border-white/10">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            AttenderX AI
          </Link>
          <div className="flex gap-6 items-center">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/attendance" className="text-gray-300 hover:text-white transition-colors">Live Attendance</Link>
            <Link to="/subjects" className="text-gray-300 hover:text-white transition-colors">My Subjects</Link>
            <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">My ID</Link>
            <Link to="/login" className="btn-primary text-sm py-1.5 px-4">Login</Link>
          </div>
        </nav>
        
        <main className="pt-28 px-8 max-w-7xl mx-auto pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subjects" element={<Subjects />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
