import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const EventDetails = ({ route, navigation }) => {
  const { event } = route.params;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* You might want to add an image here if events have images */}
        <Card.Content>
          <Title style={styles.title}>{event.title}</Title>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.date}>{formatDate(event.startDate)}</Text>
            <Text style={styles.time}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </View>
          <Paragraph style={styles.location}>Location: {event.location}</Paragraph>
          <Paragraph style={styles.description}>{event.description}</Paragraph>
          <Paragraph style={styles.organizer}>Organizer: {event.organizer}</Paragraph>
          {event.registrationRequired && (
            <Paragraph style={styles.registration}>Registration Required: Yes</Paragraph>
          )}
          {event.registrationRequired && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('EventRegistration', { event: event })}
              style={styles.registrationButton}
            >
              Register for Event
            </Button>
          )}
        </Card.Content>
        <Card.Actions>
          <Button mode="outlined" onPress={() => navigation.goBack()}>
            Go Back
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  image: {
    height: 200,
    width: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  time: {
    fontSize: 16,
    color: '#666',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  organizer: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  registration: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  registrationButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default EventDetails;


