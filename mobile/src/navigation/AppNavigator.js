import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Theme, { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

// Shared / utility screens
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EnvironmentalHealthScreen from '../screens/health/EnvironmentalHealthScreen';

// Buyer
import BuyerDashboard from '../screens/buyer/BuyerDashboard';
import MarketplaceScreen from '../screens/buyer/MarketplaceScreen';
import PurchaseScreen from '../screens/buyer/PurchaseScreen';
import BuyerCreditsScreen from '../screens/buyer/BuyerCreditsScreen';
import RetireScreen from '../screens/buyer/RetireScreen';
import RetirementsScreen from '../screens/buyer/RetirementsScreen';

// NGO
import NgoDashboard from '../screens/ngo/NgoDashboard';
import NgoProjectsScreen from '../screens/ngo/NgoProjectsScreen';
import ProjectDetailScreen from '../screens/ngo/ProjectDetailScreen';
import CreateProjectWizard from '../screens/ngo/CreateProjectWizard';
import SubmitMrvScreen from '../screens/ngo/SubmitMrvScreen';
import IssueCreditsScreen from '../screens/ngo/IssueCreditsScreen';

// Verifier
import VerifierDashboard from '../screens/verifier/VerifierDashboard';
import VerifierReviewScreen from '../screens/verifier/VerifierReviewScreen';

// Admin
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminLedgerScreen from '../screens/admin/AdminLedgerScreen';
import AdminCreditsScreen from '../screens/admin/AdminCreditsScreen';

// Advisor
import AdvisorDashboard from '../screens/advisor/AdvisorDashboard';

// Standard user
import UserDashboard from '../screens/user/UserDashboard';
import PersonalHealthScreen from '../screens/health/PersonalHealthScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/* ------------------------------ Tab screens ----------------------------- */

function BuyerTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={BuyerDashboard} />
      <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
      <Tab.Screen name="Health" component={EnvironmentalHealthScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function NgoTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={NgoDashboard} />
      <Tab.Screen name="Projects" component={NgoProjectsScreen} />
      <Tab.Screen name="Health" component={EnvironmentalHealthScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function VerifierTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={VerifierDashboard} />
      <Tab.Screen name="Health" component={EnvironmentalHealthScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Control" component={AdminDashboard} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
      <Tab.Screen name="Credits" component={AdminCreditsScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdvisorTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={AdvisorDashboard} />
      <Tab.Screen name="Health" component={EnvironmentalHealthScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function UserTabs() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={UserDashboard} />
      <Tab.Screen name="Market" component={MarketplaceScreen} />
      <Tab.Screen name="Health" component={EnvironmentalHealthScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RoleTabs() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'BUYER':
    case 'USER':
      return user.role === 'BUYER' ? <BuyerTabs /> : <UserTabs />;
    case 'NGO':
      return <NgoTabs />;
    case 'VERIFIER':
      return <VerifierTabs />;
    case 'ADMIN':
      return <AdminTabs />;
    case 'HEALTHCARE_ADVISOR':
      return <AdvisorTabs />;
    default:
      return <UserTabs />;
  }
}

/* -------------------------------- Stacks -------------------------------- */

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={RoleTabs} />
      {/* Buyer */}
      <Stack.Screen name="Purchase" component={PurchaseScreen} />
      <Stack.Screen name="BuyerCredits" component={BuyerCreditsScreen} />
      <Stack.Screen name="Retire" component={RetireScreen} />
      <Stack.Screen name="Retirements" component={RetirementsScreen} />
      {/* NGO */}
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="CreateProject" component={CreateProjectWizard} />
      <Stack.Screen name="SubmitMrv" component={SubmitMrvScreen} />
      <Stack.Screen name="IssueCredits" component={IssueCreditsScreen} />
      <Stack.Screen name="PersonalHealth" component={PersonalHealthScreen} />
      {/* Verifier */}
      <Stack.Screen name="VerifierReview" component={VerifierReviewScreen} />
      {/* Admin */}
      <Stack.Screen name="AdminLedger" component={AdminLedgerScreen} />
    </Stack.Navigator>
  );
}

/* ---------------------------- Tab bar visuals ---------------------------- */

const ICONS = {
  Home: ['home', 'home-outline'],
  Control: ['grid', 'grid-outline'],
  Marketplace: ['storefront', 'storefront-outline'],
  Market: ['storefront', 'storefront-outline'],
  Projects: ['leaf', 'leaf-outline'],
  Credits: ['ribbon', 'ribbon-outline'],
  Users: ['people', 'people-outline'],
  Health: ['heart', 'heart-outline'],
  Alerts: ['notifications', 'notifications-outline'],
  Profile: ['person', 'person-outline'],
};

const TAB_BOTTOM_INSET = 26;

function tabScreenOptions({ route }) {
  const [filled, outline] = ICONS[route.name] || ['ellipse', 'ellipse-outline'];
  return {
    headerShown: false,
    tabBarActiveTintColor: Colors.forest,
    tabBarInactiveTintColor: Colors.textTertiary,
    tabBarIcon: ({ focused, color, size }) => (
      <View style={styles.tabIconWrap}>
        <Ionicons name={focused ? filled : outline} size={22} color={color} />
        {focused ? <View style={styles.tabDot} /> : null}
      </View>
    ),
    tabBarLabel: ({ children, color }) => (
      <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
    ),
    tabBarStyle: [styles.tabBar, { paddingBottom: TAB_BOTTOM_INSET }],
  };
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 88,
    paddingTop: 8,
    backgroundColor: Colors.surface,
    elevation: 0,
  },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center' },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.emerald,
    marginTop: 3,
  },
  tabLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },
});
