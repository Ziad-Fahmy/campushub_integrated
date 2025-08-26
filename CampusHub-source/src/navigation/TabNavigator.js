import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Import screens
import Dashboard from '../screens/Dashboard';
import FacilitiesList from '../screens/booking/FacilitiesList';
import FacilityDetails from '../screens/booking/FacilityDetails';
import FacilityBookingForm from '../screens/booking/FacilityBookingForm';
import FacilityBookingManagement from '../screens/booking/FacilityBookingManagement';
import ClassroomMap from '../screens/classrooms/ClassroomMap';
import EventsList from '../screens/events/EventsList';
import EventDetails from '../screens/events/EventDetails';
import EventRegistrationScreen from '../screens/events/EventRegistrationScreen';
import AddEventScreen from '../screens/events/AddEventScreen';
import EventRegistrationManagement from '../screens/events/EventRegistrationManagement';
import RestaurantsList from '../screens/food/RestaurantsList';
import RestaurantDetails from '../screens/food/RestaurantDetails';
import MenuManagement from '../screens/food/MenuManagement';
import NewComplaint from '../screens/complaints/NewComplaint';
import ComplaintHistoryScreen from '../screens/complaints/ComplaintHistoryScreen';
import ChatInterface from '../screens/chatbot/ChatInterface';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Tab = createBottomTabNavigator();
const ProfileStack = createStackNavigator();
const FacilitiesStack = createStackNavigator();
const EventsStack = createStackNavigator();
const FoodStack = createStackNavigator();

// Profile stack
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#003366' }, headerTintColor: '#fff' }}>
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
  </ProfileStack.Navigator>
);

const FacilitiesStackNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <FacilitiesStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#003366' }, headerTintColor: '#fff' }}>
      <FacilitiesStack.Screen name="FacilitiesList" component={FacilitiesList} options={{ headerShown: false }} />
      <FacilitiesStack.Screen name="FacilityDetails" component={FacilityDetails} options={{ title: 'Facility Details' }} />
      <FacilitiesStack.Screen name="FacilityBookingForm" component={FacilityBookingForm} options={{ title: 'Book Facility' }} />
      {isAdmin && (
        <FacilitiesStack.Screen 
          name="FacilityBookingManagement" 
          component={FacilityBookingManagement} 
          options={{ title: 'Booking Management' }} 
        />
      )}
    </FacilitiesStack.Navigator>
  );
};

const EventsStackNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <EventsStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#003366' }, headerTintColor: '#fff' }}>
      <EventsStack.Screen name="EventsList" component={EventsList} options={{ headerShown: false }} />
      <EventsStack.Screen name="EventDetails" component={EventDetails} options={{ title: 'Event Details' }} />
      <EventsStack.Screen name="AddEvent" component={AddEventScreen} options={{ title: 'Add New Event' }} />
      <EventsStack.Screen name="EventRegistration" component={EventRegistrationScreen} options={{ title: 'Event Registration' }} />
      {isAdmin && (
        <EventsStack.Screen 
          name="EventRegistrationManagement" 
          component={EventRegistrationManagement} 
          options={{ title: 'Registration Management' }} 
        />
      )}
    </EventsStack.Navigator>
  );
};

const FoodStackNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <FoodStack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#003366' }, headerTintColor: '#fff' }}>
      <FoodStack.Screen name="RestaurantsList" component={RestaurantsList} options={{ headerShown: false }} />
      <FoodStack.Screen name="RestaurantDetails" component={RestaurantDetails} options={{ title: 'Restaurant Details' }} />
      {isAdmin && (
        <FoodStack.Screen 
          name="MenuManagement" 
          component={MenuManagement} 
          options={{ title: 'Menu Management' }} 
        />
      )}
    </FoodStack.Navigator>
  );
};

const TabNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#003366', tabBarInactiveTintColor: '#888' }}>
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarLabel: isAdmin ? 'Admin Panel' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name={isAdmin ? 'shield-account' : 'home'} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="Facilities"
        component={FacilitiesStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: isAdmin ? 'Manage Facilities' : 'Facilities',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="basketball" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Classrooms"
        component={ClassroomMap}
        options={{
          tabBarLabel: isAdmin ? 'Manage Rooms' : 'Classrooms',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="google-classroom" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: isAdmin ? 'Manage Events' : 'Events',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Food"
        component={FoodStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: isAdmin ? 'Manage Food' : 'Food',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food-fork-drink" color={color} size={size} />
          ),
        }}
      />
      
      {/* Complaints Tab - Different behavior for admin vs user */}
      {isAdmin ? (
        // Admin only sees complaint history, no submission
        <Tab.Screen
          name="ComplaintHistory"
          component={ComplaintHistoryScreen}
          options={{
            tabBarLabel: 'Complaints',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="message-alert" color={color} size={size} />
            ),
          }}
        />
      ) : (
        // Users can submit complaints
        <Tab.Screen
          name="Complaints"
          component={NewComplaint}
          options={{
            tabBarLabel: 'Complaints',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="message-alert" color={color} size={size} />
            ),
          }}
        />
      )}
      {/* 
        here we can conditionally render the ComplaintHistoryScreen for users
        but we already have a separate tab for it, so we don't need to duplicate it.
      */}
      {/* History tab only for users */}
      {!isAdmin && (
        <Tab.Screen
          name="ComplaintHistory"
          component={ComplaintHistoryScreen}
          options={{
            tabBarLabel: 'History',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="history" color={color} size={size} />
            ),
          }}
        />
      )}
      
      <Tab.Screen
        name="Chatbot"
        component={ChatInterface}
        options={{
          tabBarLabel: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="robot" color={color} size={size} />
          ),
        }}
      />
      
      {/* Account Centre - RESTORED */}
      <Tab.Screen
        name="Account"
        component={ProfileStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: isAdmin ? 'Admin Account' : 'Account',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons 
              name={isAdmin ? 'account-star' : 'account-circle'} 
              color={color} 
              size={size} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

// 