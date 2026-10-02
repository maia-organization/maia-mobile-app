import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { colors } from '../theme';
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

export function AuthNavigator() {
  const [token, setToken] = useState(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

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
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={token ? 'Home' : hasSeenOnboarding ? 'Welcome' : 'Onboarding'}
        screenOptions={{
          animation: 'fade_from_bottom',
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
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} onLogout={handleLogout} />}
        </Stack.Screen>
        <Stack.Screen component={ProfileSetupScreen} name="ProfileSetup" />
        <Stack.Screen component={ProfileScreen} name="Profile" />
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
