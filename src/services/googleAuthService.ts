import toast from 'react-hot-toast';

class GoogleAuthService {
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  private redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173';
  private scope =
    'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

  initiateGoogleAuth(): void {
    if (!this.clientId) {
      alert('Google Client ID not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file');
      return;
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', this.scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'select_account consent');

    window.location.href = authUrl.toString();
  }

  async exchangeCodeForTokens(code: string) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
          redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  async createCalendarEvent(accessToken: string, event: any) {
    try {
      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create calendar event');
      }

      const data = await response.json();
      toast.success('✅ Event added to Google Calendar!');
      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      toast.error('❌ Failed to add event to Google Calendar');
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_user_info');
  }

  getStoredAuth(): any {
    const accessToken = localStorage.getItem('google_access_token');
    const userInfo = localStorage.getItem('google_user_info');

    if (accessToken && userInfo) {
      return {
        accessToken,
        user: JSON.parse(userInfo),
        isAuthenticated: true,
      };
    }

    return {
      accessToken: null,
      user: null,
      isAuthenticated: false,
    };
  }

  storeAuth(accessToken: string, refreshToken: string, userInfo: any): void {
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_refresh_token', refreshToken);
    localStorage.setItem('google_user_info', JSON.stringify(userInfo));
  }
}

export const googleAuthService = new GoogleAuthService();
