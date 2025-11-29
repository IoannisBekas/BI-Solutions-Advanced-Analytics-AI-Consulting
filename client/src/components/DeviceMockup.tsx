import { useState } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface DeviceMockupProps {
  desktopImage: string;
  tabletImage: string;
  mobileImage: string;
}

export function DeviceMockup({ desktopImage, tabletImage, mobileImage }: DeviceMockupProps) {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const images = {
    desktop: desktopImage,
    tablet: tabletImage,
    mobile: mobileImage,
  };

  return (
    <div className="w-full py-12">
      {/* Device Selector */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setDeviceType('desktop')}
          data-testid="button-device-desktop"
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            deviceType === 'desktop'
              ? 'bg-black text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Monitor size={20} />
          <span>Desktop</span>
        </button>
        <button
          onClick={() => setDeviceType('tablet')}
          data-testid="button-device-tablet"
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            deviceType === 'tablet'
              ? 'bg-black text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Tablet size={20} />
          <span>Tablet</span>
        </button>
        <button
          onClick={() => setDeviceType('mobile')}
          data-testid="button-device-mobile"
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
            deviceType === 'mobile'
              ? 'bg-black text-white shadow-lg'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Smartphone size={20} />
          <span>Mobile</span>
        </button>
      </div>

      {/* Mockup Container */}
      <div className="flex justify-center items-center">
        <div className="fade-in-animation">
          {deviceType === 'desktop' && (
            <div data-testid="mockup-desktop" className="w-full max-w-5xl mx-auto">
              {/* iMac Mockup */}
              <div className="mx-auto" style={{ width: '90%', maxWidth: '1200px' }}>
                <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl shadow-2xl p-4 relative">
                  {/* Bezel */}
                  <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
                    {/* Screen */}
                    <div className="relative overflow-hidden bg-black">
                      <img
                        src={images.desktop}
                        alt="Dashboard"
                        className="w-full h-auto object-cover"
                        style={{ aspectRatio: '16/9' }}
                      />
                    </div>
                  </div>
                  {/* Stand */}
                  <div className="flex justify-center mt-3">
                    <div className="w-24 h-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-2xl shadow-lg" />
                  </div>
                  {/* Camera */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full" />
                </div>
              </div>
            </div>
          )}

          {deviceType === 'tablet' && (
            <div data-testid="mockup-tablet" className="flex justify-center">
              {/* iPad Mockup */}
              <div className="w-full max-w-2xl mx-auto px-4">
                <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-3xl shadow-2xl p-3 relative">
                  {/* Bezel */}
                  <div className="bg-gray-300 rounded-2xl overflow-hidden">
                    {/* Screen */}
                    <div className="relative overflow-hidden bg-black rounded-2xl">
                      <img
                        src={images.tablet}
                        alt="Dashboard Tablet"
                        className="w-full h-auto object-cover"
                        style={{ aspectRatio: '4/3' }}
                      />
                    </div>
                  </div>
                  {/* Top Notch Area */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-500 rounded-full" />
                  {/* Home Button */}
                  <div className="flex justify-center mt-2">
                    <div className="w-8 h-8 bg-gray-400 rounded-full shadow-inner border-4 border-gray-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {deviceType === 'mobile' && (
            <div data-testid="mockup-mobile" className="flex justify-center">
              {/* iPhone Mockup */}
              <div className="w-full max-w-sm mx-auto px-4">
                <div className="bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl p-2 relative" style={{ aspectRatio: '9/19' }}>
                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10 border-2 border-gray-800" />
                  
                  {/* Screen */}
                  <div className="relative overflow-hidden rounded-2xl bg-black h-full shadow-inner">
                    <img
                      src={images.mobile}
                      alt="Dashboard Mobile"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-28 h-1 bg-black rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .fade-in-animation {
          animation: fadeIn 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
