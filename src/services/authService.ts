import { supabase } from './supabaseClient';
import { User, UserPreferences } from '../types';
import bcrypt from 'bcryptjs';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private isDemoMode: boolean = false;
  private demoUsers: Map<string, any> = new Map();

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
      AuthService.instance.initializeDemoMode();
    }
    return AuthService.instance;
  }

  private initializeDemoMode(): void {
    // Initialize demo users
    const demoPassword = bcrypt.hashSync('demo123', 10);
    this.demoUsers.set('demo@safetwin.com', {
      id: 'demo-user-id',
      email: 'demo@safetwin.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'security_chief',
      airportId: 'default-airport-id'
    });
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('airports').select('id').limit(1);
      return !error;
    } catch (error) {
      console.warn('Database connection failed, switching to demo mode');
      this.isDemoMode = true;
      return false;
    }
  }

  async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: string;
    airportId?: string;
  }): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if database is available
      const isConnected = await this.checkDatabaseConnection();
      
      if (!isConnected) {
        return this.handleDemoSignUp(email, password, userData);
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
      console.error('Sign up error:', error);
      return this.handleDemoSignUp(email, password, userData);
    }
  }

  private async handleDemoSignUp(email: string, password: string, userData: any): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if user already exists in demo mode
      if (this.demoUsers.has(email)) {
        return { user: null, error: 'User already exists. Please try logging in instead.' };
      }

      // Create demo user
      const hashedPassword = bcrypt.hashSync(password, 10);
      const userId = `demo-${Date.now()}`;
      
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

      const demoUserData = {
        id: userId,
        email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        airportId: userData.airportId || 'default-airport-id'
      };

      this.demoUsers.set(email, demoUserData);

      const user: User = {
        id: userId,
        email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        airportId: userData.airportId || 'default-airport-id',
        preferences: defaultPreferences,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      this.currentUser = user;
      this.storeUserSession(user);
      
      // Store in localStorage for demo persistence
      localStorage.setItem('safetwin_demo_users', JSON.stringify(Array.from(this.demoUsers.entries())));

      return { user, error: null };
    } catch (error) {
      console.error('Demo sign up error:', error);
      return { user: null, error: 'Failed to create demo account. Please try again.' };
    }
  }

  async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Check if database is available
      const isConnected = await this.checkDatabaseConnection();
      
      if (!isConnected) {
        return this.handleDemoSignIn(email, password);
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
      return this.handleDemoSignIn(email, password);
    }
  }

  private async handleDemoSignIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      // Load demo users from localStorage
      const storedDemoUsers = localStorage.getItem('safetwin_demo_users');
      if (storedDemoUsers) {
        const demoUsersArray = JSON.parse(storedDemoUsers);
        this.demoUsers = new Map(demoUsersArray);
      }

      const demoUser = this.demoUsers.get(email);
      if (!demoUser) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = bcrypt.compareSync(password, demoUser.password);
      if (!isValidPassword) {
        return { user: null, error: 'Invalid email or password' };
      }

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

      const user: User = {
        id: demoUser.id,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        role: demoUser.role,
        airportId: demoUser.airportId,
        preferences: defaultPreferences,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      this.currentUser = user;
      this.storeUserSession(user);

      return { user, error: null };
    } catch (error) {
      console.error('Demo sign in error:', error);
      return { user: null, error: 'Failed to sign in. Please try again.' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      if (!this.isDemoMode) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          return { error: error.message };
        }
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

    // Only check Supabase session if not in demo mode
    if (!this.isDemoMode) {
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
        console.warn('Supabase session check failed, continuing in demo mode');
        this.isDemoMode = true;
      }
    }

    return null;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<{ error: string | null }> {
    if (!this.currentUser) {
      return { error: 'No authenticated user' };
    }

    try {
      if (!this.isDemoMode) {
        const updatedPreferences = { ...this.currentUser.preferences, ...preferences };

        const { error } = await supabase
          .from('user_profiles')
          .update({ preferences: updatedPreferences })
          .eq('id', this.currentUser.id);

        if (error) {
          console.warn('Failed to update preferences in database, saving locally');
        }
      }

      // Always update local preferences
      const updatedPreferences = { ...this.currentUser.preferences, ...preferences };
      this.currentUser.preferences = updatedPreferences;
      this.storeUserSession(this.currentUser);
      
      // Also save to localStorage for immediate access
      localStorage.setItem(`safetwin_settings_${this.currentUser.id}`, JSON.stringify(updatedPreferences));

      return { error: null };
    } catch (error) {
      console.error('Update preferences error:', error);
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