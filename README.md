<br/>
<div align="center">
  <a href="https://www.devasign.com" style="display: block; margin: 0 auto;">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./public/devasign-white.png">
      <source media="(prefers-color-scheme: light)" srcset="./public/devasign-black.png">
      <img alt="DevAsign Logo" src="./public/devasign-white.png" height="120" style="display: block; margin: 0 auto;">
    </picture>
  </a>
<br/>

<br/>

</div>

<br/>

**DevAsign Contributor App** - The contributor platform for discovering bounty tasks, submitting solutions, and receiving payments through the Stellar blockchain.

## 🚀 What This App Does

The DevAsign Contributor App empowers open-source contributors to:

- **Discover Bounties**: Browse available tasks across multiple projects and repositories
- **Track Progress**: Monitor submissions, reviews, and payment status
- **Earn Rewards**: Receive instant payments via Stellar blockchain upon task completion
- **Collaborate**: Communicate with project maintainers and other contributors
- **Manage Earnings**: View payment history and manage crypto wallet

## ✨ Key Features

### 🎯 Task Discovery
- **Smart Filtering**: Find tasks by technology, difficulty, reward amount, and project type
- **Personalized Recommendations**: AI-powered task suggestions based on skills and history
- **Real-time Updates**: Live notifications when new bounties matching interests are posted
- **Multi-Project View**: Browse tasks across all DevAsign-enabled repositories

### 💼 Contribution Management
- **Submission Tracking**: Monitor the status of pull requests and submissions
- **AI Review Insights**: See detailed feedback from AI code reviews
- **Quality Metrics**: Track code quality scores and improvement over time

### 💰 Instant Payments
- **Stellar Wallet Integration**: Built-in wallet for receiving and managing cryptocurrency payments
- **Transaction History**: Complete record of all earnings with blockchain verification

### 📊 Contributor Profile
- **Reputation System**: Build reputation score through quality contributions
- **Achievement Badges**: Earn badges for milestones and special contributions
- **Skills Portfolio**: Showcase expertise across different technologies
- **Contribution Analytics**: Detailed insights into contribution patterns and earnings

### 🔔 Communication & Collaboration
- **Task Coversation**: Communicate directly with maintainers about specific tasks
- **Community Features**: Connect with other contributors and share knowledge
- **Support System**: Access help and guidance from the DevAsign community

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Firebase Auth
- **HTTP Client**: Axios
- **Forms**: Formik with Yup validation
- **UI Components**: Custom components with React Icons

## 📋 Prerequisites

### Required Software
- **Node.js** (version 18.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** (version 1.22 or higher)
- **Git** (latest version)

### Required Accounts & Services
- **DevAsign API Server** - Backend server must be running (see [server setup](https://github.com/devasignhq/devasign-api/))
- **Firebase Project** - for authentication services

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/devasignhq/app.devasign.com.git
cd app.devasign.com
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Configure your `.env.local` file with the following variables:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="Q-SFQEFEEWEE"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="api-url"
```

### Step 4: Start the Development Server
```bash
# Start the development server
npm run dev

# The app will be available at http://localhost:3000
```

## 🚀 Running the Application

### Development Mode
```bash
# Start with Turbopack (faster builds)
npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and choose GitHub as your preferred sign-in method
3. Get your Firebase configuration from Project Settings
4. Add the configuration values to your `.env.local` file

### API Server Connection
1. Ensure the DevAsign API server is running (see [server setup](https://github.com/devasignhq/devasign-api/))
2. Update `NEXT_PUBLIC_API_BASE_URL` in your `.env.local` to point to your API server
3. Verify the connection by checking the health endpoint at `/health`


<!-- ## 🚀 Deployment -->

<!-- ## 🤝 Contributing -->

## 📄 License

DevAsign is open-source software licensed under the Apache 2.0 License. See [LICENSE](https://github.com/devasignhq/app.devasign.com/blob/main/LICENSE) for more details.

## 🔗 Related Projects

- [DevAsign API Server](https://github.com/devasignhq/devasign-api) - Backend API and AI engine
- [DevAsign Project Maintainer App](https://github.com/devasignhq/app.devasign.com) - Frontend for project maintainer
- [Soroban Task Escrow Contract](https://github.com/devasignhq/soroban-contract) - Task Escrow Management

<!-- ## 💬 Community -->
