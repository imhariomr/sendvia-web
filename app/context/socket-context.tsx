'use client'
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";


export const SocketContext = createContext<any>(null);
let peerId;
const expiryTime = 24 * 60 * 60 * 1000;

const generateShortPeerId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

function generatePeerId(){
  peerId = generateShortPeerId();
  localStorage.setItem("peerId", peerId);
  localStorage.setItem("peerIdCreatedAt", Date.now().toString());
}

export const SocketProvider = ({ children }: any) => {
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    peerId = localStorage.getItem("peerId");
    if (!peerId) {
      generatePeerId();
    }else{
      if(peerId.length > 10){
        generatePeerId();
      }
      const createdAt = Number(localStorage.getItem("peerIdCreatedAt"));
      if (!createdAt || Date.now() - createdAt > expiryTime) {
        generatePeerId();
      }
    }

    const connection = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { peerId },
      reconnection: true,
    });
    setSocket(connection);
    return () => {
      connection.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);