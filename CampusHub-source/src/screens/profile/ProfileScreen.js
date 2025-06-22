import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Caption, Text, Button, Card, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  
  // In a real app, this would come from the API
  const userDetails = {
    id: user?.id || '1',
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@university.edu',
    role: user?.role || 'Student',
    department: user?.role === 'admin' ? 'Administration' : 'Computer Science',
    studentId: user?.role === 'admin' ? 'ADM001' : 'CS2025001',
    joinDate: user?.role === 'admin' ? 'January 2020' : 'September 2023',
    contactNumber: '+1 (555) 123-4567',
    address: user?.role === 'admin' ? 'Admin Office, Building A' : '123 University Ave, Campus Housing Block B',
    emergencyContact: 'Jane Doe (+1 555-987-6543)',
    courses: user?.role === 'admin' ? [] : [
      'CS301: Advanced Programming',
      'CS405: Artificial Intelligence',
      'MATH202: Linear Algebra'
    ],
    activities: user?.role === 'admin' ? [
      'Faculty Senate',
      'Academic Committee',
      'Campus Safety Board'
    ] : [
      'Coding Club',
      'Debate Society',
      'Basketball Team'
    ],
    adminResponsibilities: user?.role === 'admin' ? [
      'User Account Management',
      'System Configuration',
      'Campus Facility Oversight',
      'Event Coordination',
      'Student Services Management'
    ] : []
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={userDetails.name.split(' ').map(n => n[0]).join('')} 
          backgroundColor={user?.role === 'admin' ? '#D32F2F' : '#003366'} 
        />
        <View style={styles.headerText}>
          <Title style={styles.name}>{userDetails.name}</Title>
          {user?.role === 'admin' && (
            <Text style={styles.adminBadge}>ADMINISTRATOR</Text>
          )}
          <Caption style={styles.role}>
            {user?.role === 'admin' ? 'System Administrator' : userDetails.role} • {userDetails.department}
          </Caption>
          <Caption style={styles.id}>
            ID: {userDetails.studentId}
          </Caption>
        </View>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Icon name="email" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{userDetails.email}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="phone" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{userDetails.contactNumber}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="home" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{userDetails.address}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="account-alert" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Emergency:</Text>
            <Text style={styles.infoValue}>{userDetails.emergencyContact}</Text>
          </View>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            {user?.role === 'admin' ? 'Administrative Information' : 'Academic Information'}
          </Title>
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Icon name="school" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{userDetails.department}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#003366" style={styles.icon} />
            <Text style={styles.infoLabel}>Joined:</Text>
            <Text style={styles.infoValue}>{userDetails.joinDate}</Text>
          </View>
          
          {user?.role === 'admin' ? (
            <>
              <Text style={styles.subSectionTitle}>Administrative Responsibilities</Text>
              {userDetails.adminResponsibilities.map((responsibility, index) => (
                <View key={index} style={styles.listItem}>
                  <Icon name="shield-check" size={16} color="#D32F2F" style={styles.listIcon} />
                  <Text>{responsibility}</Text>
                </View>
              ))}
            </>
          ) : (
            <>
              <Text style={styles.subSectionTitle}>Current Courses</Text>
              {userDetails.courses.map((course, index) => (
                <View key={index} style={styles.listItem}>
                  <Icon name="book-open-variant" size={16} color="#003366" style={styles.listIcon} />
                  <Text>{course}</Text>
                </View>
              ))}
            </>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            {user?.role === 'admin' ? 'Committees & Boards' : 'Activities & Clubs'}
          </Title>
          <Divider style={styles.divider} />
          
          {userDetails.activities.map((activity, index) => (
            <View key={index} style={styles.listItem}>
              <Icon 
                name={user?.role === 'admin' ? 'account-tie' : 'account-group'} 
                size={16} 
                color={user?.role === 'admin' ? '#D32F2F' : '#003366'} 
                style={styles.listIcon} 
              />
              <Text>{activity}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      <Button 
        mode="contained" 
        icon="account-edit" 
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        Edit Profile
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
  id: {
    fontSize: 12,
    color: '#888',
  },
  adminBadge: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
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
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 10,
  },
  infoLabel: {
    width: 80,
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  subSectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 15,
    marginBottom: 10,
    color: '#444',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
  },
  listIcon: {
    marginRight: 10,
  },
  editButton: {
    margin: 20,
    backgroundColor: '#003366',
  }
});

export default ProfileScreen;
