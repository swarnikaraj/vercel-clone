import React, { useEffect, useState, useRef , useCallback, useMemo} from 'react';
import './App.css'; // Import your CSS file
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { FaSquareGithub } from "react-icons/fa6";
import { io } from "socket.io-client";
import axios from "axios";
const socket = io("http://localhost:9002");
function App() {
   const logContainerRef = useRef<HTMLElement>(null);
  const [gitlink, setGitLink] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [deployPreviewURL, setDeployPreviewURL] = useState<string | undefined>();
   const [projectId, setProjectId] = useState<string | undefined>();
 const [logs, setLogs] = useState<string[]>([]);
  // const handleSubmit = (e:React.FormEvent) => {
  //   e.preventDefault();
  //   // Here, you can perform deployment logic
  //   // For demonstration purposes, I'm just updating the status and progress
  //   setStatus('Deployment in progress...');
  //   let currentProgress = 0;
  //   const interval = setInterval(() => {
  //     currentProgress += 10;
  //     setProgress(currentProgress);
  //     if (currentProgress >= 100) {
  //       clearInterval(interval);
  //       setStatus('Deployment successful!');
  //     }
  //   }, 1000);
  // };
  const isValidURL: boolean = useMemo(() => {
    if (!gitlink || gitlink.trim() === "") return false;
    const regex = new RegExp(
      /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\\/]+)\/([^\\/]+)(?:\/)?$/
    );
    return regex.test(gitlink);
  }, [gitlink]);

const handleClickDeploy = useCallback(async () => {
    setLoading(true);
  console.log(gitlink,"gitlink hai")
   if (!isValidURL) {
     setLoading(false);
       toast.error(
      <>
        Invalid github url
       
      </>,
      {
        autoClose: false, 
        closeOnClick: true,
        draggable: true, 
        position: 'top-right', 
      }
    );
     return;
   }
   
    const responsefromapi = await axios.post(`http://localhost:5000/deploy`, {
      giturl: gitlink,
      slug: projectId,
    });


    if (responsefromapi?.data ) {
      
      const { projectSlug, url } = responsefromapi.data;
      console.log(`Project slug: ${projectSlug}`);
      setProjectId(projectSlug);
      setDeployPreviewURL(url);

      console.log(`Subscribing to logs:${projectSlug}`);
      socket.emit("subscribe", `logs:${projectSlug}`);
    }
    setLoading(false);
  }, [isValidURL, gitlink, projectId]);

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
  
   const handleSocketIncommingMessage = useCallback((message: string) => {
    console.log(`[Incomming Socket Message]:`, typeof message, message);
    console.log(message,"message hu mai")
    const log = JSON.parse(message);
    setLogs((prev) => [...prev, log]);
    logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    socket.on("message", handleSocketIncommingMessage);

    return () => {
      socket.off("message", handleSocketIncommingMessage);
    };
  }, [handleSocketIncommingMessage]);
  return (
    <div className="container">
     <ToastContainer />
      <h1>Paste <FaSquareGithub/> link and Deploy your react application with one click</h1>
      
        <input
         disabled={loading}
          type="text"
          placeholder="Paste github link..."
          value={gitlink}
          onChange={(e) => setGitLink(e.target.value)}
        />
        <button onClick={handleClickDeploy}
          > {loading ? "In Progress" : "Deploy"}</button>
      
      
      {loading && <div className="flex justify-center  items-center h-screen">
  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4  border-gray-200"></div>
</div>
} 
{deployPreviewURL && (
          <div className="mt-2 bg-white py-4 px-2 rounded-lg">
            <p>
              Preview URL{" "}
              <a
                target="_blank"
                className="text-sky-400 bg-sky-950 px-3 py-2 rounded-lg"
                href={deployPreviewURL}
              >
                {deployPreviewURL}
              </a>
            </p>
          </div>
        )}

       {logs.length > 0 && (
          <div
            className={`text-sm text-green-500 logs-container mt-5 border-green-500 border-2 rounded-lg p-4 h-[300px] overflow-y-auto`}
          >
            <pre className="flex flex-col gap-1">
              {logs.map((log, i) => (
                <code
                  ref={logs.length - 1 === i ? logContainerRef : undefined}
                  key={i}
                >{`> ${log}`}</code>
              ))}
            </pre>
          </div>
        )}
    </div>
  );
}

export default App;
