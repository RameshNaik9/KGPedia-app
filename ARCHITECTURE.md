# 🏗️ KGPedia Architecture & Deployment Flow

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Mobile     │  │   Tablet     │          │
│  │  (Desktop)   │  │   Browser    │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    HTTPS (Port 443)
                             │
          ┌──────────────────▼──────────────────┐
          │      Azure Web App (Linux)          │
          │   https://kgpedia.azurewebsites.net │
          │                                      │
          │  ┌────────────────────────────────┐ │
          │  │   Static Files Server          │ │
          │  │   (React Build - Port 8080)    │ │
          │  │                                 │ │
          │  │  • index.html                  │ │
          │  │  • JavaScript bundles          │ │
          │  │  • CSS files                   │ │
          │  │  • Images, fonts, etc.         │ │
          │  └───────────┬────────────────────┘ │
          │              │                       │
          │  ┌───────────▼────────────────────┐ │
          │  │   Express.js Backend           │ │
          │  │   (Node.js 20 LTS)             │ │
          │  │                                 │ │
          │  │  API Routes:                   │ │
          │  │  • /api/auth   (Login/Register)│ │
          │  │  • /api/chat   (Chat messages) │ │
          │  │  • /api/profile (User profile) │ │
          │  │  • /api/notifications          │ │
          │  │  • /api/assistant              │ │
          │  │                                 │ │
          │  │  WebSocket:                    │ │
          │  │  • Socket.io (Real-time chat) │ │
          │  └───────────┬────────────────────┘ │
          │              │                       │
          └──────────────┼───────────────────────┘
                         │
                         │ MongoDB Protocol
                         │ (Port 27017)
                         │
          ┌──────────────▼───────────────────────┐
          │      MongoDB Atlas (Cloud)            │
          │      Cluster: kgpedia-cluster         │
          │                                        │
          │  Collections:                          │
          │  • users                              │
          │  • messages                           │
          │  • conversations                      │
          │  • subscriptions                      │
          │  • chatmessages                       │
          │                                        │
          │  Region: Mumbai / Singapore (Asia)    │
          │  Tier: M0 (Free) or M2 (Paid)         │
          └────────────────────────────────────────┘
```

---

## 🔄 Deployment Flow (CI/CD Pipeline)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPER WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

    LOCAL MACHINE
    ─────────────
         │
         │  1. Developer makes changes
         │     • Edit React components (client/)
         │     • Edit Node.js API (server/)
         │     • Test locally
         │
         ▼
    ┌─────────────┐
    │  git add .  │
    │  git commit │
    │  git push   │
    └──────┬──────┘
           │
           │  Push to 'kgpedia' branch
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GITHUB                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  GitHub Actions Workflow                    │ │
│  │               (.github/workflows/deploy.yml)                │ │
│  │                                                              │ │
│  │  Step 1: Checkout Code                                      │ │
│  │    └─> actions/checkout@v3                                  │ │
│  │                                                              │ │
│  │  Step 2: Setup Node.js 20                                   │ │
│  │    └─> actions/setup-node@v3                                │ │
│  │                                                              │ │
│  │  Step 3: Install Client Dependencies (60s)                  │ │
│  │    └─> cd client && npm install                             │ │
│  │                                                              │ │
│  │  Step 4: Install Server Dependencies (60s)                  │ │
│  │    └─> cd server && npm install                             │ │
│  │                                                              │ │
│  │  Step 5: Build React App (120s)                             │ │
│  │    └─> cd client && npm run build                           │ │
│  │        Creates: client/build/ with optimized files          │ │
│  │                                                              │ │
│  │  Step 6: Prepare Release Artifact                           │ │
│  │    └─> Create folder structure:                             │ │
│  │        releaseGAA/                                           │ │
│  │        ├── client/build/  (React static files)              │ │
│  │        └── server/        (Node.js backend)                 │ │
│  │                                                              │ │
│  │  Step 7: Deploy to Azure                                    │ │
│  │    └─> azure/webapps-deploy@v2                              │ │
│  │        • Uses: AZURE_WEBAPP_PUBLISH_PROFILE secret          │ │
│  │        • Uploads: releaseGAA/ folder                        │ │
│  │        • Target: kgpedia.azurewebsites.net                  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
                                  │  Secure deployment via
                                  │  publish profile credentials
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AZURE CLOUD                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              App Service Deployment Engine                  │ │
│  │                                                              │ │
│  │  1. Receives uploaded files from GitHub Actions            │ │
│  │  2. Extracts to: /home/site/wwwroot/                        │ │
│  │  3. Runs startup command:                                   │ │
│  │     cd server && npm install --production && node server.js │ │
│  │  4. Starts Node.js process on port 8080                     │ │
│  │  5. Configures reverse proxy (nginx)                        │ │
│  │  6. Maps port 8080 -> 443 (HTTPS)                           │ │
│  │  7. Enables WebSocket support                               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Running Application                        │ │
│  │                                                              │ │
│  │  Process: node server.js                                    │ │
│  │  Port: 8080 (internal)                                      │ │
│  │  Public URL: https://kgpedia.azurewebsites.net              │ │
│  │  Status: Running ✓                                          │ │
│  │                                                              │ │
│  │  Logs: /home/LogFiles/                                      │ │
│  │  Files: /home/site/wwwroot/                                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Deployed File Structure on Azure

```
/home/site/wwwroot/  (Azure App Service root)
│
├── client/
│   └── build/                    # Compiled React application
│       ├── index.html            # Entry point
│       ├── static/
│       │   ├── css/
│       │   │   └── main.[hash].css
│       │   ├── js/
│       │   │   ├── main.[hash].js
│       │   │   └── [chunk].[hash].js
│       │   └── media/
│       │       └── [images, fonts, etc.]
│       ├── manifest.json
│       ├── favicon.ico
│       └── asset-manifest.json
│
└── server/                       # Node.js backend
    ├── server.js                 # Main entry point ⭐
    ├── package.json
    ├── package-lock.json
    ├── node_modules/             # Installed by Azure
    ├── web.config                # IIS configuration
    ├── ecosystem.config.js       # PM2 config (optional)
    └── src/
        ├── config/
        ├── controllers/
        ├── db/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── services/
        ├── utils/
        ├── validations/
        └── jobs/

Startup working directory: /home/site/wwwroot/server/
Startup command: node server.js
```

---

## 🔐 Security & Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Secrets (Encrypted)                                        │ │
│  │  ├── AZURE_WEBAPP_PUBLISH_PROFILE  (Deploy credentials)    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Used during deployment
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AZURE WEB APP                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Application Settings (Environment Variables)               │ │
│  │                                                              │ │
│  │  NODE_ENV=production          → Sets production mode       │ │
│  │  PORT=8080                    → App listens on 8080        │ │
│  │  MONGODB_URI=mongodb+srv://... → Database connection       │ │
│  │  JWT_SECRET=***************   → Token signing key          │ │
│  │  WEBSITE_NODE_DEFAULT_VERSION=20-lts  → Node version       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  General Settings                                           │ │
│  │                                                              │ │
│  │  Runtime Stack: Node 20 LTS                                 │ │
│  │  Platform: Linux                                            │ │
│  │  Web sockets: Enabled  ← Important for Socket.io!          │ │
│  │  Always On: Off (F1/B1), On (S1+)                           │ │
│  │  Startup Command: cd server && npm install --production...  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Connects to
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MONGODB ATLAS                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Network Access                                             │ │
│  │  └─> Allowed IPs: 0.0.0.0/0 (All IPs)                      │ │
│  │                                                              │ │
│  │  Database Users                                             │ │
│  │  └─> User: kgpedia-admin                                    │ │
│  │      Password: [secure-password]                            │ │
│  │      Role: readWrite                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌊 Request Flow (Runtime)

### Static File Request (e.g., loading homepage):
```
User Browser                    Azure Web App
    │                               │
    ├─ GET / ─────────────────────>│
    │                               ├─ Express.js receives request
    │                               ├─ Checks: /client/build/index.html
    │                               └─ Sends: HTML file
    │<──── index.html ──────────────┤
    │                               │
    ├─ GET /static/js/main.js ────>│
    │                               ├─ Checks: /client/build/static/js/main.js
    │                               └─ Sends: JavaScript bundle
    │<──── main.js ─────────────────┤
    │                               │
    ├─ GET /static/css/main.css ──>│
    │                               ├─ Checks: /client/build/static/css/main.css
    │                               └─ Sends: CSS file
    │<──── main.css ────────────────┤
```

### API Request (e.g., user login):
```
User Browser                    Azure Web App                MongoDB Atlas
    │                               │                            │
    ├─ POST /api/auth/login ──────>│                            │
    │  {email, password}            ├─ Express route: authController.login
    │                               ├─ Validate input           │
    │                               ├─ Query DB ───────────────>│
    │                               │                            ├─ Find user
    │                               │                            └─ Return data
    │                               │<─────────────────────────┤
    │                               ├─ Verify password          │
    │                               ├─ Generate JWT token       │
    │                               └─ Send response            │
    │<──── {token, user} ───────────┤                            │
```

### WebSocket Connection (real-time chat):
```
User Browser                    Azure Web App
    │                               │
    ├─ WS handshake ──────────────>│
    │  Upgrade: websocket           ├─ Socket.io accepts connection
    │                               └─ Store socket in onlineUsers Map
    │<──── Connection established ──┤
    │                               │
    ├─ emit('send_message') ──────>│
    │  {room, message, user}        ├─ Handle in io.on('connection')
    │                               ├─ Save to MongoDB
    │                               └─ Broadcast to room
    │<──── emit('receive_message') ─┤
    │                               │
    │  (Real-time, bidirectional)   │
```

---

## 📦 Resource Hierarchy in Azure

```
Azure Subscription: "Azure for Students"
│
└── Resource Group: "rg-kgpedia-prod"
    │
    ├── App Service Plan: "asp-kgpedia-prod"
    │   │
    │   ├── SKU: B1 (Basic)
    │   ├── OS: Linux
    │   ├── Region: Central India
    │   ├── CPU: 1 Core
    │   ├── RAM: 1.75 GB
    │   └── Storage: 10 GB
    │
    └── App Service (Web App): "kgpedia"
        │
        ├── Runtime: Node.js 20 LTS
        ├── URL: https://kgpedia.azurewebsites.net
        ├── SSL: Auto-configured ✓
        ├── WebSockets: Enabled
        └── Deployment: GitHub Actions

External Resource (Not in Azure):
    MongoDB Atlas: "kgpedia-cluster"
    ├── Provider: MongoDB Cloud
    ├── Tier: M0 (Free) or M2
    ├── Region: Asia (Mumbai/Singapore)
    └── Connected via: MONGODB_URI connection string
```

---

## 🔄 Communication Protocols

```
┌───────────────┐
│  User Device  │
└───────┬───────┘
        │
        ├─ HTTPS (443) ────────────┐
        │  • Secure web traffic    │
        │  • SSL/TLS encrypted     │
        │                          │
        ├─ WebSocket (443) ────────┤
        │  • Real-time chat        │
        │  • Socket.io protocol    │
        │  • Bidirectional         │
        │                          │
        ▼                          │
┌────────────────────────┐        │
│  Azure Web App (nginx) │        │
└───────┬────────────────┘        │
        │                         │
        ├─ HTTP (8080) ───────────┘
        │  • Internal port         Internal
        │  • Not public            ─────────
        │                          
        ▼
┌────────────────────────┐
│  Node.js Process       │
└───────┬────────────────┘
        │
        ├─ MongoDB Protocol (27017)
        │  • TCP connection
        │  • TLS encrypted
        │  • Connection pooling
        │
        ▼
┌────────────────────────┐
│  MongoDB Atlas         │
└────────────────────────┘
```

---

## 💾 Data Flow & Storage

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYERS                              │
└─────────────────────────────────────────────────────────────────┘

Client Side (Browser)
├── React State Management
├── Local Storage (JWT token)
├── Session Storage
└── Socket.io Client

        │ HTTP/WebSocket
        ▼

Server Side (Azure)
├── Express.js Middleware
├── Socket.io Server
├── In-Memory onlineUsers Map
└── JWT verification

        │ MongoDB Protocol
        ▼

Database (MongoDB Atlas)
├── users collection
│   ├── _id, email, password (hashed)
│   ├── name, username
│   └── createdAt, updatedAt
│
├── messages collection
│   ├── _id, sender, receiver
│   ├── content, timestamp
│   └── read status
│
├── conversations collection
│   ├── _id, participants[]
│   ├── lastMessage
│   └── unreadCount
│
├── chatmessages collection
│   ├── _id, room, user
│   ├── message, timestamp
│   └── type (text/system)
│
└── subscriptions collection
    ├── _id, endpoint
    ├── keys (p256dh, auth)
    └── userId
```

---

## 🎯 Performance & Scaling

```
┌─────────────────────────────────────────────────────────────────┐
│                  PERFORMANCE CHARACTERISTICS                     │
└─────────────────────────────────────────────────────────────────┘

Cold Start (First request after sleep)
├── F1 Free: ~60 seconds
├── B1 Basic: ~30 seconds
└── S1+ Standard: No cold start (Always On)

Concurrent Connections
├── B1 Basic: ~100-200 simultaneous users
├── S1 Standard: ~500-1000 users
└── Scaling: Can scale up or scale out (multiple instances)

Socket.io Connections
├── Single instance: Limited by RAM (~1000 connections)
└── Multi-instance: Requires Redis adapter (not included)

Database (MongoDB Atlas M0)
├── Storage: 512 MB (Free tier)
├── Shared RAM: Shared CPU
├── Connections: Up to 500 concurrent
└── Best for: Development, small apps, demos
```

---

## 🔧 Maintenance & Monitoring

```
┌─────────────────────────────────────────────────────────────────┐
│                     MONITORING TOOLS                             │
└─────────────────────────────────────────────────────────────────┘

GitHub Actions
├── Build logs
├── Deployment status
└── Workflow history

Azure Portal
├── Overview Dashboard
│   ├── CPU usage
│   ├── Memory usage
│   ├── HTTP requests/second
│   └── Response time
│
├── Log Stream (Real-time)
│   ├── Application logs
│   ├── Console.log output
│   └── Error traces
│
├── Metrics
│   ├── Historical data
│   ├── Custom charts
│   └── Alerts (optional)
│
└── Kudu (Advanced Tools)
    ├── Process Explorer
    ├── File Browser
    ├── Debug Console
    └── Environment variables

MongoDB Atlas
├── Cluster Metrics
├── Query Performance
├── Connection Statistics
└── Alerts & Monitoring
```

---

## 🚀 Deployment Timeline

```
Developer makes changes → Push to GitHub
    ↓ (seconds)
GitHub receives push → Triggers workflow
    ↓ (10s)
GitHub Actions starts → Setup environment
    ↓ (60s)
Install dependencies → client & server
    ↓ (120s)
Build React app → Optimize & bundle
    ↓ (10s)
Prepare artifacts → Create release structure
    ↓ (60s)
Deploy to Azure → Upload & restart app
    ↓ (30s)
Azure starts app → Run startup command
    ↓
🎉 App is live!

TOTAL TIME: 3-5 minutes
```

---

## 📊 Cost Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                      MONTHLY COSTS                               │
└─────────────────────────────────────────────────────────────────┘

Free Tier (F1)
├── Azure App Service: $0.00
├── MongoDB Atlas M0: $0.00
├── Bandwidth: Included
└── TOTAL: $0.00/month
    └── Limitations: Cold starts, limited CPU, 60 min/day

Recommended (B1)
├── Azure App Service B1: ~$13.00
├── MongoDB Atlas M0: $0.00
├── Bandwidth: Included
└── TOTAL: ~$13.00/month
    └── With $100 credits: 7-8 months free

Production (S1 + M2)
├── Azure App Service S1: ~$70.00
├── MongoDB Atlas M2: ~$9.00
├── Always On: Included
└── TOTAL: ~$79.00/month
    └── With $100 credits: 1.3 months
```

---

**📍 You are here:** Ready to deploy!

Next steps:
1. Follow `AZURE_DEPLOYMENT_GUIDE.md`
2. Complete Azure setup
3. Deploy and test
4. Monitor using Azure Portal

---

*Architecture documentation for KGPedia deployment on Azure*

