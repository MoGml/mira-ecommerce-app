import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import SubCategoriesScreen from '../screens/SubCategoriesScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DiscountsScreen from '../screens/DiscountsScreen';

// Types
export type RootTabParamList = {
  Home: undefined;
  Categories: undefined;
  Discounts?: undefined; // Optional tab
  Bag: undefined;
  Profile: undefined;
};

export type CategoriesStackParamList = {
  CategoriesList: undefined;
  SubCategories: {
    categoryId: string;
    categoryName: string;
  };
};

export type BagStackParamList = {
  Cart: undefined;
  Checkout: {
    cartItems: any[];
    shipmentType?: 'express' | 'scheduled';
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const CategoriesStack = createStackNavigator<CategoriesStackParamList>();
const BagStack = createStackNavigator<BagStackParamList>();

// Categories Stack Navigator
function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator>
      <CategoriesStack.Screen 
        name="CategoriesList" 
        component={CategoriesScreen}
        options={{ title: 'Categories' }}
      />
      <CategoriesStack.Screen 
        name="SubCategories" 
        component={SubCategoriesScreen}
        options={{ headerShown: false }}
      />
    </CategoriesStack.Navigator>
  );
}

// Bag Stack Navigator
function BagStackNavigator() {
  return (
    <BagStack.Navigator>
      <BagStack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ headerShown: false }}
      />
      <BagStack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
    </BagStack.Navigator>
  );
}

// Custom Bag Icon Component using Ionicons with custom styling
const BagIcon = ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
  // Using bag-handle icon which is similar to shopping bag
  return (
    <Ionicons 
      name={focused ? "bag-handle" : "bag-handle-outline"} 
      size={size} 
      color={color} 
    />
  );
};

// Main Tab Navigator
export default function AppNavigator() {
  const showDiscountsTab = false; // This will be controlled by API call later

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === 'Bag') {
              return <BagIcon focused={focused} color={color} size={size} />;
            }

            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Categories') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'Discounts') {
              iconName = focused ? 'pricetag' : 'pricetag-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF0000',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#FF0000',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen 
          name="Categories" 
          component={CategoriesStackNavigator}
          options={{ headerShown: false }}
        />
        {showDiscountsTab && (
          <Tab.Screen 
            name="Discounts" 
            component={DiscountsScreen}
            options={{ title: 'Discounts' }}
          />
        )}
        <Tab.Screen 
          name="Bag" 
          component={BagStackNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
