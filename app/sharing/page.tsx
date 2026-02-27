"use client"
import { useEffect, useRef, useState } from "react"
import Navbar from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import DeviceOrbit from "@/components/ui/orbit"
import Peer from "simple-peer";
import { ShowTooltipInContent } from "@/components/ui/tooltip-content"
import { useSocket } from "../context/socket-context"
import FileUpload from "@/components/ui/file-upload"
import Attachements from "@/components/ui/attachments"
import { UseUploadingFiles } from "../context/uploading-file-context"
import { toast } from "sonner"

export default function SharingPage() {
  const [targetId, setTargetId] = useState<any>('');
  const peerId = typeof window !== "undefined" ? localStorage.getItem("peerId"): null;
  const [connecting, setConnecting] = useState<boolean>(false);
  const [isSharing,setIsSharing] = useState<boolean>(false);
  const [isShared,setIsShared] = useState<boolean>(false);
  const [isConnectionEstablisedAtReciever,setIsConnectionEstablisedAtReciever] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const peerRef = useRef<any>(null);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
  const socket = useSocket();
  const {uploadingFiles,setUploadingFiles } = UseUploadingFiles();
  const connectTimeoutRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const isInitiatorRef = useRef(false);
  const buffersRef = useRef<any[]>([]);
  const connectedRef = useRef(false);
  const metaRef = useRef<any>(null);
  // const receivedAttachmentsRef = useRef<any[]>([]);
  const receivedAttachmentsRef = useRef<any[]>([]);
  const totalAllBytesRef = useRef(0);
  const receivedAllBytesRef = useRef(0);

  useEffect(() => {

    if (!socket) return;
    if (!socket.connected) {
      // console.log("111111");
      socket.connect();
    }

    const handleSignal = ({ fromPeerId, data }: any) => {

      // If peer already exists → we are the sender side
      // Sender previously sent an offer and now receiving the answer
      if (isInitiatorRef.current && peerRef.current) {
        peerRef.current.signal(data);  // we are the sender side, got the answer from the reciever side 

        socket.emit("connection-established", {    // calling event for the receiver that handshake done
          toPeerId: fromPeerId 
        });

        toast.success("Connected Successfully 🎉");
        setConnected(true);
        setConnecting(false);
        return;
      }


      if(!peerRef.current){
        // Peer not created yet → we are the receiver side
        // Create a new peer to handle the incoming offer
        peerRef.current = new Peer({
          initiator: false,
          trickle: false,
          config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },

            // using public turn server here
            {
              urls: process.env.NEXT_PUBLIC_TURN_SERVER || '' ,
              username: process.env.NEXT_PUBLIC_TURN_USERNAME,
              credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
            }
          ]
        }
        });

        // Receiver got the OFFER
        // Apply offer → simple-peer internally generates the ANSWER
        peerRef.current.signal(data);

        // When answer is generated, "signal" event fires
        peerRef.current.on("signal", (answer: any) => {
          socket.emit("signal", {
            toPeerId: fromPeerId,
            data: answer
          });
        })


        // Handle incoming file/data transfer
        peerRef.current.on("data", handleIncomingData);

        // Fired when P2P connection successfully established
        peerRef.current.on("connect", () => {
          console.log("Receiver connected");
        });
      }
    };

    // Receive signaling data (answer/ICE) from the other peer
    socket.on("signal", handleSignal);
  
  
    // Fired when the remote peer confirms the connection.
    // handshake completed and now on the event changing the state at reciever's end 
    socket.on("connection-established", ({ fromPeerId }: any) => {
      setIsConnectionEstablisedAtReciever(true);
      setTargetId(fromPeerId);
      setConnected(true);
    });


    return () => {
      setConnected(false);
      socket.off("signal", handleSignal);
    };
  }, [socket]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function CopyToClipboard(mouseLeave: boolean) {
    if (mouseLeave) {
      setTimeout(() => {
        setIsCopiedToClipboard(false);
      }, 500);
    } else {
      setIsCopiedToClipboard(true);
    }
  }

  function signaling() {
    setConnecting(true);
     isInitiatorRef.current = true; 
    try {
      peerRef.current = new Peer({
        initiator: true,
        trickle: false,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },

            // using public turn server here
            {
              urls: process.env.NEXT_PUBLIC_TURN_SERVER || '' ,
              username: process.env.NEXT_PUBLIC_TURN_USERNAME,
              credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL
            }
          ]
        }
      });

      // simple peer generate a offer due to above code, and sends an event of 'signal' automatically.
      peerRef.current.on('signal', (offer: any) => {
        socket.emit('signal', {      //sending the offer to other peer using socket 
          toPeerId: targetId,   
          data: offer
        });
      }); 

      peerRef.current.on("close", () => {
        setConnected(false);
        setConnecting(false);
        isInitiatorRef.current = false;
        peerRef.current = null;
      });


      setTimeout(()=>{
        if(!connectedRef.current){
          peerRef.current?.destroy();
          peerRef.current = null;
          isInitiatorRef.current = false;
          toast.error("Oops! It seems that your friend's device is offline. Please try again later.");
          setConnecting(false);    
        }
      },15000) // waiting time is of 15 sec cause we are using the public turn server
    } catch {
      setConnecting(false);
    }
  }

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  async function sendFiles(files: File[]) {
    setIsSharing(true);
    setProgress(0);
    const peer = peerRef.current;
    if (!peer?.connected) return;

    const channel = peer._channel;
    const chunkSize = 16 * 1024;
    const MAX_BUFFER = 64 * 1024;
    try {

      const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
      let sentBytes = 0;
      peer.send(JSON.stringify({
        type: "batch-meta",
        totalBytes,
        fileCount: files.length
      }));
      for (const file of files) {
        const buffer = await file.arrayBuffer();

        peer.send(JSON.stringify({
          type: "meta",
          name: file.name,
          size: file.size
        }));
        for (let i = 0; i < buffer.byteLength; i += chunkSize) {

          while (channel.bufferedAmount > MAX_BUFFER) {
            await new Promise(r => setTimeout(r, 20));
          }

          const chunk = buffer.slice(i, i + chunkSize);
          peer.send(chunk);
          sentBytes += chunk.byteLength;
          const percent = Math.floor((sentBytes / totalBytes) * 100);
          setProgress(percent);
        }
        peer.send(JSON.stringify({ type: "end" }));
      }
      toast.success("Files Shared SuccessFully.🫡");
      setIsSharing(false);
      setIsShared(true);
    } catch {
      toast.success("Please Try Again...");
      setIsSharing(false);
    }

    // setIsShared(false);
  }


  function updateReceiverUploadingFiles() {
    setUploadingFiles([...receivedAttachmentsRef.current]);
  }

  function handleIncomingData(data: any) {


    if (data instanceof Uint8Array) {

      const text = new TextDecoder().decode(data);

      try {
        const msg = JSON.parse(text);

        if (msg.type === "batch-meta") {
          totalAllBytesRef.current = msg.totalBytes;
          receivedAllBytesRef.current = 0;
          setReceiveProgress(0);
          receivedAttachmentsRef.current = [];
          return;
        }

        // META
        if (msg.type === "meta") {
          metaRef.current = msg;
          buffersRef.current = [];
          return;
        }

        // END
        if (msg.type === "end") {
          const blob = new Blob(buffersRef.current);
          receivedAttachmentsRef.current.push({blob,metaData: metaRef.current.name});
          updateReceiverUploadingFiles();
          buffersRef.current = [];
          return;
        }

      } catch {
        // BINARY CHUNK
        buffersRef.current.push(data);
        receivedAllBytesRef.current += data.byteLength;
        const percent = Math.floor(
          (receivedAllBytesRef.current / totalAllBytesRef.current) * 100
        );
        setReceiveProgress(percent);
        return;
      }
    }
  }



  function download() {
    const files = receivedAttachmentsRef?.current || [];

    if (!files.length) {
      toast.error("No files to download");
      return;
    }

    try {
      for (const data of files) {
        if (!data?.blob) continue;

        const url = URL.createObjectURL(data.blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = data.metaData || "file";
        // document.body.appendChild(a);
        a.click();
        // document.body.removeChild(a);

        URL.revokeObjectURL(url);
      }
      toast.success("Downloading started");
    } catch (err) {
      toast.error("Failed to start download");
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors text-slate-900 dark:text-white">
      <Navbar page='sharing' />

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-14 items-start">
          <div className="w-full space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md">
              <p className="text-sm text-gray-500 mb-2">
                Your device code
              </p>

              <div className="text-center py-6 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                {peerId ? (
                  <span className="break-all">
                    <ShowTooltipInContent mainContent={peerId} toolTipContent={isCopiedToClipboard ? 'Copied!' : 'Click to copy'}
                      className={'text-sm sm:text-2xl font-semibold tracking-widest'} useButton={false} setCopyToClipboard={() => CopyToClipboard(false)} onMouseLeave={() => CopyToClipboard(true)} />
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">
                    Generating Device Code...
                  </span>
                )}
              </div>

              {
                connected && (
                  <>
                    <p className="text-sm text-gray-500 mb-2 mt-4">
                      Connected With Device
                    </p>

                    <div className="text-center py-6 bg-gray-100 dark:bg-slate-800 rounded-xl">
                      {targetId}
                    </div>
                  </>
                )
              }

            </div>

            {!connected &&
              (<div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md space-y-4">
                <p className="text-sm text-gray-500">
                  Enter friend's code
                </p>

                <input
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                  placeholder="Enter code to connect..."

                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400"
                />

              <ShowTooltipInContent mainContent={connecting ? "Connecting..." : "Connect"} toolTipContent={!targetId ? 'Paste code to connect' : connecting ? 'Connecting...' : 'Tap to connect'}
                className={'w-full rounded-xl py-3 text-center font-medium transition bg-slate-900 text-white dark:bg-white dark:text-black'}
                useButton={false} disabled={connecting || targetId.length < 8} onClick={signaling} />
              </div>)
            }
          </div>
          {
            connected && !isConnectionEstablisedAtReciever ? (
              <FileUpload
              onFiles={(files: any) => sendFiles(files)}
              isShared={isShared}
              isSharing = {isSharing}
              progress={progress}
              />
            ) : connected && isConnectionEstablisedAtReciever ? (
              <Attachements
              downloadAttachments={download}
              receiveProgress={receiveProgress}/>
            ) : (
              <DeviceOrbit />
            )
            }
        </div>
      </section>

      <Footer />
    </main>
  )
}
