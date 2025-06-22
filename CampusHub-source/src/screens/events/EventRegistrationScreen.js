import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, Paragraph, Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const EventRegistrationScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRegister = async () => {
    console.log("EVENT DEBUG", event);

    const registrationData = {
      eventId: event?._id || "665cbf114bbddf67864cd0ad", // fallback test ObjectId
      userId: user?.id,
      name,
      email,
      additionalInfo,
    };
    console.log("REGISTRATION DATA", registrationData);

    if (!name || !email) {
      setSnackbarMessage('Please fill in all required fields (Name and Email).');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/events/register', registrationData);
      console.log('Event registration successful:', response.data);

      setSnackbarMessage('Successfully registered for the event!');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error registering for event:', error.response ? error.response.data : error.message);
      setSnackbarMessage(`Failed to register: ${error.response?.data?.message || error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.header}>Register for {event.title}</Title>
      <Paragraph style={styles.eventDetails}>Location: {event.location}</Paragraph>
      <Paragraph style={styles.eventDetails}>Date: {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</Paragraph>
      <Paragraph style={styles.eventDetails}>Organizer: {event.organizer}</Paragraph>

      <TextInput
        label="Your Full Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Your Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Additional Information (optional)"
        value={additionalInfo}
        onChangeText={setAdditionalInfo}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.registerButton}
        icon="check-circle"
      >
        Confirm Registration
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
        icon="cancel"
      >
        Cancel
      </Button>

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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#003366',
  },
  eventDetails: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: '#555',
  },
  input: {
    marginBottom: 12,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: '#003366',
  },
  cancelButton: {
    marginTop: 10,
    borderColor: '#003366',
  },
});

export default EventRegistrationScreen;
