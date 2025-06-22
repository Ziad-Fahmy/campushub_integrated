import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Title, Paragraph, Button, Card } from 'react-native-paper';

const FacilityDetails = ({ route, navigation }) => {
  const { facility } = route.params;

  const handleBooking = () => {
    navigation.navigate('FacilityBookingForm', { facility });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={facility.name} subtitle={facility.type} />
        <Card.Content>
          <Paragraph><Title>Location:</Title> {facility.location}</Paragraph>
          <Paragraph><Title>Capacity:</Title> {facility.capacity || 'N/A'}</Paragraph>
          <Paragraph><Title>Status:</Title> {facility.status}</Paragraph>
          <Paragraph><Title>Opening Hours:</Title> {facility.openingHours || 'Not specified'}</Paragraph>
          <Paragraph style={{ marginTop: 10 }}>
            {facility.description || 'No description provided.'}
          </Paragraph>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        style={styles.button}
        onPress={handleBooking}
        icon="calendar-check"
      >
        Book This Facility
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  card: {
    marginBottom: 20,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#003366',
  },
});

export default FacilityDetails;
