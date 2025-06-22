import React, { useState } from 'react';
import { ScrollView, StyleSheet, Platform, View } from 'react-native';
import { TextInput, Button, Title, Snackbar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { createBooking } from '../../api/api';

const FacilityBookingForm = ({ route, navigation }) => {
  const { facility } = route.params;
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [universityId, setUniversityId] = useState(user?.studentId || user?.id || '');
  const [teamName, setTeamName] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('📍 Facility debug:', facility); // Helps verify _id or id

  const handleBooking = async () => {
    if (!name || !universityId || !teamName || !date) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarVisible(true);
      return;
    }

    try {
      setLoading(true);

      const facilityId = facility._id || facility.id;

      if (!facilityId) {
        setSnackbarMessage('Invalid facility data.');
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      // Create booking with proper data structure
      const bookingData = {
        resourceId: facilityId,
        resourceType: 'facility',
        startTime: date.toISOString(),
        endTime: new Date(date.getTime() + 2 * 60 * 60 * 1000).toISOString(), // Default 2 hours
        purpose: `Booking by ${teamName}`,
        additionalInfo: `Team: ${teamName}, Contact: ${name}`,
      };

      await createBooking(bookingData);

      setSnackbarMessage('Facility booked successfully!');
      setSnackbarVisible(true);
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      console.error('Booking error:', error);
      setSnackbarMessage(
        error.msg || error.message || 'Booking failed. Try again.'
      );
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const onTimeChange = (event, selectedTime) => {
    const updatedTime = selectedTime || date;
    const newDate = new Date(date);
    newDate.setHours(updatedTime.getHours());
    newDate.setMinutes(updatedTime.getMinutes());
    setShowTimePicker(false);
    setDate(newDate);
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Book {facility.name}</Title>

      <TextInput
        label="Your Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="University ID"
        value={universityId}
        onChangeText={setUniversityId}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.pickerRow}>
        <Button
          mode="contained"
          onPress={() => setShowDatePicker(true)}
          style={styles.selectButton}
          labelStyle={{ color: '#fff' }}
        >
          Select Date
        </Button>
        <Button
          mode="contained"
          onPress={() => setShowTimePicker(true)}
          style={styles.selectButton}
          labelStyle={{ color: '#fff' }}
        >
          Select Time
        </Button>
      </View>

      <TextInput
        label="Selected Date & Time"
        value={date.toLocaleString()}
        mode="outlined"
        editable={false}
        style={styles.input}
      />

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      <Button
        mode="contained"
        onPress={handleBooking}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Confirm Booking
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
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
    backgroundColor: '#f2f2f2',
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#003366',
    borderRadius: 24,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#003366',
  },
});

export default FacilityBookingForm;

