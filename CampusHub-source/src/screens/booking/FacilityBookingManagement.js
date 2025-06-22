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

const FacilityBookingManagement = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/admin/facility-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching facility bookings:', error);
      setSnackbarMessage('Failed to fetch facility bookings');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await apiClient.put(`/admin/facility-bookings/${bookingId}`, 
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbarMessage(`Booking ${action} successfully`);
      setSnackbarVisible(true);
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: action }
            : booking
        )
      );
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      setSnackbarMessage(`Failed to ${action} booking`);
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading facility bookings...</Text>
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
      <Title style={styles.header}>Facility Booking Management</Title>
      <Paragraph style={styles.subtitle}>
        Manage facility and classroom bookings from students
      </Paragraph>

      {bookings.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph style={styles.emptyText}>
              No facility bookings found.
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        bookings.map((booking) => {
          const { date, time } = formatDateTime(booking.date);
          return (
            <Card key={booking._id} style={styles.bookingCard}>
              <Card.Content>
                <View style={styles.bookingHeader}>
                  <Title style={styles.facilityTitle}>
                    {booking.facilityId?.name || 'Unknown Facility'}
                  </Title>
                  <Chip 
                    style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
                    textStyle={styles.statusText}
                  >
                    {getStatusText(booking.status)}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.userInfo}>
                  <Paragraph style={styles.label}>Student Name:</Paragraph>
                  <Paragraph style={styles.value}>{booking.userId?.name || 'Unknown User'}</Paragraph>
                </View>

                <View style={styles.userInfo}>
                  <Paragraph style={styles.label}>University ID:</Paragraph>
                  <Paragraph style={styles.value}>{booking.userId?.studentId || booking.userId?.employeeId || 'N/A'}</Paragraph>
                </View>

                <View style={styles.userInfo}>
                  <Paragraph style={styles.label}>Email:</Paragraph>
                  <Paragraph style={styles.value}>{booking.userId?.email || 'N/A'}</Paragraph>
                </View>

                {booking.purpose && (
                  <View style={styles.userInfo}>
                    <Paragraph style={styles.label}>Purpose:</Paragraph>
                    <Paragraph style={styles.value}>{booking.purpose}</Paragraph>
                  </View>
                )}

                <View style={styles.facilityInfo}>
                  <Paragraph style={styles.label}>Facility Details:</Paragraph>
                  <Paragraph style={styles.value}>
                    Type: {booking.facilityId?.type || 'N/A'}
                  </Paragraph>
                  <Paragraph style={styles.value}>
                    Location: {booking.facilityId?.location || 'N/A'}
                  </Paragraph>
                  <Paragraph style={styles.value}>
                    Capacity: {booking.facilityId?.capacity || 'N/A'}
                  </Paragraph>
                </View>

                <View style={styles.bookingDateTime}>
                  <Paragraph style={styles.label}>Booking Date & Time:</Paragraph>
                  <Paragraph style={styles.value}>
                    {date} at {time}
                  </Paragraph>
                </View>

                <View style={styles.bookingDate}>
                  <Paragraph style={styles.label}>Request Date:</Paragraph>
                  <Paragraph style={styles.value}>
                    {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                    {new Date(booking.createdAt).toLocaleTimeString()}
                  </Paragraph>
                </View>

                {booking.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={() => handleBookingAction(booking._id, 'accepted')}
                      style={[styles.actionButton, styles.acceptButton]}
                      icon="check"
                    >
                      Accept
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleBookingAction(booking._id, 'rejected')}
                      style={[styles.actionButton, styles.rejectButton]}
                      icon="close"
                    >
                      Reject
                    </Button>
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })
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
  bookingCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  facilityTitle: {
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
  facilityInfo: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookingDateTime: {
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bookingDate: {
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

export default FacilityBookingManagement;

