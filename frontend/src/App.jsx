import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [testMsg, setTestMsg] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/test')
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