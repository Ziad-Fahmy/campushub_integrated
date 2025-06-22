import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';

const RestaurantDetails = ({ route, navigation }) => {
  const { restaurant } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {/* You might want to add an image here if restaurants have images */}
        <Card.Content>
          <Title style={styles.title}>{restaurant.name}</Title>
          <Paragraph style={styles.cuisine}>{restaurant.cuisine}</Paragraph>
          <Paragraph style={styles.location}>Location: {restaurant.location}</Paragraph>
          <Paragraph style={styles.description}>{restaurant.description}</Paragraph>
          <Paragraph style={styles.hours}>Opening Hours: {restaurant.openingHours}</Paragraph>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>Rating: {restaurant.rating.toFixed(1)} / 5</Text>
          </View>
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
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
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
  hours: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
});

export default RestaurantDetails;


