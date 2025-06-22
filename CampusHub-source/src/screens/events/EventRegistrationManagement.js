import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Snackbar, 
  ActivityIndicator,
  Divider,
  Text
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const EventRegistrationManagement = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchRegistrations = async () => {
    try {
      const response = await apiClient.get('/admin/event-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      setSnackbarMessage('Failed to fetch event registrations');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRegistrations();
  };

  const handleRegistrationAction = async (registrationId, action) => {
    try {
      await apiClient.put(`/admin/event-registrations/${registrationId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbarMessage(`Registration ${action} successfully`);
      setSnackbarVisible(true);
      
      // Update local state
      setRegistrations(prev => 
        prev.map(reg => 
          reg._id === registrationId 
            ? { ...reg, status: action }
            : reg
        )
      );
    } catch (error) {
      console.error(`Error ${action} registration:`, error);
      setSnackbarMessage(`Failed to ${action} registration`);
      setSnackbarVisible(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading event registrations...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Title style={styles.header}>Event Registration Management</Title>
      <Paragraph style={styles.subtitle}>
        Manage event registrations from students
      </Paragraph>

      {registrations.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph style={styles.emptyText}>
              No event registrations found.
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        registrations.map((registration) => (
          <Card key={registration._id} style={styles.registrationCard}>
            <Card.Content>
              <View style={styles.registrationHeader}>
                <Title style={styles.eventTitle}>
                  {registration.eventId?.title || 'Unknown Event'}
                </Title>
                <Chip 
                  style={[styles.statusChip, { backgroundColor: getStatusColor(registration.status) }]}
                  textStyle={styles.statusText}
                >
                  {getStatusText(registration.status)}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.userInfo}>
                <Paragraph style={styles.label}>Student Name:</Paragraph>
                <Paragraph style={styles.value}>{registration.name}</Paragraph>
              </View>

              <View style={styles.userInfo}>
                <Paragraph style={styles.label}>Email:</Paragraph>
                <Paragraph style={styles.value}>{registration.email}</Paragraph>
              </View>

              {registration.additionalInfo && (
                <View style={styles.userInfo}>
                  <Paragraph style={styles.label}>Additional Information:</Paragraph>
                  <Paragraph style={styles.value}>{registration.additionalInfo}</Paragraph>
                </View>
              )}

              <View style={styles.eventInfo}>
                <Paragraph style={styles.label}>Event Details:</Paragraph>
                <Paragraph style={styles.value}>
                  Location: {registration.eventId?.location || 'N/A'}
                </Paragraph>
                <Paragraph style={styles.value}>
                  Date: {registration.eventId?.startDate 
                    ? new Date(registration.eventId.startDate).toLocaleDateString()
                    : 'N/A'
                  }
                </Paragraph>
                <Paragraph style={styles.value}>
                  Organizer: {registration.eventId?.organizer || 'N/A'}
                </Paragraph>
              </View>

              <View style={styles.registrationDate}>
                <Paragraph style={styles.label}>Registration Date:</Paragraph>
                <Paragraph style={styles.value}>
                  {new Date(registration.createdAt).toLocaleDateString()} at{' '}
                  {new Date(registration.createdAt).toLocaleTimeString()}
                </Paragraph>
              </View>

              {registration.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={() => handleRegistrationAction(registration._id, 'accepted')}
                    style={[styles.actionButton, styles.acceptButton]}
                    icon="check"
                  >
                    Accept
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleRegistrationAction(registration._id, 'rejected')}
                    style={[styles.actionButton, styles.rejectButton]}
                    icon="close"
                  >
                    Reject
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        ))
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#003366',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  registrationCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    flex: 1,
  },
  statusChip: {
    marginLeft: 10,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 10,
  },
  userInfo: {
    marginBottom: 8,
  },
  eventInfo: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  registrationDate: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
});

export default EventRegistrationManagement;

