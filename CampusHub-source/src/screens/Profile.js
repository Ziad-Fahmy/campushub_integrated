import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.nameText}>{user?.name || 'User'}</Text>
        <Text style={styles.emailText}>{user?.email || 'user@university.edu'}</Text>
        <View style={styles.roleContainer}>
          <Text style={[
            styles.roleText, 
            user?.role === 'admin' && styles.adminRoleText
          ]}>
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </Text>
          {user?.role === 'admin' && (
            <Text style={styles.adminBadge}>ADMIN</Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        {user?.role === 'admin' ? (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Admin ID:</Text>
              <Text style={styles.infoValue}>{user?.adminId || user?.studentId || 'ADM001'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>Administration</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Position:</Text>
              <Text style={styles.infoValue}>System Administrator</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Access Level:</Text>
              <Text style={styles.infoValue}>Full Access</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student ID:</Text>
              <Text style={styles.infoValue}>{user?.studentId || '12345678'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>Computer Science</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Year:</Text>
              <Text style={styles.infoValue}>3rd Year</Text>
            </View>
          </>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {user?.role === 'admin' ? 'Admin Settings' : 'App Settings'}
        </Text>
        {user?.role === 'admin' && (
          <>
            <Button 
              mode="outlined" 
              icon="account-group"
              style={styles.settingButton}
            >
              User Management
            </Button>
            <Button 
              mode="outlined" 
              icon="cog"
              style={styles.settingButton}
            >
              System Configuration
            </Button>
            <Button 
              mode="outlined" 
              icon="chart-line"
              style={styles.settingButton}
            >
              Analytics & Reports
            </Button>
          </>
        )}
        <Button 
          mode="outlined" 
          icon="bell-outline"
          style={styles.settingButton}
        >
          Notification Settings
        </Button>
        <Button 
          mode="outlined" 
          icon="shield-account-outline"
          style={styles.settingButton}
        >
          Privacy Settings
        </Button>
        <Button 
          mode="outlined" 
          icon="help-circle-outline"
          style={styles.settingButton}
        >
          Help & Support
        </Button>
      </View>
      
      <Button 
        mode="contained" 
        icon="logout"
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        Logout
      </Button>
      
      <Text style={styles.versionText}>CampusHub v1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  adminRoleText: {
    color: '#D32F2F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  adminBadge: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingButton: {
    marginBottom: 8,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: '#D32F2F',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#999',
    fontSize: 12,
  },
});

export default ProfileScreen;
