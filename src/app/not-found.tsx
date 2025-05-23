import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        color: '#A5D6A7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Joystix, monospace',
        textShadow: '0 0 8px #A5D6A7, 0 0 2px #fff',
      }}
    >
      <img
        src="/boardslideerro404.gif"
        alt="Skatehive Not Found"
        style={{ width: 220, marginBottom: 32, borderRadius: 16, boxShadow: '0 0 24px #A5D6A7' }}
      />
      <h1 style={{ fontSize: 48, marginBottom: 16, letterSpacing: 2, color: '#A5D6A7' }}>
        Oops! Page Not Found
      </h1>
      <p style={{ fontSize: 22, marginBottom: 32, color: '#fff', maxWidth: 420 }}>
        Looks like you took a wrong turn. This page doesn’t exist.<br />
        But don’t worry, you can always roll back to the plaza.
      </p>
      <Link
        href="/"
        style={{
          background: 'linear-gradient(90deg, #A5D6A7 0%, #009933 100%)',
          color: '#000',
          padding: '14px 36px',
          borderRadius: 8,
          fontWeight: 'bold',
          fontSize: 20,
          textDecoration: 'none',
          boxShadow: '0 0 16px #A5D6A7',
        }}
      >
        Back to Skatehive Plaza
      </Link>
    </div>
  );
}
