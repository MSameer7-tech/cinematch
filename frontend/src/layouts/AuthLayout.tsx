import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Bookmark, Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#080710',
        backgroundImage: `
          linear-gradient(100deg, rgba(8, 7, 16, 0.72) 0%, rgba(8, 7, 16, 0.34) 48%, rgba(8, 7, 16, 0.68) 100%),
          url('/midnight-cinema-bg.png')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflowX: 'hidden',
      }}
      className="auth-page-root"
    >
      {/* Top-Left Brand Header (Anchored to Top-Left) */}
      <header
        style={{
          width: '100%',
          padding: '28px 44px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 2,
        }}
        className="auth-top-header"
      >
        <img
          src="/logo.png"
          alt="CineMatch"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
          }}
        />
        <span
          style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: '#F5F3FA',
            fontFamily: 'var(--font-heading, inherit)',
          }}
        >
          Cine<span style={{ color: '#B36BFF' }}>Match</span>
        </span>
      </header>

      {/* Consistent Max-Width Content Container */}
      <div
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1380px',
          margin: '0 auto',
          padding: '12px 56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
        className="auth-outer-container"
      >

        {/* Vertically Centered Two-Column Composition */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'clamp(40px, 6vw, 96px)',
            width: '100%',
          }}
          className="auth-layout-container"
        >
          {/* Left Side: Editorial Hero */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              flex: '1',
              textAlign: 'left',
              maxWidth: '640px',
              minWidth: 0,
              position: 'relative',
              padding: '24px 28px',
              margin: '-24px -28px',
              borderRadius: '24px',
              background: 'radial-gradient(ellipse at 42% 50%, rgba(8, 7, 16, 0.65) 0%, rgba(8, 7, 16, 0.35) 50%, rgba(8, 7, 16, 0) 76%)',
            }}
            className="auth-branding-panel"
          >
            <h1
              style={{
                fontSize: 'clamp(2.2rem, 3.8vw, 3.25rem)',
                fontWeight: 700,
                lineHeight: 1.07,
                margin: '0 0 18px 0',
                letterSpacing: '-0.03em',
                color: '#F5F3FA',
                fontFamily: 'var(--font-heading, inherit)',
                textShadow: '0 4px 24px rgba(0, 0, 0, 0.75)',
              }}
            >
              Discover your next
              <br />
              <span style={{ color: '#B36BFF' }}>favorite movie.</span>
            </h1>

            <p
              style={{
                fontSize: '15.5px',
                color: '#A6A1B5',
                lineHeight: 1.6,
                margin: '0 0 34px 0',
                maxWidth: '520px',
                fontWeight: 400,
                textShadow: '0 2px 16px rgba(0, 0, 0, 0.85)',
              }}
            >
              Get personalized movie recommendations based on your taste, watchlist, and ratings.
            </p>

            {/* Three Compact Editorial Feature Highlights */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                paddingTop: '22px',
                borderTop: '1px solid rgba(255, 255, 255, 0.09)',
              }}
              className="auth-feature-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Sparkles size={15} strokeWidth={1.75} color="#B36BFF" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#F5F3FA', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Smart Recommendations
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Bookmark size={15} strokeWidth={1.75} color="#B36BFF" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#F5F3FA', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Personal Watchlist
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <Compass size={15} strokeWidth={1.75} color="#B36BFF" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#F5F3FA', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Discover Movies
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Authentication Form Card */}
          <div
            style={{
              flex: '0 0 auto',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: '445px',
            }}
            className="auth-card-column"
          >
            <Outlet />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-outer-container {
            padding: 16px 20px 36px !important;
          }
          .auth-page-root {
            background-image: linear-gradient(180deg, rgba(8, 7, 16, 0.78) 0%, rgba(8, 7, 16, 0.88) 100%), url('/midnight-cinema-bg.png') !important;
          }
          .auth-top-header {
            padding: 20px 20px 8px !important;
          }
          .auth-layout-container {
            flex-direction: column-reverse !important;
            justify-content: center !important;
            gap: 28px !important;
          }
          .auth-card-column {
            max-width: 445px !important;
          }
          .auth-branding-panel {
            text-align: center !important;
            max-width: 445px !important;
            padding: 16px !important;
            margin: 0 !important;
          }
          .auth-branding-panel h1 {
            font-size: 28px !important;
            margin-bottom: 10px !important;
          }
          .auth-branding-panel p {
            font-size: 14px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-bottom: 20px !important;
          }
          .auth-feature-row {
            justify-content: center !important;
            gap: 16px !important;
            padding-top: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
