import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Payments from './pages/Payments';
import backgroundImage from './assets/marble-background.jpg';

export default function App() {
  const [testMsg, setTestMsg] = useState('');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) || null } catch { return null }
  });
  const backgroundStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    minHeight: '100vh',
    backgroundPosition: 'center',
    width: '100%',
  };

  useEffect(() => {
    axios.get('/test')
      .then(res => setTestMsg(res.data?.message ?? ''))
      .catch(() => {}); // ignore in dev
  }, []);

  const handleLogin = (userObj) => {
    setUser(userObj);
    localStorage.setItem('currentUser', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <BrowserRouter>
      <header>
        <nav
          className="navbar navbar-expand-lg bg-primary"
          data-bs-theme="dark"
          style={{ padding: 12 }}
        >
          <div className="container-fluid" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link className="navbar-brand text-white" to="/">
              CBA Banking <span style={{ marginLeft: 6, marginRight: 6 }}>|</span>
            </Link>

            <div className="collapse navbar-collapse" id="navbarColor01" style={{ flex: 1 }}>
              <ul
                className="navbar-nav me-auto mb-2 mb-lg-0"
                style={{ display: 'flex', gap: 12, alignItems: 'center' }}
              >
                <li className="nav-item">
                  <Link className="nav-link text-white" to="/payments">Payments</Link>
                </li>
              </ul>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {!user && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginLeft: 'auto' }}>
                    <Link className="nav-link text-white" to="/register" style={{ padding: '6px 10px' }}>Register</Link>
                    <Link className="nav-link text-white" to="/login" style={{ padding: '6px 10px' }}>Login</Link>
                  </div>
                )}

                {user && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                    <span className="text-white" style={{ fontWeight: 600 }}>{user.username}</span>
                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main style={{ padding: 20, ...backgroundStyle }}>
        <Routes>
          <Route path="/" element={
            <>
              <h2>Welcome</h2>
              <p>Backend says: {testMsg}</p>
              <p>{user ? `Logged in as ${user.username}` : 'Please register or login.'}</p>
            </>
          }/>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/payments" element={user ? <Payments user={user} /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}