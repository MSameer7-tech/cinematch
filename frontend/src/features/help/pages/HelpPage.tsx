import { type FC, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  X,
  Sparkles,
  Compass,
  Sliders,
  ChevronDown,
  Mail,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import './HelpPage.css';

type FaqCategory = 'All' | 'AI & Taste' | 'Discovery & Search' | 'Library & Playback' | 'Account & Settings';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'All'>;
  question: string;
  answer: string;
}

const SUPPORT_EMAIL = 'mohammadsameerwork@gmail.com';

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'ai-personalization',
    category: 'AI & Taste',
    question: 'How does CineMatch personalize my movie recommendations?',
    answer:
      'CineMatch builds a dynamic taste profile from your onboarding genres, anchor films, favorites, watchlist, and ratings. Both the Home carousels and CineMatch AI use these signals to surface films that match your preferred directors, themes, and pacing.',
  },
  {
    id: 'ai-languages',
    category: 'AI & Taste',
    question: 'Can I ask CineMatch AI for specific languages or moods?',
    answer:
      'Yes! In AI Picks, you can ask naturally for regional cinema or specific moods—such as "Hindi comedy movies according to my taste", "Korean thrillers under 2 hours", or "mind-bending sci-fi like Interstellar". CineMatch AI filters and ranks matching titles from the catalog.',
  },
  {
    id: 'recalibrate-taste',
    category: 'AI & Taste',
    question: 'How do I update or recalibrate my Taste Profile?',
    answer:
      'Go to Settings → General & Playback and click "Recalibrate Taste Profile" to re-run the onboarding calibration anytime. You can also inspect or refresh your AI Taste Document under Settings → AI Taste Profile.',
  },
  {
    id: 'discover-vs-search',
    category: 'Discovery & Search',
    question: 'What is the difference between Discover and Search?',
    answer:
      'Search lets you find specific movies, series, actors, or directors by title or keyword and refine results by genre, rating, or release year. Discover lets you browse curated streams—Popular, Trending, Top Rated, and New Releases—with instant preview details.',
  },
  {
    id: 'cinema-focus',
    category: 'Discovery & Search',
    question: 'How does the Primary Cinema Focus setting affect Home and Discover?',
    answer:
      'In Settings → General & Playback, you can choose between All Global, Bollywood & Indian, or Hollywood & Western. Selecting Bollywood & Indian brings Indian cinema to the forefront on Home and Discover, while Hollywood & Western focuses purely on international and Western releases.',
  },
  {
    id: 'library-collections',
    category: 'Library & Playback',
    question: 'What is the difference between Watchlist, Favorites, and Ratings?',
    answer:
      'Watchlist tracks movies you plan to watch (and lets you mark them as watched). Favorites stores films you love, while Ratings lets you score titles from 1 to 10. All three signals continuously improve your CineMatch recommendations.',
  },
  {
    id: 'trailer-playback',
    category: 'Library & Playback',
    question: 'How do Auto-Play Trailers, Trailer Audio, and Artwork Quality work?',
    answer:
      'Under Settings → General & Playback, you can toggle whether trailers start automatically when opened, whether trailer audio is unmuted by default, and whether CineMatch loads full-resolution original posters/backdrops or bandwidth-saving standard assets.',
  },
  {
    id: 'mature-content',
    category: 'Account & Settings',
    question: 'How do I hide mature or R-rated content from recommendations?',
    answer:
      'Toggle off "Include Mature Content" in Settings → General & Playback. CineMatch will immediately filter out adult-flagged titles and restrict Discover queries to family-friendly ratings (PG-13 and below).',
  },
  {
    id: 'google-signin-guest',
    category: 'Account & Settings',
    question: 'Can I use CineMatch as a Guest or sign in with Google?',
    answer:
      'Yes! You can browse as a Guest or sign in with Google or email/password for persistent cloud sync across devices. Your Watchlist, Favorites, Ratings, and AI chat history are preserved when signed into your account.',
  },
  {
    id: 'export-clear-data',
    category: 'Account & Settings',
    question: 'How can I export my data or clear my search history?',
    answer:
      'Open Settings → Account & Storage. From there, you can export your profile and preferences as JSON, clear your recent search history, refresh the application query cache, or reset all preferences to defaults.',
  },
];

const CATEGORIES: FaqCategory[] = [
  'All',
  'AI & Taste',
  'Discovery & Search',
  'Library & Playback',
  'Account & Settings',
];

export const HelpPage: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('All');
  const [openFaqIds, setOpenFaqIds] = useState<string[]>(['ai-personalization']);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    toast.success(`Copied ${SUPPORT_EMAIL} to clipboard`);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="help-page-container">
      {/* 1. Immersive Hero Header */}
      <section className="help-hero">
        <div className="help-hero-badge">
          <HelpCircle size={14} />
          <span>CineMatch Help Center</span>
        </div>

        <h1 className="help-hero-title">How can we help you today?</h1>
        <p className="help-hero-subtitle">
          Find quick answers about AI recommendations, discovery filters, trailer playback,
          library syncing, and account preferences—or reach out directly to our support team.
        </p>

        <div className="help-search-box">
          <Search size={17} className="help-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g., trailers, Hindi movies, Google sign-in, settings)..."
            className="help-search-input"
            aria-label="Search frequently asked questions"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="help-search-clear"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </section>

      {/* 2. Quick Feature Shortcuts */}
      <section className="help-guides-grid">
        <button
          type="button"
          className="help-guide-card"
          onClick={() => navigate('/ai-picks')}
        >
          <div
            className="help-guide-icon"
            style={{ backgroundColor: 'rgba(168, 85, 247, 0.16)', color: '#c084fc' }}
          >
            <Sparkles size={20} />
          </div>
          <h3 className="help-guide-title">AI Picks & Taste Chat</h3>
          <p className="help-guide-desc">
            Ask for movies by mood, genre, or language like Hindi or Korean comedies tailored to your taste.
          </p>
        </button>

        <button
          type="button"
          className="help-guide-card"
          onClick={() => navigate('/discover')}
        >
          <div
            className="help-guide-icon"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.16)', color: '#38bdf8' }}
          >
            <Compass size={20} />
          </div>
          <h3 className="help-guide-title">Explore & Filter Catalog</h3>
          <p className="help-guide-desc">
            Browse Trending, Top Rated, and Regional cinema streams with instant details and trailers.
          </p>
        </button>

        <button
          type="button"
          className="help-guide-card"
          onClick={() => navigate('/settings')}
        >
          <div
            className="help-guide-icon"
            style={{ backgroundColor: 'rgba(52, 211, 153, 0.16)', color: '#34d399' }}
          >
            <Sliders size={20} />
          </div>
          <h3 className="help-guide-title">Playback & Preferences</h3>
          <p className="help-guide-desc">
            Customize artwork resolution, trailer auto-play, default audio, cinema focus, and mature filters.
          </p>
        </button>
      </section>

      {/* 3. Interactive FAQs */}
      <section className="help-faq-section">
        <div className="help-section-header">
          <h2 className="help-section-title">Frequently Asked Questions</h2>
          <div className="help-category-pills">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`help-category-pill ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.025)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'rgba(255, 255, 255, 0.55)',
            }}
          >
            No matching questions found for "{searchQuery}". Try clearing your search or email us directly below.
          </div>
        ) : (
          <div className="help-faq-list">
            {filteredFaqs.map((item) => {
              const isOpen = openFaqIds.includes(item.id);
              return (
                <div key={item.id} className={`help-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="help-faq-trigger"
                    onClick={() => toggleFaq(item.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="help-faq-trigger-meta">
                      <span className="help-faq-tag">{item.category}</span>
                      <span>{item.question}</span>
                    </div>
                    <ChevronDown size={18} className="help-faq-chevron" />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="help-faq-answer">{item.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Direct Support Card */}
      <section className="help-support-card">
        <div className="help-support-info">
          <div className="help-support-icon">
            <Mail size={22} />
          </div>
          <div>
            <h3 className="help-support-title">Still need help? Contact Support</h3>
            <p className="help-support-desc">
              Have a bug report, feature suggestion, or account issue? Reach out anytime and we’ll get back to you promptly.
            </p>
            <div className="help-support-email-text">{SUPPORT_EMAIL}</div>
          </div>
        </div>

        <div className="help-support-actions">
          <button
            type="button"
            onClick={handleCopyEmail}
            className="help-btn-secondary"
          >
            {copiedEmail ? <Check size={15} color="#4ade80" /> : <Copy size={15} />}
            <span>{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
          </button>

          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('CineMatch Support Request')}`}
            className="help-btn-primary"
          >
            <Mail size={15} />
            <span>Email Support</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
