import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type ProfileNavigationProp = StackNavigationProp<any>;

export default function ProfileScreen() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigation = useNavigation<ProfileNavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    // Trigger auth flow by logging out (which will show auth screens)
    navigation.navigate('PhoneInput');
  };

  // Guest Profile View
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Login Card */}
          <View style={styles.loginCard}>
            <View style={styles.loginIconContainer}>
              <Ionicons name="person-circle-outline" size={40} color="#FF0000" />
            </View>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.loginSubtext}>
              This helps you receive partnered discounts and track your orders
            </Text>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="notifications-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Notification</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="language-outline" size={22} color="#FF0000" />
              <Text style={styles.menuText}>Language</Text>
              <Text style={styles.menuValue}>English</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Privacy policy</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="document-text-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="headset-outline" size={22} color="#333" />
              <Text style={styles.menuText}>Customer Service</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="information-circle-outline" size={22} color="#333" />
              <Text style={styles.menuText}>About us</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Member Profile View
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Hala Mira Customer'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+201002389294'}</Text>
          </View>
        </View>

        {/* Complete Profile Banner (if profile incomplete) */}
        {(!user?.email || user?.email === '') && (
          <TouchableOpacity style={styles.completeProfileBanner}>
            <Text style={styles.completeProfileText}>Complete Your Profile!</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </TouchableOpacity>
        )}

        {/* Wallet & Points */}
        <View style={styles.walletContainer}>
          <View style={styles.walletItem}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet-outline" size={24} color="#FF0000" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Wallet</Text>
              <Text style={styles.walletValue}>23.00 EGP</Text>
            </View>
          </View>

          <View style={styles.walletDivider} />

          <View style={styles.walletItem}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="gift-outline" size={24} color="#FF0000" />
            </View>
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Points</Text>
              <Text style={styles.walletValue}>28374 pt</Text>
            </View>
          </View>
        </View>

        {/* My Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="bag-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Buy again</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star-outline" size={22} color="#FF0000" />
            <Text style={styles.menuText}>Favorite</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('SavedAddresses')}
          >
            <Ionicons name="location-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Saved Cards</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Notification</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="language-outline" size={22} color="#FF0000" />
            <Text style={styles.menuText}>Language</Text>
            <Text style={styles.menuValue}>English</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Privacy policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="headset-outline" size={22} color="#333" />
            <Text style={styles.menuText}>Customer Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={22} color="#333" />
            <Text style={styles.menuText}>About us</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#FF0000" />
            <Text style={[styles.menuText, { color: '#FF0000' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  loginCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  loginIconContainer: {
    marginBottom: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loginSubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  userCard: {
    backgroundColor: '#1A1A1A',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  editBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
  },
  completeProfileBanner: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  completeProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
  },
  walletContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  walletValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  walletDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  menuValue: {
    fontSize: 14,
    color: '#FF0000',
    marginRight: 4,
  },
});
