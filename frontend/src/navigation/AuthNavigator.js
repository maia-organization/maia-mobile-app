import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { FeedbackScreen } from '../screens/FeedbackScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { PasswordResetRequestScreen } from '../screens/PasswordResetRequestScreen';
import { PasswordResetScreen } from '../screens/PasswordResetScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SessionScreen } from '../screens/SessionScreen';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { colors } from '../theme';
import { MainTabsNavigator } from './MainTabsNavigator';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { clearAuthToken, getAuthToken, saveAuthToken } from '../services/authStorage';
import { completeOnboarding, hasCompletedOnboarding } from '../services/onboardingStorage';

const Stack = createNativeStackNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.ink,
    card: colors.ink,
    primary: colors.rose,
    text: colors.white
  }
};

const linking = {
  config: {
    screens: {
      PasswordReset: 'reset-password'
    }
  },
  prefixes: ['maia://']
};

export function AuthNavigator() {
  const [token, setToken] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const [storedToken, onboardingCompleted] = await Promise.all([
          getAuthToken(),
          hasCompletedOnboarding()
        ]);
        if (isMounted) {
          setToken(storedToken);
          setHasSeenOnboarding(onboardingCompleted);
        }
      } catch {
        if (isMounted) {
          setToken(null);
          setHasSeenOnboarding(false);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAuthenticated = async ({ token: nextToken }) => {
    await saveAuthToken(nextToken);
    setToken(nextToken);
  };

  const handleLogout = async () => {
    await clearAuthToken();
    setToken(null);
  };

  const handleOnboardingCompleted = async () => {
    await completeOnboarding();
    setHasSeenOnboarding(true);
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.honey} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={token ? 'MainTabs' : hasSeenOnboarding ? 'Welcome' : 'Onboarding'}
        screenOptions={{
          animation: reduceMotion ? 'none' : 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.ink },
          headerShown: false
        }}
      >
        <Stack.Screen name="Onboarding">
          {(props) => <OnboardingScreen {...props} onComplete={handleOnboardingCompleted} />}
        </Stack.Screen>
        <Stack.Screen component={WelcomeScreen} name="Welcome" />
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onAuthenticated={handleAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {(props) => <RegisterScreen {...props} onAuthenticated={handleAuthenticated} />}
        </Stack.Screen>
        <Stack.Screen component={PasswordResetRequestScreen} name="PasswordResetRequest" />
        <Stack.Screen component={PasswordResetScreen} name="PasswordReset" />
        <Stack.Screen name="MainTabs">
          {(props) => <MainTabsNavigator {...props} onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen component={SessionScreen} name="Session" />
        <Stack.Screen component={SessionSummaryScreen} name="SessionSummary" />
        <Stack.Screen component={FeedbackScreen} name="Feedback" />
        <Stack.Screen component={StatsScreen} name="Stats" />
        <Stack.Screen component={ProfileSetupScreen} name="ProfileSetup" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: 'center'
  }
});
