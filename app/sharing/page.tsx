"use client"
import { useEffect, useRef, useState, useCallback } from "react"
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

const CHUNK_SIZE = 64 * 1024;
const MAX_BUFFER_BYTES = 1 * 1024 * 1024;
const RESUME_BUFFER_BYTES = 512 * 1024;
const CONNECT_TIMEOUT_MS = 20_000;

function adler32(buf: Uint8Array, prev = 1): number {
  let a = prev & 0xffff, b = (prev >>> 16) & 0xffff;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

export default function SharingPage() {
  const [targetId, setTargetId] = useState<string>("");
  const peerId = typeof window !== "undefined" ? localStorage.getItem("peerId") : null;

  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isConnectionEstablishedAtReceiver, setIsConnectionEstablishedAtReceiver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [isReceiveFinalizing, setIsReceiveFinalizing] = useState(false);

  const socket = useSocket();
  const { setUploadingFiles } = UseUploadingFiles();

  const peerRef = useRef<any>(null);
  const currentReceiveRef = useRef<any>(null);
  const receivedFilesRef = useRef<any[]>([]);
  const totalAllBytesRef = useRef(0);
  const receivedAllBytesRef = useRef(0);

  const handleIncomingData = useCallback(async (rawData: any) => {
    let raw: Uint8Array | null = null;
    let controlMsg: any = null;

    if (typeof rawData === "string") {
      try { controlMsg = JSON.parse(rawData); } catch {}
    } else if (rawData instanceof Uint8Array) {
      raw = rawData;
    } else if (rawData instanceof ArrayBuffer) {
      raw = new Uint8Array(rawData);
    }

    if (controlMsg?.type === "batch-meta") {
      totalAllBytesRef.current = controlMsg.totalBytes;
      receivedAllBytesRef.current = 0;
      receivedFilesRef.current = [];
      setReceiveProgress(0);
      return;
    }

    if (controlMsg?.type === "meta") {
      currentReceiveRef.current = {
        meta: controlMsg,
        blobParts: [],
        receivedBytes: 0,
        checksum: 1
      };
      return;
    }

    if (controlMsg?.type === "end" && currentReceiveRef.current) {
      const cur = currentReceiveRef.current;
      const blob = new Blob(cur.blobParts, { type: cur.meta.mimeType });
      const url = URL.createObjectURL(blob);

      receivedFilesRef.current.push({
        name: cur.meta.name,
        url
      });

      currentReceiveRef.current = null;
      setUploadingFiles([...receivedFilesRef.current]);
      setReceiveProgress(100);
      toast.success("File received");
      return;
    }

    if (!raw) return;

    const cur = currentReceiveRef.current;
    if (!cur) return;

    cur.checksum = adler32(raw, cur.checksum);

    if (cur.blobParts.length > 50) {
      cur.blobParts = [];
    }

    cur.blobParts.push(raw);
    cur.receivedBytes += raw.byteLength;
    receivedAllBytesRef.current += raw.byteLength;

    peerRef.current?.send(JSON.stringify({ type: "ack" }));

    if (totalAllBytesRef.current > 0) {
      const pct = Math.floor((receivedAllBytesRef.current / totalAllBytesRef.current) * 100);
      setReceiveProgress(Math.min(pct, 99));
    }

  }, []);

  async function sendFiles(files: File[]) {
    const peer = peerRef.current;
    if (!peer?.connected) {
      toast.error("Not connected");
      return;
    }

    setIsSharing(true);
    setProgress(0);

    let canSend = true;

    peer.on("data", (data: any) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "ack") {
          canSend = true;
        }
      } catch {}
    });

    const totalBytes = files.reduce((s, f) => s + f.size, 0);
    let sentBytes = 0;

    peer.send(JSON.stringify({
      type: "batch-meta",
      totalBytes,
      fileCount: files.length
    }));

    for (let file of files) {
      peer.send(JSON.stringify({
        type: "meta",
        name: file.name,
        size: file.size,
        mimeType: file.type
      }));

      let offset = 0;
      let checksum = 1;

      while (offset < file.size) {
        if (!canSend) {
          await new Promise(res => setTimeout(res, 2));
          continue;
        }

        canSend = false;

        const slice = file.slice(offset, offset + CHUNK_SIZE);
        const buf = await slice.arrayBuffer();
        const u8 = new Uint8Array(buf);

        checksum = adler32(u8, checksum);
        peer.send(u8);

        offset += u8.byteLength;
        sentBytes += u8.byteLength;

        setProgress(Math.floor((sentBytes / totalBytes) * 100));

        await new Promise(res => setTimeout(res, 2));
      }

      peer.send(JSON.stringify({
        type: "end",
        checksum
      }));
    }

    toast.success("File sent");
    setIsSharing(false);
    setIsShared(true);
  }

  function connect() {
    const peer = new Peer({ initiator: true, trickle: false });
    peerRef.current = peer;

    peer.on("signal", data => {
      socket.emit("signal", { toPeerId: targetId, data });
    });

    peer.on("data", handleIncomingData);

    peer.on("connect", () => {
      setConnected(true);
      toast.success("Connected");
    });

    peer.on("close", () => {
      setConnected(false);
    });
  }

  useEffect(() => {
    if (!socket) return;

    socket.on("signal", ({ data }) => {
      if (!peerRef.current) {
        const peer = new Peer({ initiator: false, trickle: false });
        peerRef.current = peer;

        peer.on("signal", answer => {
          socket.emit("signal", { data: answer });
        });

        peer.on("data", handleIncomingData);
      }

      peerRef.current.signal(data);
    });

  }, [socket]);

  return (
    <main>
      <Navbar />

      {!connected && (
        <button onClick={connect}>Connect</button>
      )}

      {connected && (
        <FileUpload onFiles={(files:any)=>sendFiles(files)} progress={progress} />
      )}

      <Attachements
        receiveProgress={receiveProgress}
        downloadAttachments={()=>{
          receivedFilesRef.current.forEach(f=>{
            const a=document.createElement("a");
            a.href=f.url;
            a.download=f.name;
            a.click();
          })
        }}
      />

      <Footer />
    </main>
  );
}
