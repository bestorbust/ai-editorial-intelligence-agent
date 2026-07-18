import os
"""
Trend Discovery Configuration
"""

# ==========================================================
# RSS
# ==========================================================

RSS_CONFIG = {
    "enabled": True,
}
RSS_FEEDS = {

    # ---------------- AI ---------------- #

    "OpenAI": {
        "url": "https://openai.com/news/rss.xml",
        "limit": 8,
        "priority": 10,
    },

    "Anthropic": {
        "url": "https://www.anthropic.com/news/rss.xml",
        "limit": 8,
        "priority": 10,
    },

    "Google AI": {
        "url": "https://blog.google/technology/ai/rss/",
        "limit": 8,
        "priority": 10,
    },

    "Microsoft AI": {
        "url": "https://blogs.microsoft.com/ai/feed/",
        "limit": 8,
        "priority": 9,
    },

    "NVIDIA": {
        "url": "https://blogs.nvidia.com/feed/",
        "limit": 8,
        "priority": 9,
    },

    "Meta Engineering": {
        "url": "https://engineering.fb.com/feed/",
        "limit": 8,
        "priority": 9,
    },

    "Hugging Face": {
        "url": "https://huggingface.co/blog/feed.xml",
        "limit": 8,
        "priority": 10,
    },

    # ---------------- Technology ---------------- #

    "TechCrunch": {
        "url": "https://techcrunch.com/feed/",
        "limit": 8,
        "priority": 9,
    },

    "The Verge": {
        "url": "https://www.theverge.com/rss/index.xml",
        "limit": 8,
        "priority": 8,
    },

    "Ars Technica": {
        "url": "https://feeds.arstechnica.com/arstechnica/index",
        "limit": 8,
        "priority": 8,
    },

    "VentureBeat": {
        "url": "https://venturebeat.com/feed/",
        "limit": 8,
        "priority": 8,
    },

    "Wired": {
        "url": "https://www.wired.com/feed/rss",
        "limit": 8,
        "priority": 8,
    },

    # ---------------- Science ---------------- #

    "NASA": {
        "url": "https://www.nasa.gov/rss/dyn/breaking_news.rss",
        "limit": 5,
        "priority": 7,
    },

    "ESA": {
        "url": "https://www.esa.int/rssfeed/Our_Activities",
        "limit": 5,
        "priority": 7,
    },

    # ---------------- Developer ---------------- #

    "GitHub Blog": {
        "url": "https://github.blog/feed/",
        "limit": 6,
        "priority": 8,
    },

    "Docker": {
        "url": "https://www.docker.com/blog/feed/",
        "limit": 6,
        "priority": 8,
    },

    "Cloudflare": {
        "url": "https://blog.cloudflare.com/rss/",
        "limit": 6,
        "priority": 8,
    },

    "JetBrains": {
        "url": "https://blog.jetbrains.com/feed/",
        "limit": 6,
        "priority": 8,
    },
}
# ==========================================================
# GOOGLE NEWS
# ==========================================================
# ==========================================================
# GNEWS
# ==========================================================

GNEWS_CONFIG = {
    "enabled": True,
    "base_url": "https://gnews.io/api/v4/top-headlines",
    "api_key": os.getenv("GNEWS_API_KEY"),
    "country": "in",
    "language": "en",
    "category": "general",
    "max_results": 100,
    "timeout": 10,
}
GOOGLE_NEWS_CONFIG = {

    "queries": [

        "Technology",

        "Artificial Intelligence",

        "Machine Learning",

        "Programming",

        "Software",

        "Cyber Security",

        "Cloud Computing",

        "Startups",

        "Business",

        "Finance",

        "Health",

        "Science",

        "Space",

        "Robotics",

        "OpenAI",

        "Microsoft",

        "Google",

        "Apple",

        "Amazon",

        "Meta",

        "Tesla",

        "Python",

        "JavaScript",

        "React",

        "Data Science"

    ],

    "limit": 8,

    "language": "en",

    "country": "IN",
}
# ==========================================================
# HACKER NEWS
# ==========================================================
HACKERNEWS_CONFIG = {

    "enabled": True,

    "limit": 20,

    "story_types": [

        "top",

        "best",

        "show"

    ],

    "max_workers": 10,

    "timeout": 5,

}
# ==========================================================
# GITHUB
# ==========================================================

GITHUB_CONFIG = {

    "enabled": True,

    "limit": 20,

    "sort": "stars",

    "query": "stars:>100 pushed:>2025-01-01",

    "include_topics": True,

}
# ==========================================================
# YOUTUBE
# ==========================================================

YOUTUBE_CONFIG = {
    "enabled": True,
    "limit": 20,
}

YOUTUBE_CHANNELS = {

    "Fireship": {
        "channel_id": "UCsBjURrPoezykLs9EqgamOA",
        "limit": 4,
    },

    "Two Minute Papers": {
        "channel_id": "UCbfYPyITQ-7l4upoX8nvctg",
        "limit": 4,
    },

    "freeCodeCamp": {
        "channel_id": "UC8butISFwT-Wl7EV0hUK0BQ",
        "limit": 4,
    },

    "Google Developers": {
        "channel_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
        "limit": 4,
    },

    "Traversy Media": {
        "channel_id": "UC29ju8bIPH5as8OGnQzwJyA",
        "limit": 4,
    },

    "Web Dev Simplified": {
        "channel_id": "UCFbNIlppjAuEX4znoulh0Cw",
        "limit": 4,
    },

    "ThePrimeagen": {
        "channel_id": "UC8ENHE5xdFSwx71u3fDH5Xw",
        "limit": 4,
    },

    "Computerphile": {
        "channel_id": "UC9-y-6csu5WGm29I7JiwpnA",
        "limit": 4,
    },

    "Hussein Nasser": {
        "channel_id": "UC_ML5xP23TOWKUcc-oAE_Eg",
        "limit": 4,
    },
}

