import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Paragraph, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient'; // Import apiClient

const AddEventScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth); // Get user from Redux store

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [organizer, setOrganizer] = useState(user?.name || ''); // Pre-fill organizer with current user's name
  const [registrationRequired, setRegistrationRequired] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');

  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
    if (currentDate > endDate) {
      setEndDate(currentDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
    if (currentDate < startDate) {
      setStartDate(currentDate);
    }
  };

  const handleAddEvent = async () => {
    if (!title || !description || !location || !category || !organizer) {
      setSnackbarMessage('Please fill in all required fields.');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const newEvent = {
        title,
        description,
        location,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        category,
        organizer,
        registrationRequired,
        registrationLink: registrationRequired ? registrationLink : undefined,
      };

      const response = await apiClient.post('/api/events', newEvent);
      console.log('Event added successfully:', response.data);

      setSnackbarMessage('Event added successfully!');
      setSnackbarVisible(true);
      // Optionally navigate back or clear form
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Error adding event:', error.response ? error.response.data : error.message);
      setSnackbarMessage(`Failed to add event: ${error.response?.data?.message || error.message}`);
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.header}>Add New Event</Title>
      <TextInput
        label="Event Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />
      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.datePickerContainer}>
        <Button onPress={() => setShowStartDatePicker(true)} mode="outlined" style={styles.dateButton}>
          Start Date: {startDate.toLocaleDateString()}
        </Button>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}
        <Button onPress={() => setShowEndDatePicker(true)} mode="outlined" style={styles.dateButton}>
          End Date: {endDate.toLocaleDateString()}
        </Button>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
          />
        )}
      </View>

      <TextInput
        label="Category (e.g., academic, cultural, sports)"
        value={category}
        onChangeText={setCategory}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Organizer"
        value={organizer}
        onChangeText={setOrganizer}
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.checkboxContainer}>
        <Paragraph>Registration Required?</Paragraph>
        <Button
          mode={registrationRequired ? "contained" : "outlined"}
          onPress={() => setRegistrationRequired(!registrationRequired)}
          style={styles.checkboxButton}
        >
          {registrationRequired ? 'Yes' : 'No'}
        </Button>
      </View>

      {registrationRequired && (
        <TextInput
          label="Registration Link"
          value={registrationLink}
          onChangeText={setRegistrationLink}
          mode="outlined"
          style={styles.input}
          keyboardType="url"
        />
      )}

      <Button
        mode="contained"
        onPress={handleAddEvent}
        loading={loading}
        disabled={loading}
        style={styles.addButton}
        icon="plus-circle"
      >
        Add Event
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#003366',
  },
  input: {
    marginBottom: 12,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 1,
  },
  checkboxButton: {
    minWidth: 80,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: '#003366',
  },
  cancelButton: {
    marginTop: 10,
    borderColor: '#003366',
  },
});

export default AddEventScreen;


