'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { activate2fa, disable2fa, get2faSecret } from './action';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default function TwoFactorAuthForm({
  twoFactorActivated,
}: {
  twoFactorActivated: boolean;
}) {
  const [isActivated, setIsActivated] = useState(twoFactorActivated);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [otp, setOtp] = useState('');

  const handleEnableClick = async () => {
    const response = await get2faSecret();

    if (response.error) {
      toast.error(response.error);
      return;
    }

    setStep(2);
    setCode(response.twoFactorSecret ?? '');
  };

  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await activate2fa(otp);
    if (response?.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Two-Factor Authentication has been enabled');

    setIsActivated(true);
  };

  const handleDisable2faClick = async () => {
    const response = await disable2fa();
    if (response?.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Two-Factor Authentication has been disabled');
    setIsActivated(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {isActivated && (
        <Button
          className="bg-destructive w-full my-2"
          onClick={handleDisable2faClick}
        >
          Disable Two-Factor Authentication
        </Button>
      )}
      {!isActivated && (
        <div>
          {step === 1 && (
            <Button className="w-full my-2" onClick={handleEnableClick}>
              Enable Two-Factor Authentication
            </Button>
          )}
          {step === 2 && (
            <div>
              <p className="text-xs text-muted-foreground py-2">
                Scan the QR code below in the Google Authenticator app to
                activate Two-Factor Authentication.
              </p>
              <QRCodeSVG value={code} />
              <Button
                className="w-full my-2"
                onClick={() => {
                  setStep(3);
                }}
              >
                I have scanned the QR code
              </Button>
              <Button
                className="w-full my-2"
                variant="outline"
                onClick={() => {
                  setStep(1);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                Please enter the code from the Google Authenticator app to
                activate Two-Factor Authentication.
              </p>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button disabled={otp.length !== 6} type="submit">
                Submit and activate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1);
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
