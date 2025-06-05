import { useRef, useState } from 'react';

import useAlert from '../hooks/useAlert.js'; // Assuming this hook is in this path
import Alert from '../components/Alert.jsx';  // Assuming this component is in this path

const Contact = () => {
  const formRef = useRef();
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Send Message');

  // Define your backend URL. Use an environment variable or a default.
  const backendUrl = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000';

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!showOtpInput) { // Stage 1: Send OTP
      setLoadingMessage('Sending OTP...');
      try {
        const response = await fetch(`${backendUrl}/api/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            message: form.message,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showAlert({
            show: true,
            text: data.message || 'OTP sent successfully! Please check your email.',
            type: 'success',
          });
          setShowOtpInput(true);
          setLoadingMessage('Verify OTP & Submit');
        } else {
          showAlert({
            show: true,
            text: data.message || 'Failed to send OTP. Please try again.',
            type: 'danger',
          });
          setLoadingMessage('Send Message');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        showAlert({
          show: true,
          text: 'An error occurred while sending OTP. Please try again.',
          type: 'danger',
        });
        setLoadingMessage('Send Message');
      } finally {
        setLoading(false);
      }
    } else { // Stage 2: Verify OTP and Submit Message
      setLoadingMessage('Verifying OTP & Sending...');
      try {
        const response = await fetch(`${backendUrl}/api/verify-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            otp: otp,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          showAlert({
            show: true,
            text: data.message || 'Message sent successfully! Thank you.',
            type: 'success',
          });
          setForm({ name: '', email: '', message: '' }); // Clear form
          setOtp('');
          setShowOtpInput(false);
          setLoadingMessage('Send Message');
          await new Promise(resolve => setTimeout(() => { hideAlert(); resolve(); }, 4000)); // Hide alert after a delay
        } else {
          showAlert({
            show: true,
            text: data.message || 'OTP verification failed. Please try again.',
            type: 'danger',
          });
          setLoadingMessage('Verify OTP & Submit');
        }
      } catch (error) {
        console.error('Error verifying OTP:', error);
        showAlert({
          show: true,
          text: 'An error occurred during OTP verification. Please try again.',
          type: 'danger',
        });
        setLoadingMessage('Verify OTP & Submit');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section
      className="c-space py-16 md:py-24 bg-[var(--bg-original-dark)]"
      id="contact"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {alert.show && (
          <div className="mb-8 max-w-2xl mx-auto z-50 relative">
            <Alert {...alert} />
          </div>
        )}

        <div className="bg-[var(--palette-darkest-purple)] p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-2xl mx-auto relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold text-center text-[var(--text-on-dark)] mb-2">
            Let's Connect
          </h3>
          <p className="text-center text-[var(--palette-light-purple)] mb-8 md:mb-10 text-base md:text-lg">
            Have a project in mind or just want to say hi? Fill out the form below.
          </p>
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col space-y-6 relative z-10"
          >
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-semibold text-[var(--palette-light-purple)] tracking-wide">
                Full Name
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                disabled={loading || showOtpInput} // Disable if loading or OTP input is shown
                className="w-full bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--text-on-dark)] placeholder:text-[var(--palette-mid-purple)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition-all duration-200 ease-in-out"
                placeholder="e.g., John Doe"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-semibold text-[var(--palette-light-purple)] tracking-wide">
                Email Address
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading || showOtpInput} // Disable if loading or OTP input is shown
                className="w-full bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--text-on-dark)] placeholder:text-[var(--palette-mid-purple)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition-all duration-200 ease-in-out"
                placeholder="e.g., johndoe@example.com"
              />
            </label>
            <label className="flex flex-col space-y-2">
              <span className="text-sm font-semibold text-[var(--palette-light-purple)] tracking-wide">
                Your Message
              </span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                disabled={loading || showOtpInput} // Disable if loading or OTP input is shown
                className="w-full bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--text-on-dark)] placeholder:text-[var(--palette-mid-purple)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition-all duration-200 ease-in-out resize-none"
                placeholder="Share your thoughts, project details, or inquiries..."
              />
            </label>

            {showOtpInput && (
              <label className="flex flex-col space-y-2">
                <span className="text-sm font-semibold text-[var(--palette-light-purple)] tracking-wide">
                  Enter OTP
                </span>
                <input
                  type="text"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  required
                  disabled={loading}
                  className="w-full bg-[var(--palette-dark-purple)] border border-[var(--palette-mid-purple)] text-[var(--text-on-dark)] placeholder:text-[var(--palette-mid-purple)] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition-all duration-200 ease-in-out"
                  placeholder="Enter the 6-digit OTP"
                />
              </label>
            )}

            <button
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-[hsl(var(--primary))] text-[var(--text-on-primary)] font-semibold rounded-lg hover:bg-opacity-90 active:bg-opacity-80 transition-all duration-200 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed text-base md:text-lg group z-10 relative"
              type="submit"
              disabled={loading}
            >
              {loading ? loadingMessage + '...' : (showOtpInput ? 'Verify OTP & Submit' : 'Send Message')}
              {!loading && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 transform transition-transform duration-200 group-hover:translate-x-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;