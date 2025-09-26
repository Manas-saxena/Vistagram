import { useEffect, useState } from 'react';

export default function LoginLeft() {
  const postImages = [
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop',
  ];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % postImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [postImages.length]);

  const imageUrl = postImages[currentIdx];
  return (
    <div className="relative hidden md:block overflow-hidden md:h-full">
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white/90">
        <div className="mb-2 flex items-center gap-2">
          <img src="/vistagram-logo.svg" className="h-6 w-6" alt="logo" />
          <span className="text-sm font-medium">Vistagram</span>
        </div>
        <p className="text-sm leading-snug">Sunset at the ridge • A calm evening with pastel skies over the mountains.</p>
      </div>
    </div>
  );
}


