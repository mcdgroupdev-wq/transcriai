import React, { useEffect } from 'react';

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Reusable Google AdSense Ad Unit component for React.
 * This handles the initialization of the adsbygoogle array.
 */
export const AdUnit: React.FC<AdUnitProps> = ({ 
  slot, 
  format = 'auto', 
  style = { display: 'block' },
  className = ""
}) => {
  useEffect(() => {
    try {
      // Push the ad to the adsbygoogle array
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container my-8 overflow-hidden flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-2343863331022813"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};
