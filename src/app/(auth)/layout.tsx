export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: `linear-gradient(rgba(232,197,71,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,197,71,0.04) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ width: '600px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(232,197,71,0.07) 0%, transparent 70%)' }} />
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}
