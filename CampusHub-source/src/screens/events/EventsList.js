import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

const EventsList = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth); // Get user from Redux store
  const isAdmin = user && user.role === 'admin'; // Check if user is admin

  // In a real app, this would fetch from the API
  const [events, setEvents] = React.useState([
    {
      id: '1',
      title: 'Annual Science Fair',
      description: 'Showcase your scientific projects and innovations at the university\'s annual science fair.',
      location: 'Science Building, Main Hall',
      startDate: new Date('2025-05-25T10:00:00'),
      endDate: new Date('2025-05-25T16:00:00'),
      category: 'academic',
      organizer: 'Science Department',
      registrationRequired: true,
      registrationLink: 'https://university.edu/events/science-fair'
    },
    {
      id: '2',
      title: 'Cultural Festival',
      description: 'Celebrate diversity with performances, food, and activities from cultures around the world.',
      location: 'Student Center, Outdoor Plaza',
      startDate: new Date('2025-06-10T12:00:00' ),
      endDate: new Date('2025-06-10T20:00:00'),
      category: 'cultural',
      organizer: 'International Student Association',
      registrationRequired: false
    },
    {
      id: '3',
      title: 'Basketball Tournament',
      description: 'Inter-department basketball tournament. Form your team and compete for the championship.',
      location: 'Sports Complex, Basketball Courts',
      startDate: new Date('2025-05-30T09:00:00'),
      endDate: new Date('2025-05-31T18:00:00'),
      category: 'sports',
      organizer: 'Athletics Department',
      registrationRequired: true,
      registrationLink: 'https://university.edu/events/basketball-tournament'
    },
    {
      id: '4',
      title: 'Career Fair',
      description: 'Meet representatives from top companies and explore internship and job opportunities.',
      location: 'Business Building, Conference Hall',
      startDate: new Date('2025-06-05T10:00:00' ),
      endDate: new Date('2025-06-05T15:00:00'),
      category: 'academic',
      organizer: 'Career Services',
      registrationRequired: true,
      registrationLink: 'https://university.edu/events/career-fair'
    }
  ] );
  
  const [loading, setLoading] = React.useState(false);
  const [filter, setFilter] = React.useState('all');
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const filterEvents = (category) => {
    setLoading(true);
    setFilter(category);
    
    // In a real app, this would filter from the API
    setTimeout(() => {
      if (category === 'all') {
        setEvents([
          {
            id: '1',
            title: 'Annual Science Fair',
            description: 'Showcase your scientific projects and innovations at the university\'s annual science fair.',
            location: 'Science Building, Main Hall',
            startDate: new Date('2025-05-25T10:00:00'),
            endDate: new Date('2025-05-25T16:00:00'),
            category: 'academic',
            organizer: 'Science Department',
            registrationRequired: true,
            registrationLink: 'https://university.edu/events/science-fair'
          },
          {
            id: '2',
            title: 'Cultural Festival',
            description: 'Celebrate diversity with performances, food, and activities from cultures around the world.',
            location: 'Student Center, Outdoor Plaza',
            startDate: new Date('2025-06-10T12:00:00' ),
            endDate: new Date('2025-06-10T20:00:00'),
            category: 'cultural',
            organizer: 'International Student Association',
            registrationRequired: false
          },
          {
            id: '3',
            title: 'Basketball Tournament',
            description: 'Inter-department basketball tournament. Form your team and compete for the championship.',
            location: 'Sports Complex, Basketball Courts',
            startDate: new Date('2025-05-30T09:00:00'),
            endDate: new Date('2025-05-31T18:00:00'),
            category: 'sports',
            organizer: 'Athletics Department',
            registrationRequired: true,
            registrationLink: 'https://university.edu/events/basketball-tournament'
          },
          {
            id: '4',
            title: 'Career Fair',
            description: 'Meet representatives from top companies and explore internship and job opportunities.',
            location: 'Business Building, Conference Hall',
            startDate: new Date('2025-06-05T10:00:00' ),
            endDate: new Date('2025-06-05T15:00:00'),
            category: 'academic',
            organizer: 'Career Services',
            registrationRequired: true,
            registrationLink: 'https://university.edu/events/career-fair'
          }
        ] );
      } else {
        setEvents(events.filter(event => event.category === category));
      }
      setLoading(false);
    }, 500);
  };
  
  const renderEventItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.title}</Title>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.date}>{formatDate(item.startDate)}</Text>
          <Text style={styles.time}>
            {formatTime(item.startDate)} - {formatTime(item.endDate)}
          </Text>
        </View>
        <Paragraph style={styles.location}>{item.location}</Paragraph>
        <Paragraph>{item.description}</Paragraph>
        <View style={styles.tagsContainer}>
          <Chip style={styles.categoryChip}>{item.category}</Chip>
          <Text style={styles.organizer}>By: {item.organizer}</Text>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('EventDetails', { event: item })}
        >
          View Details
        </Button>
        {item.registrationRequired && (
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('EventRegistration', { event: item })}
          >
            Register
          </Button>
        )}
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
            onPress={() => filterEvents('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.activeFilterText
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'academic' && styles.activeFilter
            ]} 
            onPress={() => filterEvents('academic')}
          >
            <Text style={[
              styles.filterText,
              filter === 'academic' && styles.activeFilterText
            ]}>Academic</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'cultural' && styles.activeFilter
            ]} 
            onPress={() => filterEvents('cultural')}
          >
            <Text style={[
              styles.filterText,
              filter === 'cultural' && styles.activeFilterText
            ]}>Cultural</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              filter === 'sports' && styles.activeFilter
            ]} 
            onPress={() => filterEvents('sports')}
          >
            <Text style={[
              styles.filterText,
              filter === 'sports' && styles.activeFilterText
            ]}>Sports</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003366" />
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
      {isAdmin && (
        <View style={styles.adminButtonsContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddEvent')}
            style={[styles.adminButton, styles.addEventButton]}
            icon="plus"
          >
            Add New Event
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('EventRegistrationManagement')}
            style={[styles.adminButton, styles.manageRegistrationsButton]}
            icon="account-multiple-check"
          >
            Manage Registrations
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
  dateTimeContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  date: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  time: {
    color: '#666',
  },
  location: {
    color: '#666',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  organizer: {
    color: '#666',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    gap: 10,
  },
  adminButton: {
    flex: 1,
  },
  addEventButton: {
    backgroundColor: '#003366',
  },
  manageRegistrationsButton: {
    backgroundColor: '#4CAF50',
  },
});

export default EventsList;
