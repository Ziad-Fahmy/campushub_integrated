import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Text, 
  ActivityIndicator,
  Snackbar,
  Badge,
  Searchbar,
  Menu,
  Divider
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

const MyEventRegistrations = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadRegistrations();
      }
    }, [user])
  );

  const loadRegistrations = async () => {
    try {
      const response = await apiClient.get('/events/my-registrations');
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
      showSnackbar('Failed to load your registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRegistrations();
    } catch (error) {
      console.error('Error refreshing registrations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUnregister = async (eventId, eventTitle) => {
    try {
      await apiClient.delete(`/events/register/${eventId}`);
      showSnackbar(`Successfully unregistered from ${eventTitle}`);
      
      // Remove the registration from local state
      setRegistrations(prev => prev.filter(reg => reg.eventId._id !== eventId));
    } catch (error) {
      console.error('Error unregistering from event:', error);
      showSnackbar('Failed to unregister from the event');
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Time not available';
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (now < startDate) {
      return { status: 'upcoming', color: '#4CAF50', label: 'Upcoming' };
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', color: '#FF9800', label: 'Ongoing' };
    } else {
      return { status: 'completed', color: '#757575', label: 'Completed' };
    }
  };

  const canUnregister = (event) => {
    const eventStatus = getEventStatus(event);
    return eventStatus.status === 'upcoming';
  };

  const getRegistrationStats = () => {
    const upcoming = registrations.filter(reg => getEventStatus(reg.eventId).status === 'upcoming').length;
    const ongoing = registrations.filter(reg => getEventStatus(reg.eventId).status === 'ongoing').length;
    const completed = registrations.filter(reg => getEventStatus(reg.eventId).status === 'completed').length;
    
    return { upcoming, ongoing, completed, total: registrations.length };
  };

  const filteredRegistrations = registrations.filter(registration => {
    const event = registration.eventId;
    const eventStatus = getEventStatus(event);
    
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || eventStatus.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = getRegistrationStats();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading your registrations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.headerTitle}>My Event Registrations</Title>
            <Menu
              visible={filterMenuVisible}
              onDismiss={() => setFilterMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setFilterMenuVisible(true)}
                  icon="filter"
                  compact
                >
                  Filter
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setStatusFilter('all');
                  setFilterMenuVisible(false);
                }}
                title="All Events"
                leadingIcon="calendar-multiple"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter('upcoming');
                  setFilterMenuVisible(false);
                }}
                title="Upcoming"
                leadingIcon="calendar-clock"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter('ongoing');
                  setFilterMenuVisible(false);
                }}
                title="Ongoing"
                leadingIcon="calendar-today"
              />
              <Menu.Item
                onPress={() => {
                  setStatusFilter('completed');
                  setFilterMenuVisible(false);
                }}
                title="Completed"
                leadingIcon="calendar-check"
              />
            </Menu>
          </View>
          
          <Searchbar
            placeholder="Search your registered events..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.statsTitle}>Registration Summary</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.ongoing}</Text>
              <Text style={styles.statLabel}>Ongoing</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#757575' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Registrations List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((registration) => {
            const event = registration.eventId;
            const eventStatus = getEventStatus(event);
            
            return (
              <Card key={registration._id} style={styles.registrationCard}>
                <Card.Content>
                  {/* Event Header */}
                  <View style={styles.eventHeader}>
                    <Title style={styles.eventTitle}>{event.title}</Title>
                    <Badge style={[styles.statusBadge, { backgroundColor: eventStatus.color }]}>
                      {eventStatus.label}
                    </Badge>
                  </View>

                  {/* Event Details */}
                  <View style={styles.eventDetails}>
                    <Text style={styles.eventInfo}>
                      📅 {formatDate(event.startDate)} at {formatTime(event.startDate)}
                    </Text>
                    <Text style={styles.eventInfo}>
                      📍 {event.location}
                    </Text>
                    <Text style={styles.eventInfo}>
                      👤 Organized by {event.organizer}
                    </Text>
                    <Text style={styles.eventInfo}>
                      🎫 Registered on {formatDate(registration.registeredAt)}
                    </Text>
                  </View>

                  {/* Event Description */}
                  <Paragraph style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Paragraph>

                  {/* Category */}
                  <View style={styles.chipContainer}>
                    <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                      {event.category}
                    </Chip>
                    {registration.registrationStatus && (
                      <Chip 
                        style={[
                          styles.statusChip,
                          registration.registrationStatus === 'confirmed' && styles.confirmedChip,
                          registration.registrationStatus === 'pending' && styles.pendingChip,
                          registration.registrationStatus === 'cancelled' && styles.cancelledChip,
                          registration.registrationStatus === 'attended' && styles.attendedChip,
                        ]}
                        textStyle={styles.statusChipText}
                      >
                        {registration.registrationStatus}
                      </Chip>
                    )}
                  </View>

                  {/* Additional Info */}
                  {registration.additionalInfo && (
                    <View style={styles.additionalInfoContainer}>
                      <Text style={styles.additionalInfoLabel}>Your Note:</Text>
                      <Text style={styles.additionalInfo}>{registration.additionalInfo}</Text>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('EventDetails', { event })}
                      style={styles.detailsButton}
                      icon="information"
                    >
                      View Details
                    </Button>
                    
                    {canUnregister(event) && (
                      <Button
                        mode="outlined"
                        onPress={() => handleUnregister(event._id, event.title)}
                        style={styles.unregisterButton}
                        icon="cancel"
                        textColor="#D32F2F"
                      >
                        Unregister
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'No registrations found matching your criteria.' 
                  : 'You haven\'t registered for any events yet.'}
              </Text>
              {searchQuery || statusFilter !== 'all' ? (
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  style={styles.clearFiltersButton}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('EventsList')}
                  style={styles.browseEventsButton}
                  icon="calendar-plus"
                >
                  Browse Events
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#003366',
    fontSize: 20,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statsTitle: {
    color: '#003366',
    fontSize: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  registrationCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    color: '#003366',
    marginRight: 8,
  },
  statusBadge: {
    color: '#fff',
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
  },
  categoryChipText: {
    color: '#1976D2',
    fontSize: 12,
  },
  statusChip: {
    backgroundColor: '#f0f0f0',
  },
  confirmedChip: {
    backgroundColor: '#E8F5E8',
  },
  pendingChip: {
    backgroundColor: '#FFF3E0',
  },
  cancelledChip: {
    backgroundColor: '#FFEBEE',
  },
  attendedChip: {
    backgroundColor: '#E3F2FD',
  },
  statusChipText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  additionalInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  additionalInfoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  additionalInfo: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    borderColor: '#003366',
  },
  unregisterButton: {
    flex: 1,
    borderColor: '#D32F2F',
  },
  emptyCard: {
    margin: 16,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 16,
  },
  clearFiltersButton: {
    alignSelf: 'center',
    borderColor: '#003366',
  },
  browseEventsButton: {
    alignSelf: 'center',
    backgroundColor: '#003366',
  },
});

export default MyEventRegistrations;

