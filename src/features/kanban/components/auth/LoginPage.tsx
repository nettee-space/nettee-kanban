import { useAuth } from '../../hooks/useAuth';
import { GitHubLoginButton } from './GitHubLoginButton';
import { GuestLoginButton } from './GuestLoginButton';

export const LoginPage = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h1 className="mb-4 text-center text-5xl font-bold text-gray-900">
          칸반 로그인
        </h1>
        <p className="mb-12 text-center text-xl text-gray-600">
          게스트로 둘러보거나 GitHub 계정으로 로그인하세요
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white px-8 py-12 shadow-lg sm:rounded-lg sm:px-16">
          <div className="space-y-8">
            <GuestLoginButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="bg-white px-4 text-gray-500">또는</span>
              </div>
            </div>

            <GitHubLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
};
