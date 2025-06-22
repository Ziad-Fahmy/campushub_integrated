import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Avatar, Title, Caption, Text, Button, Card, Divider, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { logout } from '../../redux/slices/authSlice';

const SettingsScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: () => dispatch(logout())
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'DU'} 
          backgroundColor="#003366" 
        />
        <View style={styles.headerText}>
          <Title style={styles.name}>{user?.name || 'Demo User'}</Title>
          <Caption style={styles.role}>{user?.role || 'Student'}</Caption>
          <Caption style={styles.email}>{user?.email || 'demo@university.edu'}</Caption>
        </View>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Settings</Title>
          <Divider style={styles.divider} />
          
          <List.Item
            title="View Profile"
            description="See your personal information"
            left={props => <List.Icon {...props} icon="account" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Profile')}
            style={styles.listItem}
          />
          
          <List.Item
            title="Edit Profile"
            description="Update your personal information"
            left={props => <List.Icon {...props} icon="account-edit" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.listItem}
          />
          
          <List.Item
            title="Change Password"
            description="Update your account password"
            left={props => <List.Icon {...props} icon="lock-reset" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>App Settings</Title>
          <Divider style={styles.divider} />
          
          <List.Item
            title="Notifications"
            description="Manage your notification preferences"
            left={props => <List.Icon {...props} icon="bell" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert("Notifications", "Notification settings would be implemented here")}
            style={styles.listItem}
          />
          
          <List.Item
            title="Privacy"
            description="Manage your privacy settings"
            left={props => <List.Icon {...props} icon="shield-account" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert("Privacy", "Privacy settings would be implemented here")}
            style={styles.listItem}
          />
          
          <List.Item
            title="Help & Support"
            description="Get help with using the app"
            left={props => <List.Icon {...props} icon="help-circle" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert("Help & Support", "Help and support would be implemented here")}
            style={styles.listItem}
          />
          
          <List.Item
            title="About"
            description="App version and information"
            left={props => <List.Icon {...props} icon="information" color="#003366" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert("About", "CampusHub v1.0.0")}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>
      
      <Button 
        mode="contained" 
        icon="logout" 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    marginLeft: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003366',
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  email: {
    fontSize: 12,
    color: '#888',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 5,
  },
  divider: {
    marginBottom: 10,
  },
  listItem: {
    paddingVertical: 8,
  },
  signOutButton: {
    margin: 20,
    backgroundColor: '#d32f2f',
  }
});

export default SettingsScreen;
