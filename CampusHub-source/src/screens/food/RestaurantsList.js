import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

const RestaurantsList = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  // In a real app, this would fetch from the API
  const [restaurants, setRestaurants] = React.useState([
    {
      id: '1',
      name: 'Campus Café',
      description: 'Quick bites and coffee for students on the go.',
      location: 'Student Center, Ground Floor',
      cuisine: 'Café',
      openingHours: '7:00 AM - 8:00 PM',
      rating: 4.2,
      image: 'cafe.jpg'
    },
    {
      id: '2',
      name: 'The Dining Hall',
      description: 'All-you-can-eat buffet with a variety of options.',
      location: 'Residence Hall, Building A',
      cuisine: 'International',
      openingHours: '7:00 AM - 9:00 PM',
      rating: 3.8,
      image: 'dining.jpg'
    },
    {
      id: '3',
      name: 'Sushi Express',
      description: 'Fresh sushi and Japanese cuisine.',
      location: 'Food Court, Level 2',
      cuisine: 'Japanese',
      openingHours: '11:00 AM - 8:00 PM',
      rating: 4.5,
      image: 'sushi.jpg'
    },
    {
      id: '4',
      name: 'Pizza Place',
      description: 'Authentic Italian pizzas and pastas.',
      location: 'Food Court, Level 2',
      cuisine: 'Italian',
      openingHours: '11:00 AM - 9:00 PM',
      rating: 4.0,
      image: 'pizza.jpg'
    }
  ]);
  
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  
  const filterRestaurants = (cuisine) => {
    setLoading(true);
    setFilter(cuisine);
    
    // In a real app, this would filter from the API
    setTimeout(() => {
      if (cuisine === 'all') {
        setRestaurants([
          {
            id: '1',
            name: 'Campus Café',
            description: 'Quick bites and coffee for students on the go.',
            location: 'Student Center, Ground Floor',
            cuisine: 'Café',
            openingHours: '7:00 AM - 8:00 PM',
            rating: 4.2,
            image: 'cafe.jpg'
          },
          {
            id: '2',
            name: 'The Dining Hall',
            description: 'All-you-can-eat buffet with a variety of options.',
            location: 'Residence Hall, Building A',
            cuisine: 'International',
            openingHours: '7:00 AM - 9:00 PM',
            rating: 3.8,
            image: 'dining.jpg'
          },
          {
            id: '3',
            name: 'Sushi Express',
            description: 'Fresh sushi and Japanese cuisine.',
            location: 'Food Court, Level 2',
            cuisine: 'Japanese',
            openingHours: '11:00 AM - 8:00 PM',
            rating: 4.5,
            image: 'sushi.jpg'
          },
          {
            id: '4',
            name: 'Pizza Place',
            description: 'Authentic Italian pizzas and pastas.',
            location: 'Food Court, Level 2',
            cuisine: 'Italian',
            openingHours: '11:00 AM - 9:00 PM',
            rating: 4.0,
            image: 'pizza.jpg'
          }
        ]);
      } else {
        setRestaurants(restaurants.filter(restaurant => restaurant.cuisine.toLowerCase() === cuisine.toLowerCase()));
      }
      setLoading(false);
    }, 500);
  };
  
  const renderRatingStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.ratingContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starFull}>★</Text>
        ))}
        {halfStar && <Text style={styles.starHalf}>★</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={styles.starEmpty}>★</Text>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };
  
  const renderRestaurantItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <View>
            <Title>{item.name}</Title>
            <Paragraph style={styles.cuisine}>{item.cuisine}</Paragraph>
          </View>
          <Avatar.Text size={40} label={item.name.charAt(0)} backgroundColor="#003366" />
        </View>
        <Paragraph style={styles.location}>{item.location}</Paragraph>
        <Paragraph>{item.description}</Paragraph>
        <Paragraph style={styles.hours}>Hours: {item.openingHours}</Paragraph>
        {renderRatingStars(item.rating)}
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
        >
          View Menu
        </Button>
      </Card.Actions>
    </Card>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'all' && styles.activeFilter
            ]} 
            onPress={() => filterRestaurants('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'café' && styles.activeFilter
            ]} 
            onPress={() => filterRestaurants('café')}
          >
            <Text style={[
              styles.filterText,
              filter === 'café' && styles.activeFilterText
            ]}>Café</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'international' && styles.activeFilter
            ]} 
            onPress={() => filterRestaurants('international')}
          >
            <Text style={[
              styles.filterText,
              filter === 'international' && styles.activeFilterText
            ]}>International</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'japanese' && styles.activeFilter
            ]} 
            onPress={() => filterRestaurants('japanese')}
          >
            <Text style={[
              styles.filterText,
              filter === 'japanese' && styles.activeFilterText
            ]}>Japanese</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'italian' && styles.activeFilter
            ]} 
            onPress={() => filterRestaurants('italian')}
          >
            <Text style={[
              styles.filterText,
              filter === 'italian' && styles.activeFilterText
            ]}>Italian</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {isAdmin && (
        <View style={styles.adminButtonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('MenuManagement')}
            style={styles.manageMenuButton}
            icon="food"
          >
            Manage Menus
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#003366',
  },
  activeFilter: {
    backgroundColor: '#003366',
  },
  filterText: {
    color: '#003366',
    fontWeight: 'bold',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cuisine: {
    color: '#666',
    fontSize: 14,
  },
  location: {
    color: '#666',
    marginBottom: 8,
  },
  hours: {
    fontStyle: 'italic',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  starFull: {
    color: '#FFD700',
    fontSize: 16,
  },
  starHalf: {
    color: '#FFD700',
    fontSize: 16,
    opacity: 0.5,
  },
  starEmpty: {
    color: '#D3D3D3',
    fontSize: 16,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  manageMenuButton: {
    backgroundColor: '#FF9800',
  },
});

export default RestaurantsList;
