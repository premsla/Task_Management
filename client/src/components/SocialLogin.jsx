import React from 'react';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';
import { toast } from 'sonner';

const SocialLogin = () => {
  const API_URL = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:8800';

  const handleSocialLogin = (provider) => {
    try {
      // Redirect to social login URL
      window.location.href = `${API_URL}/api/auth/${provider}`;
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Failed to initiate social login. Please try again.');
    }
  };

  const allSocialProviders = [
    {
      name: 'Google',
      provider: 'google',
      icon: FaGoogle,
      bgColor: 'bg-red-500 hover:bg-red-600',
      textColor: 'text-white'
    },
    {
      name: 'GitHub',
      provider: 'github',
      icon: FaGithub,
      bgColor: 'bg-gray-800 hover:bg-gray-900',
      textColor: 'text-white'
    },
    {
      name: 'Facebook',
      provider: 'facebook',
      icon: FaFacebook,
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white'
    }
  ];

  // For now, show all providers. In production, you could check which ones are configured
  const socialProviders = allSocialProviders;

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-300 dark:border-gray-600' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400'>
            Or continue with
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-3'>
        {socialProviders.map((social) => {
          const IconComponent = social.icon;
          return (
            <button
              key={social.provider}
              onClick={() => handleSocialLogin(social.provider)}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${social.bgColor} ${social.textColor} transition-colors duration-200`}
            >
              <IconComponent className='w-5 h-5 mr-2' />
              Continue with {social.name}
            </button>
          );
        })}
      </div>

      {/* Alternative: Single row layout for smaller screens */}
      <div className='hidden sm:block'>
        <div className='grid grid-cols-3 gap-3'>
          {socialProviders.map((social) => {
            const IconComponent = social.icon;
            return (
              <button
                key={`${social.provider}-alt`}
                onClick={() => handleSocialLogin(social.provider)}
                className={`w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${social.bgColor} ${social.textColor} transition-colors duration-200`}
                title={`Continue with ${social.name}`}
              >
                <IconComponent className='w-5 h-5' />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SocialLogin;
