import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';

const Dashboard = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.role === 'admin' ? 'Admin' : user?.name || 'Demo User'}!
        </Text>
        {user?.role === 'admin' && (
          <Text style={styles.adminBadge}>Administrator Dashboard</Text>
        )}
        <Text style={styles.subtitle}>
          {user?.role === 'admin' 
            ? 'Manage your campus efficiently' 
            : 'Your campus at your fingertips'
          }
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Active Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Upcoming Events</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Facilities')}
          >
            <Text style={styles.actionTitle}>
              {user?.role === 'admin' ? 'Manage Facilities' : 'Book a Facility'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Classrooms')}
          >
            <Text style={styles.actionTitle}>
              {user?.role === 'admin' ? 'Manage Classrooms' : 'Find a Classroom'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.actionTitle}>
              {user?.role === 'admin' ? 'Manage Events' : 'Browse Events'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => navigation.navigate('Food')}
          >
            <Text style={styles.actionTitle}>
              {user?.role === 'admin' ? 'Manage Restaurants' : 'Order Food'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Campus News</Text>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>Campus Library Extended Hours</Text>
          <Text style={styles.newsDate}>May 15, 2025</Text>
          <Text style={styles.newsContent}>
            The main campus library will extend its hours during finals week...
          </Text>
        </View>
        <View style={styles.newsCard}>
          <Text style={styles.newsTitle}>New Food Court Opening</Text>
          <Text style={styles.newsDate}>May 10, 2025</Text>
          <Text style={styles.newsContent}>
            A new food court will be opening next month in the Student Center...
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  adminBadge: {
    fontSize: 14,
    color: '#fff',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#003366',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    textAlign: 'center',
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: '#333',
  },
});

export default Dashboard;
