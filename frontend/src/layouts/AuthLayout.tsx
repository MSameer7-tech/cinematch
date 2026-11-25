import { Outlet } from 'react-router-dom';
import { Sparkles, Play, BarChart2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#07060d',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.16) 0%, rgba(7, 6, 13, 0.88) 55%, rgba(5, 5, 10, 0.96) 100%),
          url('/cinematic-purple-filmstrip.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top-Left Brand Header */}
      <header
        style={{
          width: '100%',
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '28px 36px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
        className="auth-top-header"
      >
        <img
          src="/logo.png"
          alt="CineMatch"
          style={{
            width: '30px',
            height: '30px',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '-0.3px',
            color: '#ffffff',
            fontFamily: 'var(--font-heading, inherit)',
          }}
        >
          Cine<span style={{ color: '#a855f7' }}>Match</span>
        </span>
      </header>

      {/* Main Centered Split Container */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 36px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            maxWidth: '1160px',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '56px',
          }}
          className="auth-layout-container"
        >
          {/* Left Side Editorial Hero */}
          <div
            style={{
              flex: '1',
              textAlign: 'left',
              maxWidth: '520px',
            }}
            className="auth-branding-panel"
          >
            <h1
              style={{
                fontSize: 'clamp(2.25rem, 4.4vw, 3.35rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                margin: '0 0 18px 0',
                letterSpacing: '-1.5px',
                color: '#e2e8f0',
                fontFamily: 'var(--font-heading, inherit)',
              }}
            >
              Discover your next
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                favorite movie.
              </span>
            </h1>

            <p
              style={{
                fontSize: '16px',
                color: 'rgba(226, 232, 240, 0.7)',
                lineHeight: 1.55,
                margin: '0 0 36px 0',
                maxWidth: '450px',
              }}
            >
              Get personalized, AI-powered recommendations based on your taste, watchlist, and ratings.
            </p>

            {/* 3 Feature Highlights */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
              }}
              className="auth-feature-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 0.16)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    flexShrink: 0,
                  }}
                >
                  <Sparkles size={14} />
                </div>
                <span style={{ fontSize: '12.5px', lineHeight: 1.3, color: 'rgba(226, 232, 240, 0.78)', fontWeight: 500 }}>
                  Smart
                  <br />
                  Recommendations
                </span>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} className="auth-feature-divider" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 0.16)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    flexShrink: 0,
                  }}
                >
                  <Play size={13} />
                </div>
                <span style={{ fontSize: '12.5px', lineHeight: 1.3, color: 'rgba(226, 232, 240, 0.78)', fontWeight: 500 }}>
                  Track Your
                  <br />
                  Watchlist
                </span>
              </div>

              <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(255, 255, 255, 0.12)' }} className="auth-feature-divider" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 92, 246, 0.16)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c084fc',
                    flexShrink: 0,
                  }}
                >
                  <BarChart2 size={14} />
                </div>
                <span style={{ fontSize: '12.5px', lineHeight: 1.3, color: 'rgba(226, 232, 240, 0.78)', fontWeight: 500 }}>
                  Explore
                  <br />
                  Ratings
                </span>
              </div>
            </div>
          </div>

          {/* Right Side AuthCard container */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '410px',
            }}
          >
            <Outlet />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .auth-top-header {
            padding: 20px 20px 0 !important;
          }
          .auth-layout-container {
            flex-direction: column !important;
            justify-content: center !important;
            gap: 28px !important;
          }
          .auth-branding-panel {
            text-align: center !important;
            max-width: 100% !important;
          }
          .auth-branding-panel p {
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 24px !important;
            font-size: 14.5px !important;
          }
          .auth-feature-row {
            justify-content: center !important;
            gap: 14px !important;
          }
          .auth-feature-divider {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
