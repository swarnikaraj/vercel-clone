import React, { useEffect, useState } from 'react';
import './App.css'; // Import your CSS file
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';
function App() {
  const [link, setLink] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);
  

  const handleSubmit = (e:React.FormEvent) => {
    e.preventDefault();
    // Here, you can perform deployment logic
    // For demonstration purposes, I'm just updating the status and progress
    setStatus('Deployment in progress...');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setStatus('Deployment successful!');
      }
    }, 1000);
  };
  const showToast = () => {
    toast.error(
      <>
         If the site is not working, please contact me on{' '}
        <a href="https://www.linkedin.com/in/swarnnika-raj-singh-a6731914b/" target="_blank" rel="noopener noreferrer">
          <FaLinkedin /> 
        </a>{' '}
        or via email at{' '}
        <a href="mailto:swarnikarajsingh@gmail.com">
          <FaEnvelope /> 
        </a>
        . The reason could be due to an overdue AWS bill.
      </>,
      {
        autoClose: false, 
        closeOnClick: true,
        draggable: true, 
        position: 'top-right', 
      }
    );
  };

  useEffect(() => {showToast()},[])
  return (
    <div className="container">
     <ToastContainer />
      <h1>Deploy your application with one click</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste github link..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="status">{status}</div>
      {progress>0 && <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>}
    </div>
  );
}

export default App;
