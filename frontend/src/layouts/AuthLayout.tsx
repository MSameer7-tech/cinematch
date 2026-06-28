import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.08) 0%, rgba(6, 6, 10, 1) 85%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Cinematic Glows */}
      <div className="glow-orb" style={{ top: '10%', left: '10%', background: 'var(--primary-color)' }} />
      <div className="glow-orb" style={{ bottom: '15%', right: '15%', background: 'var(--secondary-color)', animationDelay: '-5s' }} />

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        maxWidth: '1100px',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '48px',
        position: 'relative',
        zIndex: 1
      }} className="auth-layout-container">
        {/* Left Side Branding */}
        <div style={{
          flex: '1',
          textAlign: 'left',
          maxWidth: '460px',
        }} className="auth-branding-panel">
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: 800, 
            lineHeight: 1.1, 
            margin: '0 0 16px 0', 
            background: 'linear-gradient(to right, #ffffff, var(--text-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-1.5px'
          }}>
            Discover your next favorite movie.
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Get personalized, AI-powered recommendations based on your unique tastes, watchlist, and ratings. Setup your profile in seconds.
          </p>
        </div>

        {/* Right Side AuthCard container */}
        <div style={{
          flex: '1',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: '440px',
        }}>
          <Outlet />
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .auth-layout-container {
            flex-direction: column !important;
            justify-content: center !important;
            gap: 32px !important;
          }
          .auth-branding-panel {
            text-align: center !important;
            max-width: 100% !important;
          }
          .auth-branding-panel h1 {
            font-size: 32px !important;
            margin-bottom: 8px !important;
          }
          .auth-branding-panel p {
            font-size: 15px !important;
            max-width: 480px;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
};
