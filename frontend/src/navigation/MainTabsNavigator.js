import { useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { CycleScreen } from '../screens/CycleScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlanningScreen } from '../screens/PlanningScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { colors, fonts, spacing } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Tab = createBottomTabNavigator();

const tabs = [
  { label: 'Accueil', name: 'Home' },
  { label: 'Cycle', name: 'Cycle' },
  { label: 'Planning', name: 'Planning' },
  { label: 'Stats', name: 'Stats' },
  { label: 'Profil', name: 'Profile' }
];

function BottomNavigation({ descriptors, insets, navigation, state }) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.tabBar, { paddingBottom: Math.max(insets?.bottom || 0, spacing.sm) }]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const label = options.tabBarLabel || options.title || route.name;

        const handlePress = () => {
          const event = navigation.emit({
            canPreventDefault: true,
            target: route.key,
            type: 'tabPress'
          });

          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            accessibilityLabel={`Aller à ${label}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isFocused }}
            key={route.key}
            onPress={handlePress}
            style={({ pressed }) => [
              styles.tab,
              isFocused && styles.tabActive,
              pressed && styles.tabPressed
            ]}
          >
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SwipeableTabScreen({ children, navigation, route }) {
  const routeIndex = tabs.findIndex((tab) => tab.name === route.name);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dx) > 18 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) < 72 || Math.abs(gesture.dx) < Math.abs(gesture.dy) * 1.5) {
            return;
          }

          const nextIndex = routeIndex + (gesture.dx < 0 ? 1 : -1);
          if (tabs[nextIndex]) navigation.navigate(tabs[nextIndex].name);
        }
      }),
    [navigation, routeIndex]
  );

  return (
    <View {...panResponder.panHandlers} style={styles.tabScreen}>
      {children}
    </View>
  );
}

function HomeTab({ onLogout, ...props }) {
  return (
    <SwipeableTabScreen {...props}>
      <HomeScreen {...props} onLogout={onLogout} />
    </SwipeableTabScreen>
  );
}

function CycleTab(props) {
  return (
    <SwipeableTabScreen {...props}>
      <CycleScreen {...props} />
    </SwipeableTabScreen>
  );
}

function PlanningTab(props) {
  return (
    <SwipeableTabScreen {...props}>
      <PlanningScreen {...props} />
    </SwipeableTabScreen>
  );
}

function StatsTab(props) {
  return (
    <SwipeableTabScreen {...props}>
      <StatsScreen {...props} />
    </SwipeableTabScreen>
  );
}

function ProfileTab(props) {
  return (
    <SwipeableTabScreen {...props}>
      <ProfileScreen {...props} />
    </SwipeableTabScreen>
  );
}

export function MainTabsNavigator({ onLogout }) {
  const reduceMotion = useReducedMotion();

  return (
    <Tab.Navigator
      screenOptions={{
        animation: reduceMotion ? 'none' : 'fade',
        headerShown: false,
        tabBarHideOnKeyboard: false
      }}
      tabBar={(props) => <BottomNavigation {...props} />}
    >
      <Tab.Screen name="Home" options={{ tabBarLabel: 'Accueil' }}>
        {(props) => <HomeTab {...props} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen component={CycleTab} name="Cycle" options={{ tabBarLabel: 'Cycle' }} />
      <Tab.Screen component={PlanningTab} name="Planning" options={{ tabBarLabel: 'Planning' }} />
      <Tab.Screen component={StatsTab} name="Stats" options={{ tabBarLabel: 'Stats' }} />
      <Tab.Screen component={ProfileTab} name="Profile" options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm
  },
  tab: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm
  },
  tabActive: {
    backgroundColor: colors.honey
  },
  tabLabel: {
    color: colors.cream,
    fontFamily: fonts.strong,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center'
  },
  tabLabelActive: {
    color: colors.ink
  },
  tabPressed: {
    opacity: 0.72
  },
  tabScreen: {
    flex: 1
  }
});
