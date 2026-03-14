"""
services/research_blog.py
=========================
Quantus Engine automated content marketing layer.
Authors end-of-week Macro Wrap-Ups and SEO-optimized sector deep dives.
"""
import os
import json
import uuid
import logging
from datetime import datetime, timezone, timedelta

try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_DB = True
except ImportError:
    HAS_DB = False

logger = logging.getLogger(__name__)

# Fallback in-memory store if postgres isn't running
_MOCK_BLOG_STORE = []

class ResearchBlogService:
    def __init__(self):
        self.db_url = os.environ.get("DATABASE_URL")
        self.conn = None
        self._initialize_db()

    def _initialize_db(self):
        if self.db_url and HAS_DB:
            try:
                self.conn = psycopg2.connect(self.db_url, cursor_factory=RealDictCursor)
                self._create_tables()
            except Exception as e:
                logger.warning(f"Failed to connect to PG for Research Blog: {e}")
                self.conn = None
        else:
            self._seed_mock_data()

    def _create_tables(self):
        if not self.conn:
            return
        with self.conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS blog_posts (
                    id UUID PRIMARY KEY,
                    slug VARCHAR(255) UNIQUE NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    content_md TEXT NOT NULL,
                    tags JSONB,
                    author VARCHAR(100) DEFAULT 'Meridian v2.4 (AI)',
                    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            self.conn.commit()
            
            # Seed if empty
            cur.execute("SELECT COUNT(*) as count FROM blog_posts")
            res = cur.fetchone()
            if res and res['count'] == 0:
                logger.info("Database empty: Seeding initial Research Blog Posts...")
                self._seed_pg_data()

    def _seed_mock_data(self):
        # Prevent double seeding in mock store
        if not _MOCK_BLOG_STORE:
            _MOCK_BLOG_STORE.extend(self._get_initial_seeds())

    def _seed_pg_data(self):
        seeds = self._get_initial_seeds()
        with self.conn.cursor() as cur:
            for seed in seeds:
                cur.execute("""
                    INSERT INTO blog_posts (id, slug, title, content_md, tags, author, published_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()), seed['slug'], seed['title'], seed['content_md'], 
                    json.dumps(seed['tags']), seed['author'], seed['published_at']
                ))
            self.conn.commit()

    def _get_initial_seeds(self):
        now = datetime.now(timezone.utc)
        return [
            {
                "slug": "q1-2026-macro-regime-shift",
                "title": "Q1 2026: Navigating the High-Volatility Mean-Reverting Regime",
                "content_md": "## The Shift from Trend to Chop\n\nOver the past 14 trading days, the Quantus ensemble models have detected a decisive shift out of the prolonged *Trend-Following* regime into a *Mean-Reverting (High Volatility)* state. Historical tracking indicates that momentum factors degrade rapidly in this environment, while RSI divergence paired with Bollinger Band mean reversion significantly outperforms.\n\n### Sector Positioning\nIn this regime, Technology (XLK) models are flashing elevated risk (VaR +15% WoW). Conversely, Defensive sectors like Utilities and Healthcare show expanding margins of safety.\n\n*Generated automatically by Meridian v2.4 analysis of 8,500 active endpoints.*",
                "tags": ["Macro", "Regime Detection", "Q1 2026"],
                "author": "Meridian v2.4 (AI)",
                "published_at": (now - timedelta(days=7)).isoformat()
            },
            {
                "slug": "ai-semiconductors-language-delta",
                "title": "SEC NLP Insights: The Semantic Cooling of Semiconductor Guidance",
                "content_md": "## FinBERT Identifies Hedging in 10-Q Sandbagging\n\nOur nightly SEC Edgar ingest engine ran Delta Analysis across 42 recent semiconductor filings. While underlying revenue numbers remain robust, management *tone*—specifically forward-guidance verbosity—has cooled.\n\n### The Delta\nThe average `sec_language_delta` for the SMH ETF constituents sits at **-0.24** (out of -1.0 to +1.0). This indicates that while executives are hitting targets, they are deploying significantly more 'defensive' terms (e.g., 'supply chain headwinds', 'macroeconomic uncertainty') than in Q4.\n\nExpect short-term multiple compression.",
                "tags": ["Equities", "NLP", "Semiconductors"],
                "author": "Meridian v2.4 (AI)",
                "published_at": (now - timedelta(days=3)).isoformat()
            }
        ]

    def get_all_posts(self):
        """Used by GET /api/v1/blog"""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("SELECT id, slug, title, tags, author, published_at FROM blog_posts ORDER BY published_at DESC")
                return [dict(row) for row in cur.fetchall()]
        else:
            # Strip content for the list view
            return [{k: v for k, v in p.items() if k != 'content_md'} for p in _MOCK_BLOG_STORE]

    def get_post_by_slug(self, slug: str):
        """Used by GET /api/v1/blog/:slug"""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("SELECT * FROM blog_posts WHERE slug = %s", (slug,))
                row = cur.fetchone()
                return dict(row) if row else None
        else:
            return next((p for p in _MOCK_BLOG_STORE if p['slug'] == slug), None)

    def generate_weekly_wrapup(self):
        """
        Friday 5PM Trigger hook. 
        Prompts the local LLM cluster (or Gemini API) with the week's aggregate stats 
        and authors a new SEO blog post.
        """
        logger.info("=== Executing Automated Weekly Macro Wrap-up ===")
        # 1. Fetch top 5 winners, bottom 5 losers from Accuracy Tracker
        # 2. Fetch dominant regime from Knowledge Graph
        # 3. Compile prompt: "You are the Chief AI Strategist for Quantus..."
        # 4. Generate Markdown
        
        # Mock Completion:
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        slug = f"weekly-wrapup-{today_str}"
        
        new_post = {
            "slug": slug,
            "title": f"Quantus Weekly Intelligence Wrap-up: {today_str}",
            "content_md": "## A Week in Review\n\nMeridian generated 14,000 signals this week. Growth factors underperformed Value. This post was auto-generated by the Friday 5PM cron hook.",
            "tags": ["Weekly Wrap-up", "Market Recap"],
            "author": "Meridian v2.4 (AI)",
            "published_at": datetime.now(timezone.utc).isoformat()
        }
        
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO blog_posts (id, slug, title, content_md, tags, author, published_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    str(uuid.uuid4()), new_post['slug'], new_post['title'], new_post['content_md'], 
                    json.dumps(new_post['tags']), new_post['author'], new_post['published_at']
                ))
            self.conn.commit()
        else:
            _MOCK_BLOG_STORE.insert(0, new_post)
            
        logger.info(f"Published automated post: {new_post['title']} -> /blog/{new_post['slug']}")
        return new_post

blog_service = ResearchBlogService()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Testing Research Blog Engine")
    blog_service.generate_weekly_wrapup()
    
    posts = blog_service.get_all_posts()
    logger.info(f"Blog endpoints initialized with {len(posts)} active posts.")
