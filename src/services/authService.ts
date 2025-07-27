import { supabase } from './supabaseClient';
import { User, UserPreferences } from '../types';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: string;
    airportId?: string;
  }): Promise<{ user: User | null; error: string | null }> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create user account' };
      }

      // Create user profile
      const defaultPreferences: UserPreferences = {
        theme: 'dark',
        alertSettings: {
          voiceAlerts: true,
          emailNotifications: true,
          pushNotifications: true,
          smsAlerts: false,
          alertThreshold: 'medium'
        },
        dashboardLayout: {
          sidebarCollapsed: false,
          activeView: 'dashboard',
          selectedZone: 'terminal-a'
        },
        aiAgents: {
          anomalyDetection: true,
          crowdMonitoring: true,
          securityBreach: true,
          emergencyResponse: true,
          runwayMonitoring: true,
          aircraftTracking: true,
          vehicleMonitoring: true,
          fuelSafety: true,
          perimeterSecurity: true,
          weatherMonitoring: true
        },
        systemSettings: {
          autoRefresh: true,
          refreshInterval: 5000,
          darkMode: true
        }
      };

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role,
          airport_id: userData.airportId || 'default-airport-id',
          preferences: defaultPreferences,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        airportId: profileData.airport_id,
        preferences: profileData.preferences,
        createdAt: new Date(profileData.created_at),
        lastLogin: new Date(profileData.last_login)
      };

      this.currentUser = user;
      this.storeUserSession(user);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return { user: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, error: 'Authentication failed' };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return { user: null, error: profileError.message };
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id);

      const user: User = {
        id: profileData.id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role,
        airportId: profileData.airport_id,
        preferences: profileData.preferences,
        createdAt: new Date(profileData.created_at),
        lastLogin: new Date()
      };

      this.currentUser = user;
      this.storeUserSession(user);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: (error as Error).message };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }

      this.currentUser = null;
      this.clearUserSession();
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Check for stored session
    const storedUser = this.getStoredUserSession();
    if (storedUser) {
      this.currentUser = storedUser;
      return storedUser;
    }

    // Check Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        const user: User = {
          id: profileData.id,
          email: profileData.email,
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          role: profileData.role,
          airportId: profileData.airport_id,
          preferences: profileData.preferences,
          createdAt: new Date(profileData.created_at),
          lastLogin: new Date(profileData.last_login)
        };

        this.currentUser = user;
        this.storeUserSession(user);
        return user;
      }
    }

    return null;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<{ error: string | null }> {
    if (!this.currentUser) {
      return { error: 'No authenticated user' };
    }

    try {
      const updatedPreferences = { ...this.currentUser.preferences, ...preferences };

      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', this.currentUser.id);

      if (error) {
        return { error: error.message };
      }

      this.currentUser.preferences = updatedPreferences;
      this.storeUserSession(this.currentUser);

      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }

  private storeUserSession(user: User): void {
    localStorage.setItem('safetwin_user', JSON.stringify(user));
    localStorage.setItem('safetwin_session', JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    }));
  }

  private getStoredUserSession(): User | null {
    try {
      const storedUser = localStorage.getItem('safetwin_user');
      const storedSession = localStorage.getItem('safetwin_session');

      if (!storedUser || !storedSession) {
        return null;
      }

      const session = JSON.parse(storedSession);
      const now = Date.now();
      const sessionAge = now - session.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (sessionAge > maxAge) {
        this.clearUserSession();
        return null;
      }

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }

  private clearUserSession(): void {
    localStorage.removeItem('safetwin_user');
    localStorage.removeItem('safetwin_session');
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getUserRole(): string | null {
    return this.currentUser?.role || null;
  }

  getUserAirport(): string | null {
    return this.currentUser?.airportId || null;
  }
}

export const authService = AuthService.getInstance();