import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!firstName || !lastName || !username || !idNumber || !accountNumber || !password || !confirmPassword) {
      setStatus('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('Passwords do not match');
      return;
    }

    const payload = { firstName, lastName, username, idNumber, accountNumber, password };

    try {
      // try backend first
      const res = await axios.post('/api/auth/register', payload);
      setStatus(res.data?.message ?? 'Registered successfully');
      nav('/login');
    } catch (err) {
      // fallback to localStorage (demo only)
      const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
      if (users.find(u => u.username === username || u.idNumber === idNumber || u.accountNumber === accountNumber)) {
        setStatus('User with same username / ID / account already exists');
        return;
      }
      users.push(payload);
      localStorage.setItem('demoUsers', JSON.stringify(users));
      setStatus('Registered locally (backend unreachable). Please login.');
      setTimeout(() => nav('/login'), 900);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: 32,
      gap: 24
    }}>
      <div style={{
        width: '100%',
        maxWidth: 900,
        background: 'rgba(255,255,255,0.92)',
        padding: 28,
        borderRadius: 10,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ margin: 4, fontSize: 26 }}>Create account</h3>
        <p style={{ marginTop: 8, marginBottom: 18, color: '#555' }}>Fill in your personal and account details.</p>

        <form onSubmit={submit} style={{ display: 'grid', gap: 14, width: '100%' }}>
          <section style={{ display: 'grid', gap: 10 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Personal details</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <input
                className="form-control"
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
              <input
                className="form-control"
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
              <input
                className="form-control"
                placeholder="ID number"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
              <input
                className="form-control"
                placeholder="Account number"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
            </div>
          </section>

          <section style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            <p style={{ margin: 0, fontWeight: 600 }}>Account details</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <input
                className="form-control"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
              <input
                className="form-control"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', fontSize: 18 }}
              />
            </div>
          </section>

          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <button className="btn btn-success btn-lg" style={{ flex: 1, fontSize: 18 }} type="submit">Register</button>
          </div>

          {status && <div style={{ color: 'red', fontSize: 16 }}>{status}</div>}
        </form>
      </div>
    </div>
  );
}