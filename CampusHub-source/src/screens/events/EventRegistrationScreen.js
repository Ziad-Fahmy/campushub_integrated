import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Snackbar, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    // Initialize form with user data
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
    
    // Check if user is already registered and get event details
    checkRegistrationStatus();
  }, [event, user]);

  const checkRegistrationStatus = async () => {
    try {
      setCheckingRegistration(true);
      
      // Get updated event details with registration count
      const eventResponse = await apiClient.get(`/events/${event._id}`);
      setEventDetails(eventResponse.data);
      
      // Check if user is already registered
      const registrationsResponse = await apiClient.get('/events/my-registrations');
      const isRegistered = registrationsResponse.data.some(
        reg => reg.eventId._id === event._id
      );
      setIsAlreadyRegistered(isRegistered);
      
    } catch (error) {
      console.error('Error checking registration status:', error);
      // Don't show error for this, just continue
    } finally {
      setCheckingRegistration(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!name.trim()) {
      errors.push('Name is required');
    }
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid phone number');
    }
    
    if (additionalInfo.length > 500) {
      errors.push('Additional information cannot exceed 500 characters');
    }
    
    if (specialRequirements.length > 200) {
      errors.push('Special requirements cannot exceed 200 characters');
    }
    
    return errors;
  };

  const handleRegister = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setSnackbarMessage(validationErrors.join('. '));
      setSnackbarVisible(true);
      return;
    }

    // Check if event is full
    if (eventDetails?.maxParticipants && eventDetails?.registrationCount >= eventDetails?.maxParticipants) {
      setSnackbarMessage('Sorry, this event is full.');
      setSnackbarVisible(true);
      return;
    }

    // Confirm registration
    Alert.alert(
      'Confirm Registration',
      `Are you sure you want to register for "${event.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Register',
          onPress: submitRegistration,
        },
      ]
    );
  };

  const submitRegistration = async () => {
    const registrationData = {
      eventId: event._id,
      additionalInfo: additionalInfo.trim(),
      phone: phone.trim(),
      specialRequirements: specialRequirements.trim(),
    };

    setLoading(true);
    try {
      const response = await apiClient.post('/events/register', registrationData);
      
      setSnackbarMessage('Successfully registered for the event!');
      setSnackbarVisible(true);
      
      // Update registration status
      setIsAlreadyRegistered(true);
      
      // Navigate back after showing success message
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Error registering for event:', error);
      
      let errorMessage = 'Failed to register for the event.';
      
      if (error.response?.data?.msg) {
        errorMessage = error.response.data.msg;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map(err => err.msg).join('. ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Confirm Unregistration',
      `Are you sure you want to unregister from "${event.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: submitUnregistration,
        },
      ]
    );
  };

  const submitUnregistration = async () => {
    setLoading(true);
    try {
      await apiClient.delete(`/events/register/${event._id}`);
      
      setSnackbarMessage('Successfully unregistered from the event.');
      setSnackbarVisible(true);
      setIsAlreadyRegistered(false);
      
      // Refresh event details
      checkRegistrationStatus();
      
    } catch (error) {
      console.error('Error unregistering from event:', error);
      setSnackbarMessage('Failed to unregister from the event.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
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

  if (checkingRegistration) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Paragraph style={styles.loadingText}>Loading event details...</Paragraph>
      </View>
    );
  }

  const currentEvent = eventDetails || event;
  const spotsRemaining = currentEvent.maxParticipants ? 
    currentEvent.maxParticipants - (currentEvent.registrationCount || 0) : null;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.eventCard}>
        <Card.Content>
          <Title style={styles.header}>{currentEvent.title}</Title>
          
          <View style={styles.eventInfo}>
            <Paragraph style={styles.eventDetails}>
              📍 <Text style={styles.bold}>Location:</Text> {currentEvent.location}
            </Paragraph>
            <Paragraph style={styles.eventDetails}>
              📅 <Text style={styles.bold}>Date:</Text> {formatDate(currentEvent.startDate)}
            </Paragraph>
            <Paragraph style={styles.eventDetails}>
              🕐 <Text style={styles.bold}>Time:</Text> {formatTime(currentEvent.startDate)} - {formatTime(currentEvent.endDate)}
            </Paragraph>
            <Paragraph style={styles.eventDetails}>
              👤 <Text style={styles.bold}>Organizer:</Text> {currentEvent.organizer}
            </Paragraph>
            
            {currentEvent.maxParticipants && (
              <Paragraph style={styles.eventDetails}>
                👥 <Text style={styles.bold}>Capacity:</Text> {currentEvent.registrationCount || 0}/{currentEvent.maxParticipants}
                {spotsRemaining !== null && (
                  <Text style={spotsRemaining > 0 ? styles.spotsAvailable : styles.spotsFull}>
                    {spotsRemaining > 0 ? ` (${spotsRemaining} spots remaining)` : ' (Event Full)'}
                  </Text>
                )}
              </Paragraph>
            )}
          </View>

          <View style={styles.chipContainer}>
            <Chip icon="calendar" style={styles.chip}>{currentEvent.category}</Chip>
            {isAlreadyRegistered && (
              <Chip icon="check-circle" style={styles.registeredChip}>Registered</Chip>
            )}
          </View>
        </Card.Content>
      </Card>

      {isAlreadyRegistered ? (
        <Card style={styles.registrationCard}>
          <Card.Content>
            <Title style={styles.registeredTitle}>✅ You're Registered!</Title>
            <Paragraph style={styles.registeredText}>
              You have successfully registered for this event. You'll receive updates and reminders via email.
            </Paragraph>
            <Button
              mode="outlined"
              onPress={handleUnregister}
              loading={loading}
              disabled={loading}
              style={styles.unregisterButton}
              icon="cancel"
              textColor="#D32F2F"
            >
              Unregister from Event
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Card.Content>
            <Title style={styles.formTitle}>Registration Form</Title>
            
            <TextInput
              label="Full Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!name.trim()}
              disabled={loading}
            />
            
            <TextInput
              label="Email Address *"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              error={!email.trim() || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)}
              disabled={loading}
            />
            
            <TextInput
              label="Phone Number (optional)"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              keyboardType="phone-pad"
              style={styles.input}
              disabled={loading}
            />
            
            <TextInput
              label="Special Requirements (optional)"
              value={specialRequirements}
              onChangeText={setSpecialRequirements}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              disabled={loading}
              right={<TextInput.Affix text={`${specialRequirements.length}/200`} />}
            />
            
            <TextInput
              label="Additional Information (optional)"
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              disabled={loading}
              right={<TextInput.Affix text={`${additionalInfo.length}/500`} />}
            />

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading || (spotsRemaining !== null && spotsRemaining <= 0)}
              style={styles.registerButton}
              icon="check-circle"
            >
              {spotsRemaining !== null && spotsRemaining <= 0 ? 'Event Full' : 'Confirm Registration'}
            </Button>
          </Card.Content>
        </Card>
      )}

      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        icon="arrow-left"
        disabled={loading}
      >
        Back to Events
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
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
  eventCard: {
    margin: 16,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#003366',
  },
  eventInfo: {
    marginBottom: 16,
  },
  eventDetails: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
    color: '#003366',
  },
  spotsAvailable: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  spotsFull: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#E3F2FD',
  },
  registeredChip: {
    backgroundColor: '#E8F5E8',
  },
  registrationCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  registeredTitle: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  registeredText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  unregisterButton: {
    borderColor: '#D32F2F',
  },
  formCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#003366',
  },
  input: {
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 8,
    backgroundColor: '#003366',
  },
  backButton: {
    margin: 16,
    marginTop: 0,
    borderColor: '#003366',
  },
});

export default EventRegistrationScreen;

