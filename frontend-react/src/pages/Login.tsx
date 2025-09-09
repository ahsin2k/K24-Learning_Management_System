import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAuth } from '../hooks/useAuth';
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY } from '../store/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { t, i18n } = useTranslation();
  const { setLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BE_DOMAIN}/auth/login?lang=${i18n.language}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!res.ok) {
        throw new Error(await res.json());
      }

      const data = await res.json();

      Cookies.set(ACCESS_TOKEN_KEY, data.access_token, { expires: 7 }); 
      setLogin(data.access_token, data.user);
      toast.success(t('login_success', { ns: 'login' }));
      navigate("/");
    } catch (err: any) {
      toast.error(t('login_failed', { ns: 'login' }));
    }
  };

  return (
    <div className="w-full h-screen bg-gray-100 p-0 m-0 flex">
      <div className="bg-white w-full h-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {t('please_login', { ns: 'login' })}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email', { ns: 'login' })}
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('username_or_Email_id', { ns: 'login' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('password', { ns: 'login' })}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enter_password', { ns: 'login' })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            <div className="text-right">
              <a href="#forgot" className="text-sm text-blue-600 hover:underline">
                {t('forgot_password', { ns: 'login' })}
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              {t('sign_in', { ns: 'login' })}
              
              
            </button>
          </form>

          <div className="mt-8">
            <p className="text-center text-gray-500 text-sm mb-4">{t('or_sign_in_with', { ns: 'login' })}</p>
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
            {t('dont_have_an_account?', { ns: 'login' })}{' '}
            <a href="#signup" className="text-blue-600 hover:underline font-medium">
              {t('sign_up', { ns: 'login' })}{' '}
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