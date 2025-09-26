import LoginLeft from '../components/LoginLeft';
import LoginRight from '../components/LoginRight';

export default function Login() {

  // Left panel now manages its own slideshow; use a solid background for the page

  return (
    <div className="relative h-screen w-screen bg-slate-950">
      <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden md:h-[90vh] md:max-h-[90vh]">
          <div className="h-full grid grid-cols-1 md:grid-cols-2">
            <LoginLeft />
            <LoginRight />
          </div>
        </div>
      </div>
    </div>
  );
}
