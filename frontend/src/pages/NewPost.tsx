import { useEffect, useRef, useState } from 'react';
import { ensureAnonSignIn, storage } from '../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { apiFetch } from '../api';

type Mode = 'camera' | 'upload';

export default function NewPost() {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<Mode>('upload');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    ensureAnonSignIn().catch(() => {});
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error(e);
      alert('Camera access denied. Use file upload.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function snapPhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const snapped = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
        setFile(snapped);
      }
    }, 'image/jpeg', 0.92);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return alert('Pick a photo or use the camera.');
    setUploading(true);
    try {
      const uid = await ensureAnonSignIn();
      const key = `posts/${uid}/${crypto.randomUUID()}.jpg`;
      const storageRef = ref(storage, key);
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
        task.on('state_changed', undefined, reject, () => resolve());
      });
      const imageUrl = await getDownloadURL(storageRef);
      await apiFetch('/api/posts', { method: 'POST', body: JSON.stringify({ imageUrl, caption }) });
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Failed to create post');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white overflow-hidden">
      <div className="mx-auto h-full max-w-5xl p-4">
        <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: preview area (only shows selected/snatched image) */}
          <div className="rounded-xl border border-white/15 bg-black/60 flex items-center justify-center overflow-hidden">
            {file ? (
              <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-contain" />
            ) : (
              <div className="text-white/50">No image selected</div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Right: controls area */}
          <div className="rounded-xl border border-white/15 bg-white/5 p-4 flex flex-col">
            <h1 className="text-2xl font-semibold mb-4">Create Post</h1>

            {/* Mode Switcher */}
            <div className="inline-flex rounded-xl border border-white/15 overflow-hidden self-start mb-4">
              <button
                className={`px-4 py-2 ${mode === 'upload' ? 'bg-white/15' : 'bg-transparent'} hover:bg-white/10`}
                onClick={() => { setMode('upload'); stopCamera(); }}
              >
                Upload file
              </button>
              <button
                className={`px-4 py-2 ${mode === 'camera' ? 'bg-white/15' : 'bg-transparent'} hover:bg-white/10`}
                onClick={() => { setMode('camera'); startCamera(); }}
              >
                Use camera
              </button>
            </div>

            {mode === 'camera' ? (
              <div className="mb-4 h-64 w-full rounded-lg bg-black relative overflow-hidden">
                <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" playsInline muted />
                <button
                  onClick={snapPhoto}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/40 bg-black/30 px-5 py-2 text-white backdrop-blur-md hover:bg-white/20"
                >
                  Snap
                </button>
              </div>
            ) : (
              <div className="mb-4 h-64 w-full rounded-lg border border-white/20 bg-white/10 flex items-center justify-center">
                <label className="cursor-pointer text-center">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  Choose image
                </label>
              </div>
            )}

            <div className="mb-4">
              <label className="mb-1 block text-sm text-white/70">Caption</label>
              <input className="w-full rounded-lg border border-white/20 bg-black/30 p-3" value={caption} onChange={(e) => setCaption(e.target.value)} />
            </div>
            <button disabled={uploading} onClick={onSubmit} className="mt-auto rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-3 font-medium text-white disabled:opacity-60">
              {uploading ? 'Uploading…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


