#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微博 Labubu 数据获取脚本
基于微博开放平台API，获取Labubu相关微博数据
"""

import requests
import json
import time
import asyncio
import aiohttp
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging
import os
from urllib.parse import quote

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('weibo_scraper.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class WeiboLabubuScraper:
    """微博Labubu数据获取器"""
    
    def __init__(self, access_token: str, app_key: str = None):
        """
        初始化微博API客户端
        
        Args:
            access_token: 微博API访问令牌
            app_key: 应用Key（可选）
        """
        self.access_token = access_token
        self.app_key = app_key
        self.base_url = "https://api.weibo.com/2"
        self.session = requests.Session()
        
        # Labubu相关关键词
        self.labubu_keywords = [
            "Labubu", "拉布布", "泡泡玛特", "盲盒",
            "POPMART", "labubu", "毛绒玩具",
            "拉布布收藏", "Labubu开箱"
        ]
        
        # 请求头设置
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        })
    
    def search_weibo_posts(self, keyword: str, count: int = 50, page: int = 1) -> Dict[str, Any]:
        """
        搜索微博内容
        
        Args:
            keyword: 搜索关键词
            count: 返回数量 (最大50)
            page: 页码
            
        Returns:
            搜索结果字典
        """
        url = f"{self.base_url}/search/statuses.json"
        params = {
            'access_token': self.access_token,
            'q': keyword,
            'count': min(count, 50),  # API限制最大50
            'page': page,
            'result_type': 1  # 1:实时, 0:热门
        }
        
        try:
            logger.info(f"搜索微博: 关键词={keyword}, 数量={count}, 页码={page}")
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if 'error' in data:
                logger.error(f"API错误: {data['error']}")
                return {}
                
            return data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"请求失败: {e}")
            return {}
        except json.JSONDecodeError as e:
            logger.error(f"JSON解析失败: {e}")
            return {}
    
    def get_user_info(self, uid: str) -> Dict[str, Any]:
        """
        获取用户信息
        
        Args:
            uid: 用户ID
            
        Returns:
            用户信息字典
        """
        url = f"{self.base_url}/users/show.json"
        params = {
            'access_token': self.access_token,
            'uid': uid
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"获取用户信息失败: {e}")
            return {}
    
    def get_weibo_comments(self, weibo_id: str, count: int = 50, page: int = 1) -> Dict[str, Any]:
        """
        获取微博评论
        
        Args:
            weibo_id: 微博ID
            count: 评论数量
            page: 页码
            
        Returns:
            评论数据字典
        """
        url = f"{self.base_url}/comments/show.json"
        params = {
            'access_token': self.access_token,
            'id': weibo_id,
            'count': min(count, 200),  # API限制最大200
            'page': page
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"获取评论失败: {e}")
            return {}
    
    def get_trending_topics(self) -> Dict[str, Any]:
        """
        获取热门话题
        
        Returns:
            热门话题数据
        """
        url = f"{self.base_url}/trends/hourly.json"
        params = {
            'access_token': self.access_token,
            'base_app': 0
        }
        
        try:
            response = self.session.get(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"获取热门话题失败: {e}")
            return {}
    
    def process_weibo_data(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        处理微博原始数据，提取有用信息
        
        Args:
            raw_data: API返回的原始数据
            
        Returns:
            处理后的微博数据列表
        """
        processed_posts = []
        
        if 'statuses' not in raw_data:
            return processed_posts
        
        for post in raw_data['statuses']:
            try:
                # 基本信息提取
                processed_post = {
                    'id': post.get('id'),
                    'idstr': post.get('idstr'),
                    'created_at': post.get('created_at'),
                    'text': post.get('text', ''),
                    'source': post.get('source', ''),
                    
                    # 互动数据
                    'reposts_count': post.get('reposts_count', 0),
                    'comments_count': post.get('comments_count', 0),
                    'attitudes_count': post.get('attitudes_count', 0),
                    
                    # 用户信息
                    'user_id': post['user']['id'] if post.get('user') else None,
                    'user_name': post['user']['screen_name'] if post.get('user') else None,
                    'user_followers': post['user']['followers_count'] if post.get('user') else 0,
                    'user_verified': post['user']['verified'] if post.get('user') else False,
                    
                    # 媒体信息
                    'pic_urls': [],
                    'video_url': None,
                    
                    # Labubu相关度评分
                    'labubu_relevance_score': 0,
                    'labubu_keywords_found': [],
                    
                    # 处理时间
                    'processed_at': datetime.now().isoformat()
                }
                
                # 提取图片URL
                if post.get('pic_urls'):
                    processed_post['pic_urls'] = [pic['thumbnail_pic'] for pic in post['pic_urls']]
                
                # 计算Labubu相关度
                text_lower = processed_post['text'].lower()
                relevance_score = 0
                keywords_found = []
                
                for keyword in self.labubu_keywords:
                    if keyword.lower() in text_lower:
                        relevance_score += 1
                        keywords_found.append(keyword)
                
                processed_post['labubu_relevance_score'] = relevance_score
                processed_post['labubu_keywords_found'] = keywords_found
                
                # 只保留相关度 > 0 的微博
                if relevance_score > 0:
                    processed_posts.append(processed_post)
                    
            except Exception as e:
                logger.error(f"处理微博数据失败: {e}")
                continue
        
        return processed_posts
    
    def calculate_engagement_rate(self, post: Dict[str, Any]) -> float:
        """
        计算微博互动率
        
        Args:
            post: 微博数据
            
        Returns:
            互动率百分比
        """
        followers = post.get('user_followers', 1)  # 避免除零
        total_engagement = (
            post.get('reposts_count', 0) + 
            post.get('comments_count', 0) + 
            post.get('attitudes_count', 0)
        )
        
        if followers == 0:
            return 0.0
        
        return (total_engagement / followers) * 100
    
    async def batch_search_labubu(self, max_pages: int = 5) -> List[Dict[str, Any]]:
        """
        批量搜索Labubu相关内容
        
        Args:
            max_pages: 最大搜索页数
            
        Returns:
            所有搜索结果的合并列表
        """
        all_posts = []
        
        for keyword in self.labubu_keywords:
            logger.info(f"开始搜索关键词: {keyword}")
            
            for page in range(1, max_pages + 1):
                # API限制：避免请求过快
                if page > 1:
                    await asyncio.sleep(2)
                
                raw_data = self.search_weibo_posts(keyword, count=50, page=page)
                if not raw_data:
                    break
                
                processed_posts = self.process_weibo_data(raw_data)
                all_posts.extend(processed_posts)
                
                logger.info(f"关键词 {keyword} 第 {page} 页: 获取 {len(processed_posts)} 条相关微博")
                
                # 如果返回数据少于50条，说明已经到最后一页
                if len(raw_data.get('statuses', [])) < 50:
                    break
        
        # 去重（基于微博ID）
        unique_posts = {}
        for post in all_posts:
            post_id = post.get('idstr')
            if post_id and post_id not in unique_posts:
                unique_posts[post_id] = post
        
        final_posts = list(unique_posts.values())
        
        # 计算互动率
        for post in final_posts:
            post['engagement_rate'] = self.calculate_engagement_rate(post)
        
        # 按相关度和互动率排序
        final_posts.sort(
            key=lambda x: (x['labubu_relevance_score'], x['engagement_rate']), 
            reverse=True
        )
        
        logger.info(f"批量搜索完成: 总共获取 {len(final_posts)} 条去重后的相关微博")
        return final_posts
    
    def save_to_json(self, data: List[Dict[str, Any]], filename: str) -> None:
        """
        保存数据到JSON文件
        
        Args:
            data: 要保存的数据
            filename: 文件名
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
            logger.info(f"数据已保存到: {filename}")
        except Exception as e:
            logger.error(f"保存JSON文件失败: {e}")
    
    def save_to_csv(self, data: List[Dict[str, Any]], filename: str) -> None:
        """
        保存数据到CSV文件
        
        Args:
            data: 要保存的数据
            filename: 文件名
        """
        try:
            if not data:
                logger.warning("没有数据可保存")
                return
            
            df = pd.DataFrame(data)
            df.to_csv(filename, index=False, encoding='utf-8-sig')
            logger.info(f"数据已保存到: {filename}")
        except Exception as e:
            logger.error(f"保存CSV文件失败: {e}")
    
    def generate_report(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        生成数据分析报告
        
        Args:
            data: 微博数据列表
            
        Returns:
            分析报告字典
        """
        if not data:
            return {"error": "没有数据可分析"}
        
        # 基础统计
        total_posts = len(data)
        total_reposts = sum(post.get('reposts_count', 0) for post in data)
        total_comments = sum(post.get('comments_count', 0) for post in data)
        total_likes = sum(post.get('attitudes_count', 0) for post in data)
        
        # 热门关键词统计
        keyword_count = {}
        for post in data:
            for keyword in post.get('labubu_keywords_found', []):
                keyword_count[keyword] = keyword_count.get(keyword, 0) + 1
        
        # 用户分析
        user_stats = {}
        for post in data:
            user_id = post.get('user_id')
            if user_id:
                if user_id not in user_stats:
                    user_stats[user_id] = {
                        'name': post.get('user_name'),
                        'posts_count': 0,
                        'total_engagement': 0,
                        'followers': post.get('user_followers', 0),
                        'verified': post.get('user_verified', False)
                    }
                user_stats[user_id]['posts_count'] += 1
                user_stats[user_id]['total_engagement'] += (
                    post.get('reposts_count', 0) + 
                    post.get('comments_count', 0) + 
                    post.get('attitudes_count', 0)
                )
        
        # 按互动数排序的热门用户
        top_users = sorted(
            user_stats.items(), 
            key=lambda x: x[1]['total_engagement'], 
            reverse=True
        )[:10]
        
        # 时间分析
        time_stats = {}
        for post in data:
            created_at = post.get('created_at', '')
            if created_at:
                try:
                    # 微博时间格式: "Thu Jan 01 00:00:00 +0800 2024"
                    dt = datetime.strptime(created_at, "%a %b %d %H:%M:%S %z %Y")
                    hour = dt.hour
                    time_stats[hour] = time_stats.get(hour, 0) + 1
                except:
                    continue
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_posts': total_posts,
                'total_reposts': total_reposts,
                'total_comments': total_comments,
                'total_likes': total_likes,
                'average_engagement_per_post': round((total_reposts + total_comments + total_likes) / total_posts, 2)
            },
            'keyword_analysis': dict(sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)),
            'top_users': [
                {
                    'user_id': user_id,
                    'name': user_data['name'],
                    'posts_count': user_data['posts_count'],
                    'total_engagement': user_data['total_engagement'],
                    'followers': user_data['followers'],
                    'verified': user_data['verified']
                }
                for user_id, user_data in top_users
            ],
            'hourly_distribution': dict(sorted(time_stats.items())),
            'engagement_stats': {
                'high_engagement_posts': len([p for p in data if p.get('engagement_rate', 0) > 1.0]),
                'medium_engagement_posts': len([p for p in data if 0.1 <= p.get('engagement_rate', 0) <= 1.0]),
                'low_engagement_posts': len([p for p in data if p.get('engagement_rate', 0) < 0.1])
            }
        }
        
        return report

# 使用示例
async def main():
    """主函数示例"""
    
    # 配置你的微博API令牌
    ACCESS_TOKEN = os.getenv('WEIBO_ACCESS_TOKEN', 'your_access_token_here')
    
    if ACCESS_TOKEN == 'your_access_token_here':
        logger.error("请设置你的微博API访问令牌！")
        logger.info("设置方法：export WEIBO_ACCESS_TOKEN='your_actual_token'")
        return
    
    # 创建爬虫实例
    scraper = WeiboLabubuScraper(ACCESS_TOKEN)
    
    # 批量搜索Labubu相关内容
    logger.info("开始批量搜索Labubu相关微博...")
    labubu_posts = await scraper.batch_search_labubu(max_pages=3)
    
    if labubu_posts:
        # 保存数据
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        json_filename = f"weibo_labubu_data_{timestamp}.json"
        csv_filename = f"weibo_labubu_data_{timestamp}.csv"
        
        scraper.save_to_json(labubu_posts, json_filename)
        scraper.save_to_csv(labubu_posts, csv_filename)
        
        # 生成分析报告
        report = scraper.generate_report(labubu_posts)
        report_filename = f"weibo_labubu_report_{timestamp}.json"
        scraper.save_to_json([report], report_filename)
        
        # 输出简要统计
        print(f"\n===== Labubu微博数据获取完成 =====")
        print(f"总计获取: {len(labubu_posts)} 条相关微博")
        print(f"总转发数: {sum(p.get('reposts_count', 0) for p in labubu_posts)}")
        print(f"总评论数: {sum(p.get('comments_count', 0) for p in labubu_posts)}")
        print(f"总点赞数: {sum(p.get('attitudes_count', 0) for p in labubu_posts)}")
        print(f"数据文件: {json_filename}, {csv_filename}")
        print(f"分析报告: {report_filename}")
        
    else:
        logger.warning("没有获取到相关数据，请检查API配置和网络连接")

if __name__ == "__main__":
    # 运行主函数
    asyncio.run(main()) 