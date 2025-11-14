"use client"
import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
