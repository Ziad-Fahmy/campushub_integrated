import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
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
  Divider
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

const EventDetails = ({ route, navigation }) => {
  const { event: initialEvent } = route.params;
  const { user } = useSelector((state) => state.auth);
  
  const [event, setEvent] = useState(initialEvent);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const isAdmin = user?.role === 'admin';

  useFocusEffect(
    React.useCallback(() => {
      loadEventDetails();
      if (user) {
        checkRegistrationStatus();
      }
    }, [initialEvent._id, user])
  );

  const loadEventDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/${initialEvent._id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event details:', error);
      showSnackbar('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await apiClient.get('/events/my-registrations');
      const isUserRegistered = response.data.some(
        reg => reg.eventId._id === initialEvent._id
      );
      setIsRegistered(isUserRegistered);
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Don't show error for this
    }
  };

  const handleRegister = () => {
    navigation.navigate('EventRegistrationScreen', { event });
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Confirm Unregistration',
      `Are you sure you want to unregister from "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: submitUnregistration,
        },
      ]
    );
  };

  const submitUnregistration = async () => {
    try {
      setRegistrationLoading(true);
      await apiClient.delete(`/events/register/${event._id}`);
      setIsRegistered(false);
      showSnackbar('Successfully unregistered from the event');
      
      // Refresh event details to update registration count
      await loadEventDetails();
    } catch (error) {
      console.error('Error unregistering from event:', error);
      showSnackbar('Failed to unregister from the event');
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleEditEvent = () => {
    navigation.navigate('EditEventScreen', { event });
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteEvent,
        },
      ]
    );
  };

  const deleteEvent = async () => {
    try {
      setLoading(true);
      await apiClient.delete(`/events/${event._id}`);
      showSnackbar('Event deleted successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting event:', error);
      showSnackbar('Failed to delete event');
      setLoading(false);
    }
  };

  const handleViewRegistrations = () => {
    navigation.navigate('EventRegistrationManagement');
  };

  const openExternalLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening URL:', err);
        showSnackbar('Failed to open link');
      });
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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

  const getEventStatus = () => {
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

  const isEventFull = () => {
    return event.maxParticipants && event.registrationCount >= event.maxParticipants;
  };

  const canRegister = () => {
    const eventStatus = getEventStatus();
    return eventStatus.status === 'upcoming' && !isEventFull() && !isRegistered;
  };

  const eventStatus = getEventStatus();
  const isFull = isEventFull();
  const spotsRemaining = event.maxParticipants ? 
    event.maxParticipants - (event.registrationCount || 0) : null;

  if (loading && !event) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Event Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.eventTitle}>{event.title}</Title>
            <View style={styles.badgeContainer}>
              {isRegistered && (
                <Badge style={styles.registeredBadge}>Registered</Badge>
              )}
              <Badge style={[styles.statusBadge, { backgroundColor: eventStatus.color }]}>
                {eventStatus.label}
              </Badge>
            </View>
          </View>
          
          <View style={styles.categoryContainer}>
            <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
              {event.category}
            </Chip>
            {event.tags && event.tags.map((tag, index) => (
              <Chip key={index} style={styles.tagChip} textStyle={styles.tagChipText}>
                {tag}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Event Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Event Details</Title>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Date:</Text>
            <Text style={styles.detailValue}>{formatDate(event.startDate)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Time:</Text>
            <Text style={styles.detailValue}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📍 Location:</Text>
            <Text style={styles.detailValue}>{event.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👤 Organizer:</Text>
            <Text style={styles.detailValue}>{event.organizer}</Text>
          </View>
          
          {event.contactEmail && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📧 Contact:</Text>
              <Text 
                style={[styles.detailValue, styles.linkText]}
                onPress={() => Linking.openURL(`mailto:${event.contactEmail}`)}
              >
                {event.contactEmail}
              </Text>
            </View>
          )}
          
          {event.contactPhone && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📞 Phone:</Text>
              <Text 
                style={[styles.detailValue, styles.linkText]}
                onPress={() => Linking.openURL(`tel:${event.contactPhone}`)}
              >
                {event.contactPhone}
              </Text>
            </View>
          )}
          
          {event.maxParticipants && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>👥 Capacity:</Text>
              <Text style={styles.detailValue}>
                {event.registrationCount || 0}/{event.maxParticipants}
                {spotsRemaining !== null && (
                  <Text style={spotsRemaining > 0 ? styles.spotsAvailable : styles.spotsFull}>
                    {spotsRemaining > 0 ? ` (${spotsRemaining} spots remaining)` : ' (Full)'}
                  </Text>
                )}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={styles.descriptionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Description</Title>
          <Paragraph style={styles.description}>{event.description}</Paragraph>
        </Card.Content>
      </Card>

      {/* Requirements */}
      {event.requirements && (
        <Card style={styles.requirementsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Requirements</Title>
            <Paragraph style={styles.requirements}>{event.requirements}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Registration Link */}
      {event.registrationLink && (
        <Card style={styles.linkCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>External Registration</Title>
            <Button
              mode="outlined"
              onPress={() => openExternalLink(event.registrationLink)}
              icon="open-in-new"
              style={styles.externalLinkButton}
            >
              Open Registration Link
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={styles.actionCard}>
        <Card.Content>
          {!isAdmin ? (
            <View style={styles.userActions}>
              {isRegistered ? (
                <View style={styles.registeredContainer}>
                  <Text style={styles.registeredText}>✅ You're registered for this event!</Text>
                  <Button
                    mode="outlined"
                    onPress={handleUnregister}
                    loading={registrationLoading}
                    disabled={registrationLoading}
                    style={styles.unregisterButton}
                    icon="cancel"
                    textColor="#D32F2F"
                  >
                    Unregister
                  </Button>
                </View>
              ) : canRegister() ? (
                <Button
                  mode="contained"
                  onPress={handleRegister}
                  style={styles.registerButton}
                  icon="account-plus"
                >
                  Register for Event
                </Button>
              ) : (
                <View style={styles.cannotRegisterContainer}>
                  <Text style={styles.cannotRegisterText}>
                    {isFull ? '❌ Event is full' : 
                     eventStatus.status === 'completed' ? '❌ Event has ended' : 
                     '❌ Registration not available'}
                  </Text>
                  {event.registrationLink && (
                    <Button
                      mode="outlined"
                      onPress={() => openExternalLink(event.registrationLink)}
                      style={styles.externalRegisterButton}
                      icon="open-in-new"
                    >
                      External Registration
                    </Button>
                  )}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.adminActions}>
              <Title style={styles.adminTitle}>Admin Actions</Title>
              <Divider style={styles.divider} />
              
              <View style={styles.adminButtonRow}>
                <Button
                  mode="contained"
                  onPress={handleViewRegistrations}
                  style={styles.adminButton}
                  icon="account-group"
                >
                  View Registrations ({event.registrationCount || 0})
                </Button>
              </View>
              
              <View style={styles.adminButtonRow}>
                <Button
                  mode="outlined"
                  onPress={handleEditEvent}
                  style={[styles.adminButton, styles.editButton]}
                  icon="pencil"
                >
                  Edit Event
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={handleDeleteEvent}
                  style={[styles.adminButton, styles.deleteButton]}
                  icon="delete"
                  textColor="#D32F2F"
                  loading={loading}
                  disabled={loading}
                >
                  Delete Event
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventTitle: {
    flex: 1,
    fontSize: 24,
    color: '#003366',
    marginRight: 16,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
  },
  categoryChipText: {
    color: '#1976D2',
  },
  tagChip: {
    backgroundColor: '#F3E5F5',
  },
  tagChipText: {
    color: '#7B1FA2',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  linkText: {
    color: '#1976D2',
    textDecorationLine: 'underline',
  },
  spotsAvailable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  spotsFull: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  descriptionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  requirementsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  requirements: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  linkCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  externalLinkButton: {
    borderColor: '#1976D2',
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    elevation: 2,
  },
  userActions: {
    alignItems: 'center',
  },
  registeredContainer: {
    alignItems: 'center',
    width: '100%',
  },
  registeredText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  unregisterButton: {
    borderColor: '#D32F2F',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
  },
  cannotRegisterContainer: {
    alignItems: 'center',
    width: '100%',
  },
  cannotRegisterText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  externalRegisterButton: {
    borderColor: '#1976D2',
  },
  adminActions: {
    width: '100%',
  },
  adminTitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  adminButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  adminButton: {
    flex: 1,
  },
  editButton: {
    borderColor: '#FF9800',
  },
  deleteButton: {
    borderColor: '#D32F2F',
  },
});

export default EventDetails;

