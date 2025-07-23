# AI Booking Assistant with Google Calendar Integration

A conversational AI booking agent that integrates with Google Calendar to automatically create appointments when confirmed by users.

## Features

- **Natural Language Processing**: Users can book appointments using natural language
- **Google Calendar Integration**: Automatic calendar event creation with OAuth authentication
- **Interactive Chat Interface**: Modern, responsive chat UI with typing indicators
- **Real-time Availability**: Check Google Calendar availability before booking
- **Secure Authentication**: OAuth 2.0 flow for Google Calendar access

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **FastAPI** (Python)
- **Google Calendar API**
- **OAuth 2.0** authentication

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set application type to "Web application"
   - Add authorized redirect URIs: `http://localhost:5173/auth/callback`
   - Note down the Client ID and Client Secret

### 2. Frontend Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Google OAuth credentials:
   ```
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in your Google OAuth credentials:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
   ```
5. Start the FastAPI server:
   ```bash
   python main.py
   ```

## Usage

1. Open the application in your browser
2. Click "Connect Google Calendar" to authenticate with Google
3. Start chatting with the AI assistant to book appointments
4. When you confirm a booking, it will automatically be added to your Google Calendar

## API Endpoints

- `POST /api/auth/google/callback` - Exchange OAuth code for tokens
- `POST /api/calendar/events` - Create calendar events
- `POST /api/calendar/freebusy` - Check calendar availability
- `GET /api/health` - Health check

## Development

The application is structured with:
- **Frontend**: React components with TypeScript
- **Services**: Separate services for Google Auth and Calendar API
- **Context**: React Context for authentication state management
- **Backend**: FastAPI with Google Calendar API integration

## Security

- OAuth 2.0 flow for secure Google authentication
- Access tokens stored securely in localStorage
- CORS configured for development environment
- HTTPBearer authentication for API endpoints