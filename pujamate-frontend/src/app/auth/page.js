import AuthClient from '@/components/auth/AuthClient';

export const metadata = {
  title: 'Sign In — PujaMate',
};

export default function AuthPage() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-subheading text-lg text-crimson">Your PujaMate account</h2>
        <p className="font-body text-sm text-crimson-600/70">Keep your routes and passport progress with you.</p>
      </div>
      <AuthClient />
    </div>
  );
}
