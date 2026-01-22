# KGPedia - KGP Knowledge Graph Pedia

A real-time chat room application for IIT Kharagpur students, built with React, Node.js, Express, Socket.io, and MongoDB.

## Features

- **Real-time Chat:** Instant messaging using Socket.io
- **User Authentication:** Secure login/registration with JWT
- **Multiple Chat Rooms:** Connect with fellow KGP students
- **AI Assistant:** Built-in chatbot for assistance
- **Push Notifications:** Stay updated with web push notifications
- **Responsive Design:** Works on desktop, tablet, and mobile

## Architecture

- **Frontend:** React.js with Material-UI
- **Backend:** Node.js + Express.js
- **Real-time:** Socket.io for WebSocket connections
- **Database:** MongoDB Atlas
- **Deployment:** Azure Web App (Linux)
- **CI/CD:** GitHub Actions

## Documentation

### For Deployment:

1. **[QUICK_START.md](./QUICK_START.md)** - Quick reference and 5-minute checklist
2. **[AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
3. **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Solutions to common issues
4. **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** - Overview of deployment package
5. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and data flow diagrams

### Recommended Reading Order:

**First-time deployers:**
1. Start with `QUICK_START.md` for overview
2. Follow `AZURE_DEPLOYMENT_GUIDE.md` step-by-step
3. Keep `TROUBLESHOOTING.md` handy for issues

**Already familiar with Azure:**
- Just use `QUICK_START.md` for quick reference

## Quick Deployment

### Prerequisites

- Azure account (Student account with $100 credits)
- GitHub account
- MongoDB Atlas account (free)

### Steps

1. **Azure Setup** (~15 minutes)
   - Create Resource Group: `rg-kgpedia-prod`
   - Create App Service Plan: `asp-kgpedia-prod` (B1 Basic)
   - Create Web App: `kgpedia`
   - Configure environment variables

2. **MongoDB Setup** (~10 minutes)
   - Create free M0 cluster
   - Set up database user
   - Configure network access
   - Get connection string

3. **GitHub Setup** (~5 minutes)
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE` secret
   - Push to `kgpedia` branch

4. **Deploy!**
   ```bash
   git checkout -b kgpedia
   git push origin kgpedia
   ```

Your app will be live at: `https://kgpedia.azurewebsites.net` in 3-5 minutes! 🎉

For detailed instructions, see **[AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)**

## Local Development

### Client (React)

```bash
cd client
npm install
npm start
# Runs on http://localhost:3000
```

### Server (Node.js)

```bash
cd server
npm install

# Create .env file with:
# NODE_ENV=development
# PORT=8080
# MONGODB_URI=your-mongodb-connection-string
# JWT_SECRET=your-secret-key
# PUBLIC_VAPID_KEY=your-public-key
# PRIVATE_VAPID_KEY=your-private-key

npm start
# Runs on http://localhost:8080
```

## Deployed URLs

- **Production:** `https://kgpedia.azurewebsites.net`
- **API Health Check:** `https://kgpedia.azurewebsites.net/api/health-check`

## Project Structure

```
KGPedia-app/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── server.js          # Entry point
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── middleware/    # Auth, error handling
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml     # CI/CD pipeline
│
└── [Documentation files]
```

## Technologies Used

### Frontend
- React 18
- Material-UI
- Socket.io Client
- React Router
- Axios
- React Toastify

### Backend
- Node.js 20
- Express.js
- Socket.io
- Mongoose (MongoDB ODM)
- JWT for authentication
- bcrypt for password hashing

### DevOps
- GitHub Actions for CI/CD
- Azure App Service for hosting
- MongoDB Atlas for database

## Environment Variables

### Required in Azure (Configuration → Application settings):

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kgpedia
JWT_SECRET=your-super-secret-jwt-key
PUBLIC_VAPID_KEY=your-public-vapid-key
PRIVATE_VAPID_KEY=your-private-vapid-key
WEBSITE_NODE_DEFAULT_VERSION=20-lts
```

**Generate VAPID keys:** Run `cd server && npx web-push generate-vapid-keys`

See `server/.env.example` for local development template.

## Testing

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

## Troubleshooting

Having issues? Check out our comprehensive troubleshooting guide:

**[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

Common issues covered:
- Application errors (503, 502)
- Socket.io connection problems
- MongoDB connection failures
- GitHub Actions deployment issues
- Cold start delays
- CORS errors
- And more...

## Monitoring

### Azure Portal
- **Log Stream:** Real-time application logs
- **Metrics:** CPU, memory, requests, response time
- **Kudu Console:** Advanced debugging tools

### MongoDB Atlas
- **Cluster Metrics:** Database performance
- **Query Performance:** Slow query analysis

## 💰 Cost Estimate

- **Free Tier (F1):** $0/month (with limitations)
- **Recommended (B1 + MongoDB M0):** ~$13/month
- **With Azure Student Credits:** 7-8 months free on B1 plan

## CI/CD Pipeline

Automated deployment via GitHub Actions:

1. Push to `kgpedia` branch
2. GitHub Actions builds React app
3. Installs dependencies
4. Creates release artifact
5. Deploys to Azure
6. App restarts automatically

**Total deployment time:** 3-5 minutes

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Chat
- `GET /api/chat/messages` - Get messages
- `POST /api/chat/message` - Send message

### Profile
- `GET /api/profile/:userId` - Get user profile
- `PUT /api/profile/update` - Update profile

### WebSocket Events (Socket.io)
- `connection` - Client connects
- `send_message` - Send chat message
- `receive_message` - Receive chat message
- `user_online` - User comes online
- `user_offline` - User goes offline

## Authors

- **Ramesh, Chandu** - IIT Kharagpur

## License

ISC License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Azure Student Support:** [aka.ms/azureforeducation](https://aka.ms/azureforeducation)
- **Issues:** Open an issue on GitHub
- **Documentation:** Check the docs folder

## Roadmap

- [ ] Add private messaging
- [ ] Implement file sharing
- [ ] Add user profiles with avatars
- [ ] Create admin dashboard
- [ ] Add message reactions
- [ ] Implement message search
- [ ] Add dark mode
- [ ] Mobile app (React Native)

## Acknowledgments

- IIT Kharagpur community
- Azure for Students program
- MongoDB Atlas free tier
- Open source community

---

## Ready to Deploy?

Start with **[QUICK_START.md](./QUICK_START.md)** or dive into **[AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md)**

**Your app will be live in under 30 minutes!** ⚡

---

*Made with ❤️ for IIT Kharagpur*
