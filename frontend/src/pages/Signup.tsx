import LoginLeft from '../components/LoginLeft';
import SignupRight from '../components/SignupRight';

export default function Signup() {
  return (
    <div className="relative h-screen w-screen bg-slate-950">
      <div className="flex h-full w-full items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl overflow-hidden md:h-[90vh] md:max-h-[90vh]">
          <div className="h-full grid grid-cols-1 md:grid-cols-2">
            <LoginLeft />
            <SignupRight />
          </div>
        </div>
      </div>
    </div>
  );
}


