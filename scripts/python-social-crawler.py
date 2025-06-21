#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🐍 Python社交媒体内容获取引擎
集成多个成熟库，为Labubu垂直社区提供数据支持
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import requests
from dataclasses import dataclass, asdict
import sqlite3
import hashlib

# 依赖库 (需要安装)
try:
    import newspaper
    from newspaper import Article, build
    print("✅ newspaper4k 已安装")
except ImportError:
    print("❌ 请安装: pip install newspaper4k")

try:
    import feedparser
    print("✅ feedparser 已安装")
except ImportError:
    print("❌ 请安装: pip install feedparser")

try:
    import tweepy
    print("✅ tweepy 已安装")
except ImportError:
    print("❌ 请安装: pip install tweepy")

try:
    from twscrape import API as TwScrapeAPI
    print("✅ twscrape 已安装")
except ImportError:
    print("❌ 请安装: pip install git+https://github.com/vladkens/twscrape.git")

try:
    import praw  # Reddit API
    print("✅ praw 已安装")
except ImportError:
    print("❌ 请安装: pip install praw")

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('python_crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class SocialContent:
    """社交媒体内容数据类"""
    id: str
    title: str
    content: str
    summary: str
    author: str
    platform: str
    url: str
    published_at: datetime
    language: str
    country: str
    image_urls: List[str]
    tags: List[str]
    category: str
    engagement: Dict[str, int]  # likes, shares, comments, views
    raw_data: Dict[str, Any]

class PythonSocialCrawler:
    """Python社交媒体内容爬虫引擎"""
    
    def __init__(self, config_path: str = None):
        self.config = self._load_config(config_path)
        self.db_path = 'social_crawler.db'
        self._init_database()
        
        # Labubu相关关键词
        self.labubu_keywords = [
            'labubu', 'lаbubu', '拉布布', '泡泡玛特', 'popmart', 'pop mart',
            'lisa', 'blackpink', '盲盒', 'blind box', '手办', 'figure',
            'collectible', 'designer toy', '收藏', '限量', 'limited edition',
            'kaws', 'molly', 'dimoo', 'skullpanda', 'hirono'
        ]
    
    def _load_config(self, config_path: str) -> Dict:
        """加载配置文件"""
        default_config = {
            "twitter": {
                "bearer_token": os.getenv('TWITTER_BEARER_TOKEN'),
                "consumer_key": os.getenv('TWITTER_CONSUMER_KEY'),
                "consumer_secret": os.getenv('TWITTER_CONSUMER_SECRET'),
                "access_token": os.getenv('TWITTER_ACCESS_TOKEN'),
                "access_token_secret": os.getenv('TWITTER_ACCESS_TOKEN_SECRET'),
            },
            "reddit": {
                "client_id": os.getenv('REDDIT_CLIENT_ID'),
                "client_secret": os.getenv('REDDIT_CLIENT_SECRET'),
                "user_agent": "LabubuCrawler/1.0"
            },
            "news_sources": [
                "https://hypebeast.com/feed",
                "https://www.toynews-online.biz/feed/",
                "https://www.popculthq.com/feed/",
                "https://www.kidscreen.com/feed/"
            ]
        }
        
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                user_config = json.load(f)
                default_config.update(user_config)
        
        return default_config
    
    def _init_database(self):
        """初始化SQLite数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS social_content (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT,
                summary TEXT,
                author TEXT,
                platform TEXT NOT NULL,
                url TEXT UNIQUE,
                published_at TIMESTAMP,
                language TEXT,
                country TEXT,
                image_urls TEXT,  -- JSON array
                tags TEXT,        -- JSON array
                category TEXT,
                engagement TEXT,  -- JSON object
                raw_data TEXT,    -- JSON object
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                hot_score REAL DEFAULT 0
            )
        ''')
        
        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_platform ON social_content(platform)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_published_at ON social_content(published_at)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_hot_score ON social_content(hot_score)')
        
        conn.commit()
        conn.close()
        logger.info("📊 数据库初始化完成")
    
    def _is_labubu_related(self, text: str) -> bool:
        """检查内容是否与Labubu相关"""
        text_lower = text.lower()
        return any(keyword.lower() in text_lower for keyword in self.labubu_keywords)
    
    def _calculate_hot_score(self, content: SocialContent) -> float:
        """计算内容热度分数"""
        base_score = 0
        
        # 互动数据权重
        engagement = content.engagement
        likes = engagement.get('likes', 0)
        shares = engagement.get('shares', 0)
        comments = engagement.get('comments', 0)
        views = engagement.get('views', 0)
        
        # 基础互动分数
        base_score += likes * 1.0
        base_score += shares * 2.0  # 分享权重更高
        base_score += comments * 1.5
        base_score += views * 0.01
        
        # 时间衰减 (越新越热)
        hours_old = (datetime.now() - content.published_at).total_seconds() / 3600
        time_factor = max(0.1, 1 - (hours_old / 168))  # 一周内线性衰减
        
        # 关键词匹配加分
        keyword_bonus = 1.0
        content_text = (content.title + ' ' + content.content).lower()
        high_value_keywords = ['lisa', 'blackpink', '限量', 'limited edition']
        if any(kw.lower() in content_text for kw in high_value_keywords):
            keyword_bonus = 1.5
        
        final_score = base_score * time_factor * keyword_bonus
        return round(final_score, 2)
    
    async def crawl_news_feeds(self) -> List[SocialContent]:
        """爬取新闻RSS源"""
        logger.info("📰 开始爬取新闻RSS源...")
        results = []
        
        for feed_url in self.config['news_sources']:
            try:
                logger.info(f"🔍 解析RSS: {feed_url}")
                feed = feedparser.parse(feed_url)
                
                for entry in feed.entries[:10]:  # 限制每个源10条
                    # 检查是否与Labubu相关
                    text_to_check = (entry.get('title', '') + ' ' + 
                                   entry.get('description', '') + ' ' + 
                                   entry.get('summary', ''))
                    
                    if not self._is_labubu_related(text_to_check):
                        continue
                    
                    # 使用newspaper4k提取完整文章
                    try:
                        article = Article(entry.link, language='en')
                        article.download()
                        article.parse()
                        article.nlp()
                        
                        content = SocialContent(
                            id=hashlib.md5(entry.link.encode()).hexdigest(),
                            title=entry.title,
                            content=article.text,
                            summary=article.summary,
                            author=', '.join(article.authors) if article.authors else 'Unknown',
                            platform='news_rss',
                            url=entry.link,
                            published_at=datetime(*entry.published_parsed[:6]) if hasattr(entry, 'published_parsed') else datetime.now(),
                            language='en',
                            country='US',
                            image_urls=[article.top_image] if article.top_image else [],
                            tags=article.keywords[:10],  # 限制10个关键词
                            category='News',
                            engagement={'likes': 0, 'shares': 0, 'comments': 0, 'views': 0},
                            raw_data=dict(entry)
                        )
                        
                        results.append(content)
                        logger.info(f"✅ 成功提取文章: {content.title[:50]}...")
                        
                    except Exception as e:
                        logger.warning(f"⚠️ 文章提取失败 {entry.link}: {e}")
                        continue
                        
                await asyncio.sleep(1)  # 避免请求过快
                
            except Exception as e:
                logger.error(f"❌ RSS源解析失败 {feed_url}: {e}")
                continue
        
        logger.info(f"📰 新闻RSS爬取完成，获得 {len(results)} 条相关内容")
        return results
    
    async def crawl_twitter_data(self) -> List[SocialContent]:
        """爬取Twitter数据"""
        logger.info("🐦 开始爬取Twitter数据...")
        results = []
        
        try:
            # 方法1: 使用官方API (如果有token)
            if self.config['twitter']['bearer_token']:
                auth = tweepy.Client(bearer_token=self.config['twitter']['bearer_token'])
                
                # 搜索相关推文
                query = ' OR '.join(self.labubu_keywords[:5])  # 限制查询长度
                tweets = auth.search_recent_tweets(
                    query=query,
                    max_results=50,
                    tweet_fields=['author_id', 'created_at', 'public_metrics', 'lang']
                )
                
                if tweets.data:
                    for tweet in tweets.data:
                        content = SocialContent(
                            id=f"twitter_{tweet.id}",
                            title=tweet.text[:100] + '...' if len(tweet.text) > 100 else tweet.text,
                            content=tweet.text,
                            summary=tweet.text[:200] + '...' if len(tweet.text) > 200 else tweet.text,
                            author=f"user_{tweet.author_id}",
                            platform='twitter',
                            url=f"https://twitter.com/user/status/{tweet.id}",
                            published_at=tweet.created_at,
                            language=tweet.lang,
                            country='Unknown',
                            image_urls=[],
                            tags=self._extract_hashtags(tweet.text),
                            category='Social',
                            engagement={
                                'likes': tweet.public_metrics['like_count'],
                                'shares': tweet.public_metrics['retweet_count'],
                                'comments': tweet.public_metrics['reply_count'],
                                'views': tweet.public_metrics.get('impression_count', 0)
                            },
                            raw_data={'tweet_id': tweet.id, 'author_id': tweet.author_id}
                        )
                        results.append(content)
            
            # 方法2: 使用twscrape (如果配置了账户)
            elif os.path.exists('twscrape_accounts.txt'):
                try:
                    api = TwScrapeAPI()
                    query = f"{' OR '.join(self.labubu_keywords[:3])} -is:retweet"
                    
                    async for tweet in api.search(query, limit=30):
                        content = SocialContent(
                            id=f"twitter_scrape_{tweet.id}",
                            title=tweet.rawContent[:100] + '...' if len(tweet.rawContent) > 100 else tweet.rawContent,
                            content=tweet.rawContent,
                            summary=tweet.rawContent[:200] + '...' if len(tweet.rawContent) > 200 else tweet.rawContent,
                            author=tweet.user.username,
                            platform='twitter_scrape',
                            url=tweet.url,
                            published_at=tweet.date,
                            language=tweet.lang,
                            country='Unknown',
                            image_urls=[],
                            tags=self._extract_hashtags(tweet.rawContent),
                            category='Social',
                            engagement={
                                'likes': tweet.likeCount,
                                'shares': tweet.retweetCount,
                                'comments': tweet.replyCount,
                                'views': tweet.viewCount if hasattr(tweet, 'viewCount') else 0
                            },
                            raw_data={'tweet_id': tweet.id, 'user_id': tweet.user.id}
                        )
                        results.append(content)
                except Exception as e:
                    logger.warning(f"⚠️ twscrape获取失败: {e}")
            
        except Exception as e:
            logger.error(f"❌ Twitter数据获取失败: {e}")
        
        logger.info(f"🐦 Twitter爬取完成，获得 {len(results)} 条内容")
        return results
    
    def _extract_hashtags(self, text: str) -> List[str]:
        """提取hashtags"""
        import re
        hashtags = re.findall(r'#(\w+)', text)
        return hashtags[:10]  # 限制10个
    
    async def crawl_reddit_data(self) -> List[SocialContent]:
        """爬取Reddit数据"""
        logger.info("🤖 开始爬取Reddit数据...")
        results = []
        
        try:
            if not all([self.config['reddit']['client_id'], 
                       self.config['reddit']['client_secret']]):
                logger.warning("⚠️ Reddit配置不完整，跳过")
                return results
                
            reddit = praw.Reddit(
                client_id=self.config['reddit']['client_id'],
                client_secret=self.config['reddit']['client_secret'],
                user_agent=self.config['reddit']['user_agent']
            )
            
            # 搜索相关subreddits和帖子
            subreddits = ['popmart', 'blindbox', 'designertoys', 'kpop', 'blackpink']
            
            for sub_name in subreddits:
                try:
                    subreddit = reddit.subreddit(sub_name)
                    
                    # 获取热门帖子
                    for submission in subreddit.hot(limit=10):
                        if not self._is_labubu_related(submission.title + ' ' + submission.selftext):
                            continue
                        
                        content = SocialContent(
                            id=f"reddit_{submission.id}",
                            title=submission.title,
                            content=submission.selftext,
                            summary=submission.title,
                            author=str(submission.author) if submission.author else 'Unknown',
                            platform='reddit',
                            url=f"https://reddit.com{submission.permalink}",
                            published_at=datetime.fromtimestamp(submission.created_utc),
                            language='en',
                            country='Global',
                            image_urls=[submission.url] if submission.url.endswith(('.jpg', '.png', '.gif')) else [],
                            tags=[sub_name],
                            category='Discussion',
                            engagement={
                                'likes': submission.score,
                                'shares': 0,
                                'comments': submission.num_comments,
                                'views': 0
                            },
                            raw_data={'subreddit': sub_name, 'submission_id': submission.id}
                        )
                        results.append(content)
                        
                except Exception as e:
                    logger.warning(f"⚠️ Subreddit {sub_name} 获取失败: {e}")
                    continue
                    
                await asyncio.sleep(2)  # Reddit有严格的速率限制
                
        except Exception as e:
            logger.error(f"❌ Reddit数据获取失败: {e}")
        
        logger.info(f"🤖 Reddit爬取完成，获得 {len(results)} 条内容")
        return results
    
    def save_to_database(self, contents: List[SocialContent]):
        """保存内容到数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        saved_count = 0
        for content in contents:
            try:
                # 计算热度分数
                hot_score = self._calculate_hot_score(content)
                
                cursor.execute('''
                    INSERT OR REPLACE INTO social_content 
                    (id, title, content, summary, author, platform, url, published_at, 
                     language, country, image_urls, tags, category, engagement, 
                     raw_data, hot_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    content.id,
                    content.title,
                    content.content,
                    content.summary,
                    content.author,
                    content.platform,
                    content.url,
                    content.published_at,
                    content.language,
                    content.country,
                    json.dumps(content.image_urls),
                    json.dumps(content.tags),
                    content.category,
                    json.dumps(content.engagement),
                    json.dumps(content.raw_data),
                    hot_score
                ))
                saved_count += 1
                
            except Exception as e:
                logger.error(f"❌ 保存内容失败 {content.id}: {e}")
                continue
        
        conn.commit()
        conn.close()
        logger.info(f"💾 成功保存 {saved_count}/{len(contents)} 条内容到数据库")
    
    def export_to_json(self, output_file: str = None) -> str:
        """导出数据为JSON格式，与现有Next.js项目集成"""
        if not output_file:
            output_file = f"labubu_social_data_{int(time.time())}.json"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 获取最新的热门内容
        cursor.execute('''
            SELECT * FROM social_content 
            ORDER BY hot_score DESC, published_at DESC 
            LIMIT 100
        ''')
        
        rows = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        
        # 转换为与Next.js项目兼容的格式
        export_data = {
            "metadata": {
                "export_time": datetime.now().isoformat(),
                "total_count": len(rows),
                "source": "python_social_crawler",
                "version": "1.0"
            },
            "articles": []
        }
        
        for row in rows:
            row_dict = dict(zip(columns, row))
            
            # 转换为Next.js项目期望的格式
            article = {
                "id": row_dict['id'],
                "title": row_dict['title'],
                "content": row_dict['content'],
                "summary": row_dict['summary'],
                "author": row_dict['author'],
                "sourceId": row_dict['platform'],
                "originalUrl": row_dict['url'],
                "publishedAt": row_dict['published_at'],
                "imageUrls": json.loads(row_dict['image_urls'] or '[]'),
                "tags": json.loads(row_dict['tags'] or '[]'),
                "category": row_dict['category'],
                "language": row_dict['language'],
                "country": row_dict['country'],
                "platform": row_dict['platform'],
                "engagementData": json.loads(row_dict['engagement'] or '{}'),
                "hotScore": row_dict['hot_score'],
                "createdAt": row_dict['created_at']
            }
            export_data["articles"].append(article)
        
        conn.close()
        
        # 保存JSON文件
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)
        
        logger.info(f"📄 数据导出完成: {output_file}")
        return output_file
    
    async def run_full_crawl(self) -> Dict[str, Any]:
        """执行完整的爬取任务"""
        logger.info("🚀 开始完整的社交媒体内容爬取...")
        start_time = time.time()
        
        all_contents = []
        stats = {
            "news_count": 0,
            "twitter_count": 0,
            "reddit_count": 0,
            "total_count": 0,
            "duration_seconds": 0
        }
        
        try:
            # 并发执行多个爬取任务
            tasks = [
                self.crawl_news_feeds(),
                self.crawl_twitter_data(),
                self.crawl_reddit_data()
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 处理结果
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"❌ 任务 {i} 执行失败: {result}")
                    continue
                
                if i == 0:  # news
                    stats["news_count"] = len(result)
                elif i == 1:  # twitter
                    stats["twitter_count"] = len(result)
                elif i == 2:  # reddit
                    stats["reddit_count"] = len(result)
                
                all_contents.extend(result)
            
            # 保存到数据库
            if all_contents:
                self.save_to_database(all_contents)
                
                # 导出JSON供Next.js使用
                json_file = self.export_to_json()
                
                stats["total_count"] = len(all_contents)
                stats["duration_seconds"] = round(time.time() - start_time, 2)
                stats["json_export"] = json_file
                
                logger.info(f"🎉 爬取完成! 总计 {stats['total_count']} 条内容，耗时 {stats['duration_seconds']} 秒")
            else:
                logger.warning("⚠️ 未获取到任何内容")
                
        except Exception as e:
            logger.error(f"❌ 爬取任务执行失败: {e}")
            raise
        
        return stats

async def main():
    """主函数"""
    print("🚀 Python社交媒体内容爬虫启动...")
    
    crawler = PythonSocialCrawler()
    
    try:
        # 执行完整爬取
        stats = await crawler.run_full_crawl()
        
        print("\n📊 爬取统计:")
        print(f"  📰 新闻内容: {stats['news_count']} 条")
        print(f"  🐦 Twitter: {stats['twitter_count']} 条")
        print(f"  🤖 Reddit: {stats['reddit_count']} 条")
        print(f"  📄 JSON导出: {stats.get('json_export', 'N/A')}")
        print(f"  ⏱️ 总耗时: {stats['duration_seconds']} 秒")
        print(f"  🎯 总计: {stats['total_count']} 条Labubu相关内容")
        
    except Exception as e:
        logger.error(f"❌ 程序执行失败: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    # 运行爬虫
    exit_code = asyncio.run(main())
    exit(exit_code) 