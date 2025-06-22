import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Avatar, Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getRestaurants } from '../../api/api';

const RestaurantsList = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadRestaurants();
    }, [])
  );

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const restaurantsData = await getRestaurants();
      setRestaurants(restaurantsData || []);
      setFilteredRestaurants(restaurantsData || []);
    } catch (error) {
      console.error('Error loading restaurants:', error);
      setSnackbarMessage('Failed to load restaurants');
      setSnackbarVisible(true);
      // Set some default data if API fails
      const defaultRestaurants = [
        {
          _id: '1',
          name: 'Campus Café',
          description: 'Quick bites and coffee for students on the go.',
          location: 'Student Center, Ground Floor',
          cuisine: 'Café',
          openingHours: '7:00 AM - 8:00 PM',
          rating: 4.2,
          isActive: true
        },
        {
          _id: '2',
          name: 'The Dining Hall',
          description: 'All-you-can-eat buffet with a variety of options.',
          location: 'Residence Hall, Building A',
          cuisine: 'International',
          openingHours: '7:00 AM - 9:00 PM',
          rating: 3.8,
          isActive: true
        },
        {
          _id: '3',
          name: 'Sushi Express',
          description: 'Fresh sushi and Japanese cuisine.',
          location: 'Food Court, Level 2',
          cuisine: 'Japanese',
          openingHours: '11:00 AM - 8:00 PM',
          rating: 4.5,
          isActive: true
        },
        {
          _id: '4',
          name: 'Pizza Place',
          description: 'Authentic Italian pizzas and pastas.',
          location: 'Food Court, Level 2',
          cuisine: 'Italian',
          openingHours: '11:00 AM - 9:00 PM',
          rating: 4.0,
          isActive: true
        }
      ];
      setRestaurants(defaultRestaurants);
      setFilteredRestaurants(defaultRestaurants);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRestaurants();
    setRefreshing(false);
  };
  
  const filterRestaurants = (cuisine) => {
    setFilter(cuisine);
    
    if (cuisine === 'all') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(restaurant => 
        restaurant.cuisine?.toLowerCase() === cuisine.toLowerCase()
      );
      setFilteredRestaurants(filtered);
    }
  };

  const getCuisineTypes = () => {
    const cuisines = [...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];
    return ['all', ...cuisines.map(c => c.toLowerCase())];
  };
  
  const renderRatingStars = (rating) => {
    if (!rating) return null;
    
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
          <View style={styles.titleContainer}>
            <Title style={styles.restaurantName}>{item.name}</Title>
            {item.cuisine && (
              <Paragraph style={styles.cuisine}>{item.cuisine}</Paragraph>
            )}
          </View>
          <Avatar.Text 
            size={40} 
            label={item.name.charAt(0)} 
            backgroundColor="#003366" 
            color="#fff"
          />
        </View>
        
        {item.location && (
          <Paragraph style={styles.location}>📍 {item.location}</Paragraph>
        )}
        
        <Paragraph style={styles.description}>{item.description}</Paragraph>
        
        {item.openingHours && (
          <Paragraph style={styles.hours}>🕐 {item.openingHours}</Paragraph>
        )}
        
        {item.rating && renderRatingStars(item.rating)}
        
        {!item.isActive && (
          <Text style={styles.closedText}>Currently Closed</Text>
        )}
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('RestaurantDetails', { restaurant: item })}
          style={styles.viewMenuButton}
          icon="food"
          disabled={!item.isActive}
        >
          View Menu
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading restaurants...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>
          {isAdmin ? 'Restaurant Management' : 'Campus Restaurants'}
        </Title>
        <Text style={styles.headerSubtitle}>
          {isAdmin ? 'Manage restaurant menus and information' : 'Discover delicious food options on campus'}
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getCuisineTypes().map((cuisine) => (
            <TouchableOpacity 
              key={cuisine}
              style={[
                styles.filterButton, 
                filter === cuisine && styles.activeFilter
              ]} 
              onPress={() => filterRestaurants(cuisine)}
            >
              <Text style={[
                styles.filterText,
                filter === cuisine && styles.activeFilterText
              ]}>
                {cuisine === 'all' ? 'All' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {filteredRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? 'No restaurants available at the moment.' 
              : `No ${filter} restaurants found.`
            }
          </Text>
          {filter !== 'all' && (
            <Button
              mode="outlined"
              onPress={() => filterRestaurants('all')}
              style={styles.clearFilterButton}
            >
              Show All Restaurants
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
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
  header: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  clearFilterButton: {
    borderColor: '#003366',
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
  titleContainer: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    color: '#003366',
  },
  cuisine: {
    color: '#666',
    fontSize: 14,
  },
  location: {
    color: '#666',
    marginBottom: 8,
    fontSize: 14,
  },
  description: {
    color: '#555',
    marginBottom: 8,
    lineHeight: 20,
  },
  hours: {
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#666',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  closedText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  viewMenuButton: {
    backgroundColor: '#003366',
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

