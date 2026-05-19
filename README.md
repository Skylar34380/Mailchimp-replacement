# Newsletter Subscription Manager / 邮件订阅管理系统

English | [中文](#中文说明)

## Overview

Newsletter Subscription Manager is a general-purpose, self-hosted newsletter subscription stack.

It uses [Listmonk](https://listmonk.app/) for subscriber lists, campaigns, unsubscribe management, and campaign analytics. A small `subscribe-api` service receives subscription form submissions from any website or application, validates the input, records consent evidence, and forwards subscribers to Listmonk.

```text
Website or app form
  -> subscribe-api
  -> Listmonk
  -> SMTP provider
  -> subscribers
```

This project is intentionally generic. It is not tied to any single website, platform, or business.

## What Is Included

- `newsletter-stack/`: Docker Compose setup for Listmonk, Postgres, and `subscribe-api`
- `subscribe-api/`: Node.js API that receives subscription submissions and forwards them to Listmonk
- `中文使用说明.md`: detailed Chinese setup guide
- `邮件送达率与垃圾邮件防护指南.md`: deliverability and anti-spam checklist

## Features

- Website form to Listmonk subscription flow
- JSON and form-encoded request support
- Email validation
- Common field normalization, such as `firstName`, `lastName`, `pageUrl`, `company`, `role`, and `interests`
- Honeypot spam rejection
- Simple IP rate limiting
- Append-only consent logging
- Dry-run mode for testing without Listmonk
- Docker deployment path
- Listmonk campaign analytics: opens/views, clicks, unsubscribes, bounces, subscriber status

## Requirements

- Docker Desktop
- Node.js 20+ for local API development
- An SMTP provider for real email sending, such as Amazon SES, Postmark, Mailgun, or SMTP2GO

## Quick Start

```bash
cd newsletter-stack
cp .env.example .env
docker compose up -d --build
```

Open:

```text
Listmonk:      http://localhost:9000
Subscribe API: http://localhost:8787/health
```

## Configure A List

1. Open Listmonk at `http://localhost:9000`.
2. Create a public list, for example `Newsletter Updates`.
3. Copy the list UUID.
4. Edit `newsletter-stack/.env`.

```env
LISTMONK_LIST_UUIDS=your-list-uuid
LISTMONK_DRY_RUN=false
```

Restart:

```bash
docker compose up -d --build
```

## Test A Subscription

```bash
curl -X POST http://localhost:8787/api/subscribe \
  -H 'Content-Type: application/json' \
  --data '{
    "email": "reader@example.com",
    "firstName": "Reader",
    "lastName": "One",
    "source": "website-home",
    "consentText": "I agree to receive newsletter updates."
  }'
```

Expected response:

```json
{
  "ok": true,
  "message": "Subscription received.",
  "dryRun": false
}
```

## Website Integration

Configure your website signup form to submit to:

```text
https://subscribe.your-domain.com/api/subscribe
```

Recommended fields:

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `source`
- `consentText`

Optional segmentation fields:

- `company`
- `role`
- `interests`

## Development

Run API unit tests:

```bash
npm test
```

Run only the subscribe API:

```bash
cd subscribe-api
cp .env.example .env
npm start
```

Dry-run integration test:

```bash
cd subscribe-api
npm run test:dry-run
```

## Deliverability Notes

Listmonk manages mailing lists and campaigns, but actual email delivery should use a professional SMTP provider. Do not send marketing emails directly from a raw VPS SMTP server.

Before production:

- Configure SPF, DKIM, and DMARC
- Use a sending subdomain such as `mail.example.com`
- Keep clear unsubscribe links
- Do not reactivate unsubscribed, cleaned, or bounced contacts
- Warm up sending gradually
- Monitor bounces, unsubscribes, complaints, clicks, and opens

See:

```text
邮件送达率与垃圾邮件防护指南.md
```

## 中文说明

这个项目是一个通用的自托管邮件订阅管理系统。

它使用 [Listmonk](https://listmonk.app/) 管理订阅者、邮件列表、newsletter、退订、打开率、点击率和 bounce；`subscribe-api` 负责接收任意网站或应用的订阅表单提交，校验数据，保存 consent 记录，并把订阅者写入 Listmonk。

```text
网站或应用订阅表单
  -> subscribe-api
  -> Listmonk
  -> SMTP 服务商
  -> 订阅者邮箱
```

这个项目是通用项目，不绑定任何特定网站、平台或业务。

## 包含内容

- `newsletter-stack/`：Listmonk、Postgres、subscribe-api 的 Docker Compose 配置
- `subscribe-api/`：接收订阅表单并写入 Listmonk 的 Node.js 服务
- `中文使用说明.md`：详细中文搭建步骤
- `邮件送达率与垃圾邮件防护指南.md`：邮件送达率和垃圾邮件防护说明

## 功能

- 网站表单提交到 Listmonk
- 支持 JSON 和普通表单提交
- email 校验
- 清洗常见字段，例如 `firstName`、`lastName`、`pageUrl`、`company`、`role`、`interests`
- honeypot 反垃圾
- 简单 IP 限流
- consent 记录日志
- dry-run 测试模式
- Docker 部署
- Listmonk 后台查看打开率、点击率、退订、bounce 和 subscriber 状态

## 快速启动

```bash
cd newsletter-stack
cp .env.example .env
docker compose up -d --build
```

打开：

```text
Listmonk:      http://localhost:9000
Subscribe API: http://localhost:8787/health
```

## 配置邮件列表

1. 打开 `http://localhost:9000`。
2. 创建 public list，例如 `Newsletter Updates`。
3. 复制 list UUID。
4. 修改 `newsletter-stack/.env`。

```env
LISTMONK_LIST_UUIDS=你的-list-uuid
LISTMONK_DRY_RUN=false
```

重启：

```bash
docker compose up -d --build
```

## 测试订阅

```bash
curl -X POST http://localhost:8787/api/subscribe \
  -H 'Content-Type: application/json' \
  --data '{
    "email": "reader@example.com",
    "firstName": "Reader",
    "lastName": "One",
    "source": "website-home",
    "consentText": "I agree to receive newsletter updates."
  }'
```

成功后去 Listmonk 后台的 Subscribers 页面查看邮箱。

## 接入网站

上线后，把你的订阅表单提交到：

```text
https://subscribe.your-domain.com/api/subscribe
```

推荐字段：

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `source`
- `consentText`

可选分群字段：

- `company`
- `role`
- `interests`

## 邮件送达率

Listmonk 不负责 SMTP 声誉。正式发邮件需要配置 Amazon SES、Postmark、Mailgun 或 SMTP2GO。

上线前必须配置：

- SPF
- DKIM
- DMARC
- 清晰 unsubscribe
- 不导入已退订、cleaned 或 bounced 的联系人
- 小批量 warm up

更多细节见：

```text
邮件送达率与垃圾邮件防护指南.md
```
