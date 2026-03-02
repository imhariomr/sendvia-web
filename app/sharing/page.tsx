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
const MAX_BUFFER_BYTES = 256 * 1024;
const RESUME_BUFFER_BYTES = 64 * 1024;
const CONNECT_TIMEOUT_MS = 20_000;

interface FileMeta {
  type: "meta";
  name: string;
  size: number;
  mimeType: string;
  index: number;
}
interface BatchMeta {
  type: "batch-meta";
  totalBytes: number;
  fileCount: number;
}
interface EndMsg {
  type: "end";
  index: number;
  checksum: number;
}
interface ReceivedFile {
  name: string;
  mimeType: string;
  size: number;
  url?: string;
}

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
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);
  const [progress, setProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);

  const socket = useSocket();
  const { setUploadingFiles } = UseUploadingFiles();

  const peerRef = useRef<any>(null);
  const isInitiatorRef = useRef(false);
  const connectedRef = useRef(false);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendAbortRef = useRef(false);

  const receivedFilesRef = useRef<ReceivedFile[]>([]);
  const currentReceiveRef = useRef<{
    meta: FileMeta;
    writableStream: WritableStreamDefaultWriter | null;
    blobParts: Uint8Array[];
    receivedBytes: number;
    checksum: number;
  } | null>(null);
  const totalAllBytesRef = useRef(0);
  const receivedAllBytesRef = useRef(0);

  async function openOPFSWriter(fileName: string): Promise<WritableStreamDefaultWriter | null> {
    try {
      if (!("storage" in navigator)) return null;
      const root = await (navigator.storage as any).getDirectory();
      const fh = await root.getFileHandle(fileName, { create: true });
      const writable = await fh.createWritable();
      return writable.getWriter();
    } catch {
      return null;
    }
  }

  async function finalizeOPFS(fileName: string): Promise<string | null> {
    try {
      const root = await (navigator.storage as any).getDirectory();
      const fh = await root.getFileHandle(fileName);
      const file = await fh.getFile();
      return URL.createObjectURL(file);
    } catch {
      return null;
    }
  }

  const handleIncomingData = useCallback(async (raw: Uint8Array) => {
    if (raw[0] === 0x7b) {
      let msg: BatchMeta | FileMeta | EndMsg;
      try { msg = JSON.parse(new TextDecoder().decode(raw)); } catch { return; }

      if (msg.type === "batch-meta") {
        totalAllBytesRef.current = msg.totalBytes;
        receivedAllBytesRef.current = 0;
        receivedFilesRef.current = [];
        setReceiveProgress(0);
        return;
      }
      if (msg.type === "meta") {
        const writer = await openOPFSWriter(msg.name);
        currentReceiveRef.current = { meta: msg, writableStream: writer, blobParts: [], receivedBytes: 0, checksum: 1 };
        return;
      }
      if (msg.type === "end" && currentReceiveRef.current) {
        const cur = currentReceiveRef.current;
        let url: string | undefined;
        if (cur.writableStream) {
          try { await cur.writableStream.close(); url = (await finalizeOPFS(cur.meta.name)) ?? undefined; } catch { }
        }
        if (!url) {
          const blob = new Blob(cur.blobParts, { type: cur.meta.mimeType });
          url = URL.createObjectURL(blob);
        }
        receivedFilesRef.current.push({ name: cur.meta.name, mimeType: cur.meta.mimeType, size: cur.meta.size, url });
        setUploadingFiles([...receivedFilesRef.current]);
        currentReceiveRef.current = null;
      }
      return;
    }

    const cur = currentReceiveRef.current;
    if (!cur) return;
    cur.checksum = adler32(raw, cur.checksum);
    if (cur.writableStream) {
      try { await cur.writableStream.write(raw); }
      catch { cur.writableStream = null; cur.blobParts.push(raw); }
    } else {
      cur.blobParts.push(raw);
    }
    cur.receivedBytes += raw.byteLength;
    receivedAllBytesRef.current += raw.byteLength;
    setReceiveProgress(Math.floor((receivedAllBytesRef.current / totalAllBytesRef.current) * 100));
  }, [setUploadingFiles]);

  function iceConfig() {
    return {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: process.env.NEXT_PUBLIC_TURN_SERVER || "", username: process.env.NEXT_PUBLIC_TURN_USERNAME, credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL },
      ],
    };
  }

  function resetPeer() {
    setConnected(false);
    setConnecting(false);
    isInitiatorRef.current = false;
    if (peerRef.current) { try { peerRef.current.destroy(); } catch { } peerRef.current = null; }
  }

  useEffect(() => {
    if (!socket) return;
    if (!socket.connected) socket.connect();

    const handleSignal = ({ fromPeerId, data }: any) => {
      if (isInitiatorRef.current && peerRef.current) {
        peerRef.current.signal(data);
        socket.emit("connection-established", { toPeerId: fromPeerId });
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        toast.success("Connected Successfully 🎉");
        setConnected(true);
        setConnecting(false);
        return;
      }
      if (!peerRef.current) {
        peerRef.current = new Peer({ initiator: false, trickle: false, config: iceConfig() });
        peerRef.current.signal(data);
        peerRef.current.on("signal", (answer: any) => socket.emit("signal", { toPeerId: fromPeerId, data: answer }));
        peerRef.current.on("data", handleIncomingData);
        peerRef.current.on("error", (e: any) => { console.error(e); toast.error("Connection error."); resetPeer(); });
        peerRef.current.on("close", () => { toast.error("Peer disconnected."); resetPeer(); });
      }
    };

    socket.on("signal", handleSignal);
    socket.on("connection-established", ({ fromPeerId }: any) => {
      setIsConnectionEstablishedAtReceiver(true);
      setTargetId(fromPeerId);
      setConnected(true);
    });
    return () => { socket.off("signal", handleSignal); socket.off("connection-established"); };
  }, [socket, handleIncomingData]);

  useEffect(() => { connectedRef.current = connected; }, [connected]);

  function signaling() {
    setConnecting(true);
    isInitiatorRef.current = true;
    peerRef.current = new Peer({ initiator: true, trickle: false, config: iceConfig() });
    peerRef.current.on("signal", (offer: any) => socket.emit("signal", { toPeerId: targetId, data: offer }));
    peerRef.current.on("error", (e: any) => { console.error(e); toast.error("Connection failed."); resetPeer(); });
    peerRef.current.on("close", resetPeer);
    connectTimeoutRef.current = setTimeout(() => {
      if (!connectedRef.current) { toast.error("Connection timed out. Make sure the other device is online."); resetPeer(); }
    }, CONNECT_TIMEOUT_MS);
  }

  async function sendFiles(files: File[]) {
    const peer = peerRef.current;
    if (!peer?.connected) { toast.error("Not connected."); return; }
    setIsSharing(true); setIsShared(false); setProgress(0); sendAbortRef.current = false;
    const channel: RTCDataChannel = peer._channel;

    function waitForDrain(): Promise<void> {
      return new Promise((resolve) => {
        if (channel.bufferedAmount <= RESUME_BUFFER_BYTES) { resolve(); return; }
        channel.bufferedAmountLowThreshold = RESUME_BUFFER_BYTES;
        const handler = () => { channel.removeEventListener("bufferedamountlow", handler); resolve(); };
        channel.addEventListener("bufferedamountlow", handler);
      });
    }

    try {
      const totalBytes = files.reduce((s, f) => s + f.size, 0);
      let sentBytes = 0;
      peer.send(JSON.stringify({ type: "batch-meta", totalBytes, fileCount: files.length } satisfies BatchMeta));

      for (let idx = 0; idx < files.length; idx++) {
        if (sendAbortRef.current) break;
        const file = files[idx];
        peer.send(JSON.stringify({ type: "meta", name: file.name, size: file.size, mimeType: file.type || "application/octet-stream", index: idx } satisfies FileMeta));

        let offset = 0, checksum = 1;
        while (offset < file.size) {
          if (sendAbortRef.current) break;
          if (channel.bufferedAmount > MAX_BUFFER_BYTES) await waitForDrain();
          const slice = file.slice(offset, offset + CHUNK_SIZE);  // ← only 64KB in RAM at once
          const buf = await slice.arrayBuffer();
          const u8 = new Uint8Array(buf);
          checksum = adler32(u8, checksum);
          peer.send(u8);
          offset += u8.byteLength;
          sentBytes += u8.byteLength;
          setProgress(Math.floor((sentBytes / totalBytes) * 100));
        }
        peer.send(JSON.stringify({ type: "end", index: idx, checksum } satisfies EndMsg));
      }

      if (!sendAbortRef.current) { toast.success("Files shared successfully 🫡"); setIsShared(true); }
    } catch (err) {
      console.error(err);
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsSharing(false);
    }
  }

  function download() {
    const files = receivedFilesRef.current;
    if (!files.length) { toast.error("No files to download."); return; }
    for (const f of files) {
      if (!f.url) continue;
      const a = document.createElement("a");
      a.href = f.url; a.download = f.name; a.click();
    }
    toast.success("Download started.");
  }

  function CopyToClipboard(mouseLeave: boolean) {
    if (mouseLeave) setTimeout(() => setIsCopiedToClipboard(false), 500);
    else setIsCopiedToClipboard(true);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors text-slate-900 dark:text-white">
      <Navbar page="sharing" />
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-14 items-start">
          <div className="w-full space-y-6">
            <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md">
              <p className="text-sm text-gray-500 mb-2">Your device code</p>
              <div className="text-center py-6 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                {peerId ? (
                  <span className="break-all">
                    <ShowTooltipInContent mainContent={peerId}
                      toolTipContent={isCopiedToClipboard ? "Copied!" : "Click to copy"}
                      className="text-sm sm:text-2xl font-semibold tracking-widest"
                      useButton={false}
                      setCopyToClipboard={() => CopyToClipboard(false)}
                      onMouseLeave={() => CopyToClipboard(true)} />
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">Generating Device Code…</span>
                )}
              </div>
              {connected && (
                <>
                  <p className="text-sm text-gray-500 mb-2 mt-4">Connected with device</p>
                  <div className="text-center py-6 bg-gray-100 dark:bg-slate-800 rounded-xl">{targetId}</div>
                </>
              )}
            </div>

            {!connected && (
              <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-md space-y-4">
                <p className="text-sm text-gray-500">Enter friend's code</p>
                <input value={targetId} onChange={(e) => setTargetId(e.target.value.toUpperCase())}
                  placeholder="Enter code to connect…"
                  className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent px-4 py-3 outline-none focus:ring-2 focus:ring-slate-400" />
                <ShowTooltipInContent
                  mainContent={connecting ? "Connecting…" : "Connect"}
                  toolTipContent={!targetId ? "Paste code to connect" : connecting ? "Connecting…" : "Tap to connect"}
                  className="w-full rounded-xl py-3 text-center font-medium transition bg-slate-900 text-white dark:bg-white dark:text-black"
                  useButton={false} disabled={connecting || targetId.length < 8} onClick={signaling} />
              </div>
            )}
          </div>

          {connected && !isConnectionEstablishedAtReceiver ? (
            <FileUpload onFiles={(files: any) => sendFiles(files)} isShared={isShared} isSharing={isSharing} progress={progress} />
          ) : connected && isConnectionEstablishedAtReceiver ? (
            <Attachements downloadAttachments={download} receiveProgress={receiveProgress} />
          ) : (
            <DeviceOrbit />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}