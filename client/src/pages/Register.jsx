import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGsapFadeIn } from '../hooks/useGsapFadeIn';

export default function Register() {
  const scope = useRef(null);
  useGsapFadeIn(scope);

  return (
    <div ref={scope} className="opacity-0 flex justify-center items-center min-h-screen px-4">
      <div data-anim="card" className="glass p-8 max-w-[400px] w-full text-center">
        <h2 className="mb-8">Create Account</h2>

        <div data-anim="field" className="input-group mb-4">
          <i className="fa-solid fa-user" />
          <input type="text" placeholder="Full Name" autoComplete="name" />
        </div>

        <div data-anim="field" className="input-group mb-4">
          <i className="fa-solid fa-envelope" />
          <input type="email" placeholder="Email Address" autoComplete="email" />
        </div>

        <div data-anim="field" className="input-group mb-4">
          <i className="fa-solid fa-lock" />
          <input type="password" placeholder="Password" autoComplete="new-password" />
        </div>

        <button type="button" className="btn btn-primary w-full">
          Register
        </button>

        <p className="mt-4 text-muted text-[0.9rem]">
          Already have an account?{' '}
          <Link to="/login" className="text-primary">
            Login
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
