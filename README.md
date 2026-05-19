# OMM Newsletter Stack / OMM 邮件订阅系统

English | [中文](#中文说明)

## Overview

This project replaces the Mailchimp part of a Wix-based real estate website with a self-hosted newsletter stack.

Wix continues to host the public website and forms. Listmonk replaces Mailchimp for subscribers, lists, campaigns, unsubscribe management, and campaign analytics. A small `subscribe-api` service connects Wix form submissions to Listmonk while recording consent evidence.

```text
Wix signup form
  -> subscribe-api
  -> Listmonk
  -> SMTP provider
  -> subscribers
```

## What Is Included

- `mailchimp-replacement/`: Docker Compose setup for Listmonk, Postgres, and `subscribe-api`
- `subscribe-api/`: Node.js API that receives Wix form submissions and forwards them to Listmonk
- `中文使用说明.md`: detailed Chinese setup guide
- `邮件送达率与垃圾邮件防护指南.md`: deliverability and anti-spam checklist

This repository is only about the email/newsletter system. It does not include the earlier Wix website clone prototype.

## Features

- Wix form to Listmonk subscription flow
- JSON and form-encoded request support
- Email validation
- Wix-style field normalization, such as `firstName`, `lastName`, `pageUrl`, `suburb`, and `projectType`
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
cd mailchimp-replacement
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
2. Create a public list, for example `OMM Property Updates`.
3. Copy the list UUID.
4. Edit `mailchimp-replacement/.env`.

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
curl -X POST http://localhost:8787/api/wix/subscribe \
  -H 'Content-Type: application/json' \
  --data '{
    "email": "buyer@example.com",
    "firstName": "Buyer",
    "lastName": "One",
    "source": "wix-home",
    "consentText": "I agree to receive OMM property updates."
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

## Wix Integration

Configure the Wix signup form to submit to:

```text
https://subscribe.your-domain.com/api/wix/subscribe
```

Recommended fields:

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `suburb`
- `projectType`
- `consentText`

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

Listmonk manages the mailing list and campaigns, but actual email delivery should use a professional SMTP provider. Do not send marketing emails directly from a raw VPS SMTP server.

Before production:

- Configure SPF, DKIM, and DMARC
- Use a sending subdomain such as `mail.example.com`
- Keep clear unsubscribe links
- Do not reactivate unsubscribed, cleaned, or bounced Mailchimp contacts
- Warm up sending gradually
- Monitor bounces, unsubscribes, complaints, clicks, and opens

See:

```text
邮件送达率与垃圾邮件防护指南.md
```

## 中文说明

这个项目用于把 Wix 网站里的 Mailchimp 邮件订阅功能替换成自托管系统。

Wix 继续负责网站页面和表单；Listmonk 替代 Mailchimp，负责联系人、邮件列表、newsletter、退订、打开率、点击率和 bounce；`subscribe-api` 负责把 Wix 表单提交转发到 Listmonk，并保存 consent 记录。

```text
Wix 订阅表单
  -> subscribe-api
  -> Listmonk
  -> SMTP 服务商
  -> 订阅者邮箱
```

## 包含内容

- `mailchimp-replacement/`：Listmonk、Postgres、subscribe-api 的 Docker Compose 配置
- `subscribe-api/`：接收 Wix 表单并写入 Listmonk 的 Node.js 服务
- `中文使用说明.md`：详细中文搭建步骤
- `邮件送达率与垃圾邮件防护指南.md`：邮件送达率和垃圾邮件防护说明

这个仓库现在只针对邮件功能，不包含之前尝试过的 Wix 网页 clone 原型。

## 功能

- Wix 表单提交到 Listmonk
- 支持 JSON 和普通表单提交
- email 校验
- 清洗 Wix 常见字段，例如 `firstName`、`lastName`、`pageUrl`、`suburb`、`projectType`
- honeypot 反垃圾
- 简单 IP 限流
- consent 记录日志
- dry-run 测试模式
- Docker 部署
- Listmonk 后台查看打开率、点击率、退订、bounce 和 subscriber 状态

## 快速启动

```bash
cd mailchimp-replacement
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
2. 创建 public list，例如 `OMM Property Updates`。
3. 复制 list UUID。
4. 修改 `mailchimp-replacement/.env`。

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
curl -X POST http://localhost:8787/api/wix/subscribe \
  -H 'Content-Type: application/json' \
  --data '{
    "email": "buyer@example.com",
    "firstName": "Buyer",
    "lastName": "One",
    "source": "wix-home",
    "consentText": "I agree to receive OMM property updates."
  }'
```

成功后去 Listmonk 后台的 Subscribers 页面查看邮箱。

## 接入 Wix

上线后，把 Wix 订阅表单提交到：

```text
https://subscribe.your-domain.com/api/wix/subscribe
```

推荐字段：

- `email`
- `firstName`
- `lastName`
- `pageUrl`
- `suburb`
- `projectType`
- `consentText`

## 邮件送达率

Listmonk 不负责 SMTP 声誉。正式发邮件需要配置 Amazon SES、Postmark、Mailgun 或 SMTP2GO。

上线前必须配置：

- SPF
- DKIM
- DMARC
- 清晰 unsubscribe
- 不导入已退订、cleaned 或 bounced 的 Mailchimp 联系人
- 小批量 warm up

更多细节见：

```text
邮件送达率与垃圾邮件防护指南.md
```
