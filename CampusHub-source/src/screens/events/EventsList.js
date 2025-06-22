import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Text, 
  Searchbar,
  ActivityIndicator,
  Snackbar,
  Badge,
  FAB
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

const EventsList = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const isAdmin = user?.role === 'admin';

  const categories = [
    { key: 'all', label: 'All Events' },
    { key: 'academic', label: 'Academic' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'sports', label: 'Sports' },
    { key: 'social', label: 'Social' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'seminar', label: 'Seminar' },
    { key: 'conference', label: 'Conference' },
    { key: 'other', label: 'Other' },
  ];

  useFocusEffect(
    useCallback(() => {
      loadEvents();
      if (user) {
        loadUserRegistrations();
      }
    }, [user])
  );

  const loadEvents = async () => {
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      showSnackbar('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRegistrations = async () => {
    try {
      const response = await apiClient.get('/events/my-registrations');
      setUserRegistrations(response.data || []);
    } catch (error) {
      console.error('Error loading user registrations:', error);
      // Don't show error for this as it's not critical
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
      if (user) {
        await loadUserRegistrations();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const isUserRegistered = (eventId) => {
    return userRegistrations.some(reg => reg.eventId._id === eventId);
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

  const isEventFull = (event) => {
    return event.maxParticipants && event.registrationCount >= event.maxParticipants;
  };

  const canRegister = (event) => {
    const eventStatus = getEventStatus(event);
    return eventStatus.status === 'upcoming' && !isEventFull(event) && !isUserRegistered(event._id);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>
            {isAdmin ? 'Event Management' : 'Campus Events'}
          </Title>
          <Searchbar
            placeholder="Search events..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <Chip
            key={category.key}
            selected={selectedCategory === category.key}
            onPress={() => setSelectedCategory(category.key)}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.selectedCategoryChip
            ]}
            textStyle={[
              styles.categoryChipText,
              selectedCategory === category.key && styles.selectedCategoryChipText
            ]}
          >
            {category.label}
          </Chip>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const eventStatus = getEventStatus(event);
            const isRegistered = isUserRegistered(event._id);
            const isFull = isEventFull(event);
            
            return (
              <Card key={event._id} style={styles.eventCard}>
                <Card.Content>
                  {/* Event Header */}
                  <View style={styles.eventHeader}>
                    <Title style={styles.eventTitle}>{event.title}</Title>
                    <View style={styles.badgeContainer}>
                      {isRegistered && (
                        <Badge style={styles.registeredBadge}>Registered</Badge>
                      )}
                      <Badge 
                        style={[styles.statusBadge, { backgroundColor: eventStatus.color }]}
                      >
                        {eventStatus.label}
                      </Badge>
                    </View>
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
                    
                    {event.maxParticipants && (
                      <Text style={styles.eventInfo}>
                        👥 {event.registrationCount || 0}/{event.maxParticipants} participants
                        {isFull && <Text style={styles.fullText}> (Full)</Text>}
                      </Text>
                    )}
                  </View>

                  {/* Event Description */}
                  <Paragraph style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Paragraph>

                  {/* Category and Tags */}
                  <View style={styles.chipContainer}>
                    <Chip style={styles.categoryDisplayChip} textStyle={styles.categoryDisplayChipText}>
                      {event.category}
                    </Chip>
                    {event.tags && event.tags.map((tag, index) => (
                      <Chip key={index} style={styles.tagChip} textStyle={styles.tagChipText}>
                        {tag}
                      </Chip>
                    ))}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.navigate('EventDetails', { event })}
                      style={styles.detailsButton}
                      icon="information"
                    >
                      Details
                    </Button>
                    
                    {!isAdmin && (
                      <>
                        {isRegistered ? (
                          <Button
                            mode="contained"
                            style={styles.registeredButton}
                            icon="check-circle"
                            disabled
                          >
                            Registered
                          </Button>
                        ) : canRegister(event) ? (
                          <Button
                            mode="contained"
                            onPress={() => navigation.navigate('EventRegistrationScreen', { event })}
                            style={styles.registerButton}
                            icon="account-plus"
                          >
                            Register
                          </Button>
                        ) : (
                          <Button
                            mode="outlined"
                            style={styles.disabledButton}
                            disabled
                            icon={isFull ? "account-off" : "clock"}
                          >
                            {isFull ? 'Full' : eventStatus.status === 'completed' ? 'Ended' : 'Ongoing'}
                          </Button>
                        )}
                      </>
                    )}
                    
                    {isAdmin && (
                      <Button
                        mode="contained"
                        onPress={() => navigation.navigate('EventRegistrationManagement')}
                        style={styles.manageButton}
                        icon="cog"
                      >
                        Manage
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
                {searchQuery || selectedCategory !== 'all' 
                  ? 'No events found matching your criteria.' 
                  : 'No events available at the moment.'}
              </Text>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button
                  mode="outlined"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  style={styles.clearFiltersButton}
                >
                  Clear Filters
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Admin FAB */}
      {isAdmin && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('AddEvent')}
          label="Add Event"
        />
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
  headerTitle: {
    color: '#003366',
    fontSize: 24,
    marginBottom: 16,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  categoryContainer: {
    maxHeight: 60,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryChip: {
    backgroundColor: '#003366',
  },
  categoryChipText: {
    color: '#666',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  eventCard: {
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
  badgeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  registeredBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
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
  fullText: {
    color: '#D32F2F',
    fontWeight: 'bold',
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
    marginBottom: 16,
    gap: 8,
  },
  categoryDisplayChip: {
    backgroundColor: '#E3F2FD',
  },
  categoryDisplayChipText: {
    color: '#1976D2',
    fontSize: 12,
  },
  tagChip: {
    backgroundColor: '#F3E5F5',
  },
  tagChipText: {
    color: '#7B1FA2',
    fontSize: 12,
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
  registerButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  registeredButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#003366',
  },
  disabledButton: {
    flex: 1,
    borderColor: '#ccc',
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
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#003366',
  },
});

export default EventsList;

