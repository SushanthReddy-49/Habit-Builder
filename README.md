# Habit Builder - AI-Powered Task Management App

A full-stack task management web application with AI-powered task categorization, adaptive scoring, and gamification features.

## 🚀 Features

### Core Features
- **User Authentication**: Secure signup/login with JWT tokens
- **AI-Powered Task Categorization**: Automatic categorization using Google Gemini API
- **Task Review Flow**: Mark yesterday's tasks as done or missed
- **Adaptive Weekly Scoring**: Dynamic point values based on performance
- **Comprehensive Dashboard**: Real-time task tracking and statistics
- **Streaks & Badges**: Gamification elements to boost motivation
- **Enhanced User Experience**: jQuery-powered animations, form validation, and interactive elements

### Technical Features
- **Modern UI**: React with TailwindCSS, Framer Motion animations, and jQuery enhancements
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live task status updates and notifications
- **Enhanced UX**: jQuery-powered animations, form validation, and interactive elements
- **Data Persistence**: MongoDB database with Mongoose ODM
- **RESTful API**: Express.js backend with comprehensive endpoints

## 🛠️ Tech Stack

### Animation & Interaction Stack
This application uses a hybrid approach combining **Framer Motion** and **jQuery** for optimal user experience:

- **Framer Motion**: Handles complex React component animations, page transitions, and gesture-based interactions
- **jQuery**: Provides enhanced DOM manipulation, form validation, toast notifications, and interactive elements
- **Combined Benefits**: 
  - Framer Motion for React-specific animations and transitions
  - jQuery for traditional DOM manipulation and enhanced user interactions
  - Best of both worlds for a polished, professional user experience

### Frontend
- **React 18** - UI framework
- **TailwindCSS** - Styling
- **Framer Motion** - Advanced animations and transitions
- **jQuery** - Enhanced DOM manipulation, form validation, and interactive elements
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications (with jQuery enhancements)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Gemini API** - Task categorization

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (recommended) or local MongoDB
- Google Gemini API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HabitBuilder
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   **For MongoDB Atlas (Recommended):**
   - Follow the [MongoDB Atlas Setup Guide](./MONGODB_ATLAS_SETUP.md)
   - Copy `server/env.example` to `server/.env`
   - Update with your MongoDB Atlas connection string
   
   **For Local MongoDB:**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5100
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/habit-builder-tasks
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   GEMINI_API_KEY=your-gemini-api-key-here
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5100) and frontend (port 3000) servers.

## 🎯 Usage

### Getting Started
1. Open your browser and navigate to `http://localhost:3000`
2. Create an account to get started
3. Start adding tasks - the AI will automatically categorize them
4. Review your tasks daily to mark them as done or missed
5. Check your weekly summary to see your progress

### Task Categories
- **Work**: Professional tasks, meetings, deadlines
- **Health**: Exercise, diet, wellness activities
- **Personal**: Family, hobbies, personal errands
- **Learning**: Studying, reading, skill development

### Adaptive Scoring System
- Each task starts with 10 points
- Weekly performance affects future point values:
  - Poor performance (<50% completion): Points increase
  - High performance (>80% completion): Points decrease slightly
  - Points range: 5-20 per task

### Badges & Achievements
- **First Task**: Complete your first task
- **Streak Badges**: 3, 7, and 30-day streaks
- **Perfect Week**: Complete all tasks in a week

### jQuery-Enhanced Features
- **Smooth Animations**: Fade in/out, slide animations, and counter animations
- **Enhanced Form Validation**: Real-time validation with visual feedback
- **Interactive Confirmations**: Custom styled confirmation dialogs
- **Toast Notifications**: Animated toast messages with jQuery styling
- **Progress Bar Animations**: Smooth progress bar updates with easing
- **Element Highlighting**: Visual feedback for user interactions
- **Enhanced localStorage**: Event-driven localStorage management
- **Keyboard Shortcuts**: Enter/Escape key handlers for better UX
- **DOM Manipulation**: Advanced element addition/removal with animations

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `POST /api/tasks` - Add new task with AI categorization
- `GET /api/tasks` - Get tasks for specific date
- `GET /api/tasks/review` - Get pending review tasks
- `PUT /api/tasks/:id` - Mark task as done/missed
- `DELETE /api/tasks/:id` - Delete task

### Summary
- `GET /api/summary` - Get weekly summary and statistics
- `POST /api/summary/update-points` - Update category points
- `GET /api/summary/streaks` - Get streak information
- `GET /api/summary/badges` - Get user badges

## 🏗️ Project Structure

```
HabitBuilder/
├── server/                 # Backend API
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── services/          # Gemini service
│   └── index.js           # Server entry point
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utilities including jQuery utilities
│   │   └── index.js       # App entry point
│   └── public/            # Static assets
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 Development

### jQuery Utilities
The application includes a comprehensive jQuery utilities file (`client/src/utils/jquery-utils.js`) that provides:
- Enhanced localStorage management with event triggers
- Smooth animations and transitions
- Form validation and error handling
- Toast notifications and confirmations
- Progress bar animations
- Element highlighting and focus management
- Keyboard shortcuts and event handling

### Available Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install-all` - Install dependencies for both frontend and backend
- `npm run build` - Build the frontend for production
- `npm run start` - Start the backend server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.
