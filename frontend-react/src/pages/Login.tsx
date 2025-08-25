import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-0 m-0 flex">
      <div className="bg-white w-full h-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Username or Email ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="text-right">
              <a href="#forgot" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              Sign in →
            </button>
          </form>

          <div className="mt-8">
            <p className="text-center text-gray-500 text-sm mb-4">Or sign in with</p>
            <div className="flex justify-center gap-3">
              <button className="flex items-center border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">Facebook</span>
              </button>
              <button className="flex items-center border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="flex items-center border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                  alt="Microsoft"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium">Microsoft</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <a href="#signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </a>
          </p>
        </div>

        <div className="hidden md:block bg-blue-50">
          <img
            src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80"
            alt="Students collaborating"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </div>
  );
}