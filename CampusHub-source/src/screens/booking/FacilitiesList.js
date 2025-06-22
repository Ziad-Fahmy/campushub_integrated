// FacilityList.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Image, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';

const FacilityList = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/facilities');
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to load facilities:', err);
    }
    setLoading(false);
  };

  const filterByType = async (type) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/facilities');
      if (type === 'all') {
        setFacilities(res.data);
      } else {
        setFacilities(res.data.filter(facility => facility.type === type));
      }
    } catch (err) {
      console.error('Failed to filter facilities:', err);
    }
    setLoading(false);
  };

  const renderFacilityItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph style={styles.location}>{item.location}</Paragraph>
        <Paragraph>Capacity: {item.capacity} people</Paragraph>
        <Paragraph>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('FacilityDetails', { facility: item })}
        >
          View Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByType('all')}>
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByType('sports')}>
            <Text style={styles.filterText}>Sports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByType('study')}>
            <Text style={styles.filterText}>Study</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByType('event')}>
            <Text style={styles.filterText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton} onPress={() => filterByType('lab')}>
            <Text style={styles.filterText}>Labs</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={facilities}
          renderItem={renderFacilityItem}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {isAdmin && (
        <View style={styles.adminButtonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('FacilityBookingManagement')}
            style={styles.manageBookingsButton}
            icon="calendar-check"
          >
            Manage Bookings
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
    backgroundColor: '#003366',
    borderRadius: 20,
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  location: {
    color: '#666',
    marginBottom: 8,
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
  manageBookingsButton: {
    backgroundColor: '#4CAF50',
  },
});

export default FacilityList;
