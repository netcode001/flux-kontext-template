// 🌊 工作流自动化服务
// 支持 n8n、Coze、Zapier、Make 等工作流平台集成

import { createAdminClient } from '@/lib/supabase/server'

// 🔧 工作流平台配置
interface WorkflowPlatform {
  id: string
  name: string
  type: 'n8n' | 'coze' | 'zapier' | 'make'
  endpoint: string
  apiKey?: string
  webhookUrl?: string
  isActive: boolean
}

// 📄 工作流触发器配置
interface WorkflowTrigger {
  id: string
  platformId: string
  name: string
  schedule: string // cron格式
  sourceType: 'rss' | 'social_media' | 'api' | 'webhook'
  sourceConfig: {
    urls?: string[]
    keywords: string[]
    platforms?: string[]
    apiEndpoints?: string[]
  }
  outputConfig: {
    type: 'google_sheets' | 'notion' | 'airtable' | 'webhook'
    destination: string
    format: 'json' | 'csv' | 'structured'
    fields: string[]
  }
}

// 🎯 工作流自动化类
export class WorkflowAutomation {
  private supabase = createAdminClient()
  private platforms: WorkflowPlatform[] = []

  constructor() {
    this.initializePlatforms()
  }

  // 🚀 初始化工作流平台
  private initializePlatforms() {
    this.platforms = [
      {
        id: 'n8n-main',
        name: 'n8n自动化平台',
        type: 'n8n',
        endpoint: process.env.N8N_WEBHOOK_URL || 'https://n8n.yourhost.com/webhook',
        apiKey: process.env.N8N_API_KEY,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/parse-content`,
        isActive: true
      },
      {
        id: 'coze-social',
        name: 'Coze社交媒体收集器',
        type: 'coze',
        endpoint: process.env.COZE_WEBHOOK_URL || 'https://www.coze.com/api/workflow/trigger',
        apiKey: process.env.COZE_API_KEY,
        webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/parse-content`,
        isActive: true
      }
    ]
  }

  // 📊 创建n8n工作流配置
  public generateN8nWorkflow(trigger: WorkflowTrigger): any {
    return {
      name: `Labubu内容收集器 - ${trigger.name}`,
      nodes: [
        // 🕐 定时触发节点
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: "cronExpression",
                  expression: trigger.schedule
                }
              ]
            }
          },
          id: "trigger-schedule",
          name: "Schedule Trigger",
          type: "n8n-nodes-base.scheduleTrigger",
          typeVersion: 1.1,
          position: [240, 300]
        },

        // 🔍 RSS获取节点
        {
          parameters: {
            url: trigger.sourceConfig.urls?.[0] || 'https://hypebeast.com/feed',
            options: {
              fullResponse: false,
              ignoreSSLIssues: false
            }
          },
          id: "rss-reader",
          name: "RSS Reader",
          type: "n8n-nodes-base.rssFeedRead",
          typeVersion: 1,
          position: [460, 300]
        },

        // 🎯 内容过滤节点
        {
          parameters: {
            conditions: {
              options: {
                caseSensitive: false,
                leftValue: "",
                operation: "regex"
              },
              conditions: [
                {
                  id: "filter-keywords",
                  leftValue: "={{ $json.title + ' ' + $json.contentSnippet }}",
                  rightValue: trigger.sourceConfig.keywords.join('|'),
                  operation: "regex"
                }
              ],
              combinator: "or"
            }
          },
          id: "content-filter",
          name: "Content Filter",
          type: "n8n-nodes-base.filter",
          typeVersion: 2,
          position: [680, 300]
        },

        // 📊 Google Sheets保存节点
        ...(trigger.outputConfig.type === 'google_sheets' ? [
          {
            parameters: {
              authentication: "serviceAccount",
              resource: "sheet",
              operation: "appendOrUpdate",
              documentId: {
                __rl: true,
                value: trigger.outputConfig.destination,
                mode: "id"
              },
              sheetName: {
                __rl: true,
                value: "collected_content",
                mode: "name"
              },
              columnToMatchOn: "url",
              valueInputMode: "defineBelow",
              fieldsUi: {
                values: [
                  {
                    column: "title",
                    fieldValue: "={{ $json.title }}"
                  },
                  {
                    column: "content", 
                    fieldValue: "={{ $json.contentSnippet }}"
                  },
                  {
                    column: "url",
                    fieldValue: "={{ $json.link }}"
                  },
                  {
                    column: "published_at",
                    fieldValue: "={{ $json.pubDate }}"
                  },
                  {
                    column: "platform",
                    fieldValue: "n8n-rss"
                  },
                  {
                    column: "collected_at",
                    fieldValue: "={{ $now }}"
                  }
                ]
              },
              options: {}
            },
            id: "google-sheets",
            name: "Google Sheets",
            type: "n8n-nodes-base.googleSheets",
            typeVersion: 4.4,
            position: [900, 300]
          }
        ] : []),

        // 🔔 Webhook通知节点
        {
          parameters: {
            httpMethod: "POST",
            url: this.platforms.find(p => p.id === trigger.platformId)?.webhookUrl,
            options: {
              headers: {
                "Content-Type": "application/json"
              }
            },
            bodyParametersUi: {
              parameter: [
                {
                  name: "source",
                  value: JSON.stringify({
                    type: trigger.outputConfig.type,
                    data: "={{ $json }}",
                    metadata: {
                      workflow_id: trigger.id,
                      source_platform: trigger.sourceType,
                      collected_at: "={{ $now }}"
                    }
                  })
                }
              ]
            }
          },
          id: "webhook-notify",
          name: "通知解析API",
          type: "n8n-nodes-base.httpRequest",
          typeVersion: 4.2,
          position: [1120, 300]
        }
      ],
      
      connections: {
        "Schedule Trigger": {
          main: [
            [
              {
                node: "RSS Reader",
                type: "main",
                index: 0
              }
            ]
          ]
        },
        "RSS Reader": {
          main: [
            [
              {
                node: "Content Filter",
                type: "main",
                index: 0
              }
            ]
          ]
        },
        "Content Filter": {
          main: [
            [
              {
                node: trigger.outputConfig.type === 'google_sheets' ? "Google Sheets" : "通知解析API",
                type: "main",
                index: 0
              }
            ]
          ]
        },
        ...(trigger.outputConfig.type === 'google_sheets' ? {
          "Google Sheets": {
            main: [
              [
                {
                  node: "通知解析API",
                  type: "main",
                  index: 0
                }
              ]
            ]
          }
        } : {})
      },

      active: true,
      settings: {
        executionOrder: "v1"
      },
      staticData: null,
      meta: {
        templateCredsSetupCompleted: true
      },
      pinData: {},
      versionId: "1"
    }
  }

  // 🤖 创建Coze工作流配置
  public generateCozeWorkflow(trigger: WorkflowTrigger): any {
    return {
      workflow_name: `Labubu社交媒体收集器 - ${trigger.name}`,
      description: "自动收集Labubu相关社交媒体内容",
      triggers: [
        {
          type: "schedule",
          cron: trigger.schedule,
          timezone: "Asia/Shanghai"
        }
      ],
      variables: {
        keywords: trigger.sourceConfig.keywords,
        platforms: trigger.sourceConfig.platforms || ['weibo', 'xiaohongshu'],
        webhook_url: this.platforms.find(p => p.id === trigger.platformId)?.webhookUrl
      },
      steps: [
        {
          name: "社交媒体监控",
          type: "social_media_monitor",
          config: {
            platforms: "{{variables.platforms}}",
            keywords: "{{variables.keywords}}",
            limit: 20,
            time_range: "2h"
          },
          next: "内容过滤"
        },
        {
          name: "内容过滤",
          type: "content_filter",
          config: {
            rules: [
              {
                field: "content",
                operator: "contains_any",
                values: "{{variables.keywords}}"
              },
              {
                field: "engagement.likes",
                operator: "greater_than",
                value: 50
              }
            ],
            logic: "AND"
          },
          next: "数据标准化"
        },
        {
          name: "数据标准化",
          type: "data_transform",
          config: {
            mapping: {
              title: "{{item.content}}",
              content: "{{item.full_text || item.content}}",
              author: "{{item.author.name}}",
              url: "{{item.url}}",
              published_at: "{{item.created_at}}",
              platform: "{{item.platform}}",
              likes: "{{item.engagement.likes}}",
              shares: "{{item.engagement.shares}}",
              comments: "{{item.engagement.comments}}"
            }
          },
          next: trigger.outputConfig.type === 'notion' ? "保存到Notion" : "发送Webhook"
        },
        ...(trigger.outputConfig.type === 'notion' ? [
          {
            name: "保存到Notion",
            type: "notion_database",
            config: {
              database_id: trigger.outputConfig.destination,
              properties: {
                "Title": { type: "title", value: "{{item.title}}" },
                "Content": { type: "rich_text", value: "{{item.content}}" },
                "Author": { type: "rich_text", value: "{{item.author}}" },
                "URL": { type: "url", value: "{{item.url}}" },
                "Published": { type: "date", value: "{{item.published_at}}" },
                "Platform": { type: "select", value: "{{item.platform}}" },
                "Likes": { type: "number", value: "{{item.likes}}" },
                "Collected At": { type: "date", value: "{{now}}" }
              }
            },
            next: "发送Webhook"
          }
        ] : []),
        {
          name: "发送Webhook",
          type: "http_request",
          config: {
            method: "POST",
            url: "{{variables.webhook_url}}",
            headers: {
              "Content-Type": "application/json"
            },
            body: {
              source: {
                type: trigger.outputConfig.type,
                data: "{{steps.数据标准化.output}}",
                metadata: {
                  workflow_id: trigger.id,
                  source_platform: "coze",
                  collected_at: "{{now}}"
                }
              }
            }
          }
        }
      ],
      error_handling: {
        on_error: "continue",
        retry_count: 3,
        retry_delay: "5m"
      }
    }
  }

  // 📝 部署工作流到平台
  public async deployWorkflow(platformId: string, workflowConfig: any): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    const platform = this.platforms.find(p => p.id === platformId)
    if (!platform) {
      return { success: false, error: '未找到指定平台' }
    }

    try {
      switch (platform.type) {
        case 'n8n':
          return await this.deployToN8n(platform, workflowConfig)
        
        case 'coze':
          return await this.deployToCoze(platform, workflowConfig)
        
        default:
          return { success: false, error: '不支持的平台类型' }
      }
    } catch (error) {
      console.error('部署工作流失败:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '部署失败' 
      }
    }
  }

  // 🚀 部署到n8n平台
  private async deployToN8n(platform: WorkflowPlatform, config: any): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const response = await fetch(`${platform.endpoint}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${platform.apiKey}`
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const result = await response.json()
        return { success: true, workflowId: result.id }
      } else {
        const error = await response.text()
        return { success: false, error: `n8n部署失败: ${error}` }
      }
    } catch (error) {
      return { success: false, error: `n8n连接失败: ${error}` }
    }
  }

  // 🤖 部署到Coze平台
  private async deployToCoze(platform: WorkflowPlatform, config: any): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    try {
      const response = await fetch(`${platform.endpoint}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${platform.apiKey}`
        },
        body: JSON.stringify(config)
      })

      if (response.ok) {
        const result = await response.json()
        return { success: true, workflowId: result.workflow_id }
      } else {
        const error = await response.text()
        return { success: false, error: `Coze部署失败: ${error}` }
      }
    } catch (error) {
      return { success: false, error: `Coze连接失败: ${error}` }
    }
  }

  // 📊 获取工作流状态
  public async getWorkflowStatus(platformId: string, workflowId: string): Promise<any> {
    const platform = this.platforms.find(p => p.id === platformId)
    if (!platform) return null

    try {
      let endpoint: string
      let headers: Record<string, string>

      switch (platform.type) {
        case 'n8n':
          endpoint = `${platform.endpoint}/api/v1/workflows/${workflowId}`
          headers = {
            'Authorization': `Bearer ${platform.apiKey}`
          }
          break
        
        case 'coze':
          endpoint = `${platform.endpoint}/workflows/${workflowId}/status`
          headers = {
            'Authorization': `Bearer ${platform.apiKey}`
          }
          break
        
        default:
          return null
      }

      const response = await fetch(endpoint, { headers })
      return response.ok ? await response.json() : null

    } catch (error) {
      console.error('获取工作流状态失败:', error)
      return null
    }
  }

  // 🗂️ 预设工作流模板
  public getWorkflowTemplates(): WorkflowTrigger[] {
    return [
      {
        id: 'labubu-rss-sheets',
        platformId: 'n8n-main',
        name: 'RSS→Google Sheets',
        schedule: '0 */2 * * *', // 每2小时
        sourceType: 'rss',
        sourceConfig: {
          urls: [
            'https://hypebeast.com/feed',
            'https://www.toynews-online.biz/feed'
          ],
          keywords: ['labubu', '拉布布', 'popmart', 'lisa']
        },
        outputConfig: {
          type: 'google_sheets',
          destination: 'your-google-sheet-id',
          format: 'structured',
          fields: ['title', 'content', 'url', 'published_at', 'platform']
        }
      },
      {
        id: 'labubu-social-notion',
        platformId: 'coze-social',
        name: '社交媒体→Notion',
        schedule: '0 */3 * * *', // 每3小时
        sourceType: 'social_media',
        sourceConfig: {
          keywords: ['labubu', '拉布布', 'Lisa同款', '#labubu#'],
          platforms: ['weibo', 'xiaohongshu']
        },
        outputConfig: {
          type: 'notion',
          destination: 'your-notion-database-id',
          format: 'structured',
          fields: ['title', 'content', 'author', 'url', 'published_at', 'platform', 'engagement']
        }
      }
    ]
  }
}

// 🚀 导出工作流自动化实例
export const workflowAutomation = new WorkflowAutomation() 