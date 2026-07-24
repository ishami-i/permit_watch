import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "We couldn't process that request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-900)]">Check your email</h2>
        <p className="text-sm text-[var(--text-700)]">
          If an account exists for {email}, we've sent password reset instructions.
        </p>
        <Link to="/login" className="text-sm font-medium text-[var(--primary-600)] hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-900)]">Reset your password</h2>
        <p className="text-sm text-[var(--text-700)]">
          Enter your email and we'll send you reset instructions.
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger-500)]">{error}</p>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm text-[var(--text-700)]">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-md border border-[var(--background-200)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-300)]"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-[var(--primary-500)] py-2 font-medium text-white transition-colors hover:bg-[var(--primary-600)] disabled:opacity-60"
      >
        {submitting ? "Sending..." : "Send reset link"}
      </button>

      <Link to="/login" className="block text-center text-sm text-[var(--text-700)] hover:text-[var(--primary-600)]">
        Back to sign in
      </Link>
    </form>
  );
}
