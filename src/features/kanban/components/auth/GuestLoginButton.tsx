import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

export const GuestLoginButton = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuthStore();

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <button
      onClick={handleGuestLogin}
      className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-6 py-4 text-lg font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
    >
      <svg className="mr-3 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
      게스트로 둘러보기
    </button>
  );
};
