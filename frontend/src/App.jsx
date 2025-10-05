import { useEffect, useState } from 'react';
import axios from 'axios';

export default function App() {
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    axios.get('https://localhost:5000/test')
      .then(res => setTestMsg(res.data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <h2>Welcome to Secure Blog</h2>
      <p>Backend says: {testMsg}</p>
    </>
  );
}