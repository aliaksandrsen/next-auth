'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function TwoFactorAuthForm({
  twoFactorActivated,
}: {
  twoFactorActivated: boolean;
}) {
  const [isActivated, setIsActivated] = useState(twoFactorActivated);
  const [step, setStep] = useState(1);

  const handleEnableClick = () => {
    setStep(2);
  };

  return (
    <div className="flex flex-col gap-4">
      {!isActivated && (
        <div>
          {step === 1 && (
            <Button onClick={handleEnableClick}>
              Enable Two-Factor Authentication
            </Button>
          )}
          {step === 2 && <div>display qr code</div>}
        </div>
      )}
    </div>
  );
}
