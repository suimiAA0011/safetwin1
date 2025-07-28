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
    preferences?: any;
    zones?: string[];
  }): Promise<{ user: User | null; error: string | null }> {
    try {
      // Try to check backend connection, but don't fail if unavailable
      try {
        await this.checkBackendConnection();
      } catch (error) {
        console.warn('Backend unavailable, proceeding with local storage fallback');
        return this.createLocalUser(email, password, userData);
      }

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
      const userPreferences: UserPreferences = userData.preferences || {
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
          preferences: userPreferences,
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
        preferences: userPreferences,
        createdAt: new Date(profileData.created_at),
        lastLogin: new Date(profileData.last_login)
      };

      this.currentUser = user;
      this.storeUserSession(user);

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.warn('Network error during signup, using local fallback');
        return this.createLocalUser(email, password, userData);
      }
      return { user: null, error: (error as Error).message };
    }
  }

  private async createLocalUser(email: string, password: string, userData: any): Promise<{ user: User | null; error: string | null }> {
    try {
      // Create a local user for demo/offline mode
      const userId = `local-${Date.now()}`;
      
      const userPreferences: UserPreferences = userData.preferences || {
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
          darkMode: true,
          simulationMode: true
        }
      };

      const user: User = {
        id: userId,
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        airportId: userData.airportId || 'default-airport-id',
        preferences: userPreferences,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      // Store in localStorage for demo mode
      localStorage.setItem('safetwin_demo_user', JSON.stringify(user));
      localStorage.setItem('safetwin_demo_credentials', JSON.stringify({ email, password }));
      
      this.currentUser = user;
      this.storeUserSession(user);

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to create demo account' };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Try to check backend connection, but don't fail if unavailable
      try {
        await this.checkBackendConnection();
      } catch (error) {
        console.warn('Backend unavailable, checking local storage');
        return this.signInLocal(email, password);
      }

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
      console.error('Sign in error:', error);
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        console.warn('Network error during signin, trying local fallback');
        return this.signInLocal(email, password);
      }
      return { user: null, error: (error as Error).message };
    }
  }

  private async signInLocal(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check for demo credentials
      const demoCredentials = localStorage.getItem('safetwin_demo_credentials');
      const demoUser = localStorage.getItem('safetwin_demo_user');
      
      if (demoCredentials && demoUser) {
        const credentials = JSON.parse(demoCredentials);
        if (credentials.email === email && credentials.password === password) {
          const user = JSON.parse(demoUser);
          user.lastLogin = new Date();
          
          this.currentUser = user;
          this.storeUserSession(user);
          
          return { user, error: null };
        }
      }
      
      // Check for demo account
      if (email === 'demo@safetwin.com' && password === 'demo123') {
        const demoUser: User = {
          id: 'demo-user',
          email: 'demo@safetwin.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'security_chief',
          airportId: 'default-airport-id',
          preferences: {
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
              darkMode: true,
              simulationMode: true
            }
          },
          createdAt: new Date(),
          lastLogin: new Date()
        };
        
        this.currentUser = demoUser;
        this.storeUserSession(demoUser);
        
        return { user: demoUser, error: null };
      }
      
      return { user: null, error: 'Invalid credentials or server unavailable' };
    } catch (error) {
      return { user: null, error: 'Authentication failed' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('Supabase signout error:', error);
        }
      } catch (error) {
        console.warn('Supabase unavailable during signout, proceeding with local cleanup');
      }

      this.currentUser = null;
      this.clearUserSession();
      return { error: null };
    } catch (error) {
      return { error: (error as Error).message };
    }
  }
  private async checkBackendConnection(): Promise<void> {
    try {
      // Test connection to Supabase with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
      
      const queryPromise = supabase.from('airports').select('id').limit(1);
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error && (error.message.includes('fetch') || error.message.includes('network'))) {
        throw new Error('Backend connection failed');
      }
    } catch (error) {
      console.error('Backend connection check failed:', error);
      throw new Error('Backend connection failed');
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

    // Try to check Supabase session
    try {
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
    } catch (error) {
      console.warn('Failed to check Supabase session, user may be in offline mode');
    }

    return null;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<{ error: string | null }> {
    if (!this.currentUser) {
      return { error: 'No authenticated user' };
    }

    try {
      const updatedPreferences = { ...this.currentUser.preferences, ...preferences };

      // Try to update in database, but don't fail if unavailable
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', this.currentUser.id);

        if (error) {
          console.warn('Failed to update preferences in database:', error);
        }
      } catch (error) {
        console.warn('Database unavailable, updating preferences locally only');
      }

      this.currentUser.preferences = updatedPreferences;
      this.storeUserSession(this.currentUser);
      
      // Also save to localStorage for immediate access
      localStorage.setItem(`safetwin_settings_${this.currentUser.id}`, JSON.stringify(updatedPreferences));

      return { error: null };
    } catch (error) {
      console.error('Update preferences error:', error);
      // Still update locally even if database fails
      const updatedPreferences = { ...this.currentUser.preferences, ...preferences };
      this.currentUser.preferences = updatedPreferences;
      this.storeUserSession(this.currentUser);
      localStorage.setItem(`safetwin_settings_${this.currentUser.id}`, JSON.stringify(updatedPreferences));
      
      return { error: null };
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