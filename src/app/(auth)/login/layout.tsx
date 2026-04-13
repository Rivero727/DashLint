// src/app/(auth)/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white"> 
      {/* Aquí no hay header, el login ocupará toda la pantalla */}
      {children}
    </div>
  );
}