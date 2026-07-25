import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGsapFadeIn } from '../hooks/useGsapFadeIn';

export default function Login() {
  const scope = useRef(null);
  useGsapFadeIn(scope);

  return (
    <div ref={scope} className="opacity-0 flex justify-center items-center min-h-screen px-4">
      <div data-anim="card" className="glass p-8 max-w-[400px] w-full text-center">
        <h2 className="mb-8">Welcome Back</h2>

        <div data-anim="field" className="input-group mb-4">
          <i className="fa-solid fa-envelope" />
          <input type="email" placeholder="Email Address" autoComplete="email" />
        </div>

        <div data-anim="field" className="input-group mb-4">
          <i className="fa-solid fa-lock" />
          <input type="password" placeholder="Password" autoComplete="current-password" />
        </div>

        <button type="button" className="btn btn-primary w-full">
          Login
        </button>

        <p className="mt-4 text-muted text-[0.9rem]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary">
            Register
          </Link>
        </p>

        <div className="mt-8">
          <Link to="/" className="btn btn-outline !text-[0.8rem]">
            <i className="fa-solid fa-arrow-left" /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
