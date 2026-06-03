import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div 
        className="w-full max-w-[1000px] min-h-[680px] bg-white flex flex-col md:flex-row overflow-hidden" 
        style={{ borderRadius: '24px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(226, 232, 240, 0.8)' }}
      >
        {/* Left Panel - Emerald branding background */}
        <div className="w-full md:w-1/2 flex items-center justify-center py-12 md:py-0" style={{ background: '#065F46' }}>
          <div className="px-12 text-center">
            {/* White Logo Box */}
            <div 
              className="w-16 h-16 mx-auto mb-8 flex items-center justify-center font-bold text-2xl border border-white/10 shadow-sm" 
              style={{ background: 'white', color: '#065F46', borderRadius: '16px' }}
            >
              N
            </div>

            {/* Title */}
            <h1 className="mb-4" style={{ fontSize: '48px', fontWeight: '700', color: 'white', lineHeight: '1.2' }}>
              Neuberg
            </h1>

            {/* Subtitle */}
            <p className="mb-12 text-white/90" style={{ fontSize: '16px', lineHeight: '1.5' }}>
              Upload medical forms and extract data instantly with AI
            </p>

            {/* Feature List */}
            <div className="text-left space-y-4 max-w-sm mx-auto">
              {[
                'Upload PDF or image forms',
                'AI extracts all fields',
                'Copy any field instantly',
                'View past uploads anytime'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                    <Check size={12} className="text-white" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '500' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Inputs Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-6 md:px-16 py-12 md:py-0">
          <div className="w-full max-w-md">
            {/* Badge */}
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-semibold" style={{ background: '#F0FDF4', color: '#047857' }}>
              Create account
            </div>

            {/* Heading */}
            <h2 className="mb-2" style={{ fontSize: '42px', fontWeight: '700', color: '#12133A', lineHeight: '1.1' }}>
              Get started
            </h2>

            {/* Subheading */}
            <p className="mb-8 text-gray-500 text-sm" style={{ fontSize: '14px' }}>
              Create your account to start extracting data
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-13 rounded-xl border-gray-200 focus-visible:ring-[#065F46] focus-visible:border-[#065F46]"
                  style={{ background: 'white', border: '1px solid #E5E7EB' }}
                  required
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-xl border-gray-200 focus-visible:ring-[#065F46] focus-visible:border-[#065F46]"
                  style={{ background: 'white', border: '1px solid #E5E7EB' }}
                  required
                />
              </div>

              {/* Role Select Dropdown */}
              <div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-13 px-3 rounded-xl border border-gray-200 outline-none focus:border-[#065F46] focus:ring-1 focus:ring-[#065F46] transition-colors text-gray-500 bg-white"
                  style={{ fontSize: "14px", fontWeight: "500" }}
                  required
                >
                  <option value="" disabled>Select your role</option>
                  <option value="Doctor">Doctor / Physician</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-13 rounded-xl border-gray-200 focus-visible:ring-[#065F46] focus-visible:border-[#065F46]"
                  style={{ background: 'white', border: '1px solid #E5E7EB' }}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-13 rounded-xl text-white font-semibold transition-opacity hover:opacity-95 cursor-pointer"
                style={{ background: '#065F46' }}
              >
                Create account
              </Button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-150"></div>
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-150"></div>
              </div>

              <div className="text-center text-sm text-gray-500 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="font-semibold hover:underline bg-none border-none cursor-pointer"
                  style={{ color: '#065F46' }}
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
