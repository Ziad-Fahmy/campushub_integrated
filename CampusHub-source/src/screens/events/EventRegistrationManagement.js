import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { 
  Title, 
  Card, 
  Button, 
  DataTable, 
  Searchbar, 
  Chip, 
  Text,
  ActivityIndicator,
  Snackbar,
  Menu,
  Divider,
  Badge
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

const EventRegistrationManagement = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [viewMode, setViewMode] = useState('events'); // 'events' or 'all-registrations'

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        loadEvents();
        loadAllRegistrations();
      }
    }, [isAdmin])
  );

  const loadEvents = async () => {
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      showSnackbar('Failed to load events');
    }
  };

  const loadAllRegistrations = async () => {
    try {
      const response = await apiClient.get('/events/admin/all-registrations');
      setAllRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Error loading all registrations:', error);
      showSnackbar('Failed to load registrations');
    }
  };

  const loadEventRegistrations = async (eventId) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/${eventId}/registrations`);
      setRegistrations(response.data.registrations || []);
      setSelectedEvent(response.data.event);
    } catch (error) {
      console.error('Error loading event registrations:', error);
      showSnackbar('Failed to load event registrations');
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadEvents();
      await loadAllRegistrations();
      if (selectedEvent) {
        await loadEventRegistrations(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const deleteRegistration = async (registrationId) => {
    Alert.alert(
      'Delete Registration',
      'Are you sure you want to delete this registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/events/admin/registration/${registrationId}`);
              showSnackbar('Registration deleted successfully');
              
              // Refresh data
              if (selectedEvent) {
                await loadEventRegistrations(selectedEvent.id);
              }
              await loadAllRegistrations();
              await loadEvents();
            } catch (error) {
              console.error('Error deleting registration:', error);
              showSnackbar('Failed to delete registration');
            }
          },
        },
      ]
    );
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegistrations = allRegistrations.filter(reg =>
    reg.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.eventTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEventRegistrations = registrations.filter(reg =>
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Title style={styles.unauthorizedTitle}>Access Denied</Title>
        <Text style={styles.unauthorizedText}>
          You need admin privileges to access this page.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Go Back
        </Button>
      </View>
    );
  }

  if (loading && !selectedEvent && viewMode === 'events') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Title style={styles.headerTitle}>Registration Management</Title>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  icon="menu"
                  compact
                >
                  View
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setViewMode('events');
                  setSelectedEvent(null);
                  setMenuVisible(false);
                }}
                title="Events Overview"
                leadingIcon="calendar-multiple"
              />
              <Menu.Item
                onPress={() => {
                  setViewMode('all-registrations');
                  setSelectedEvent(null);
                  setMenuVisible(false);
                }}
                title="All Registrations"
                leadingIcon="account-group"
              />
            </Menu>
          </View>
          
          <Searchbar
            placeholder={
              viewMode === 'events' 
                ? "Search events..." 
                : selectedEvent 
                  ? "Search registrations..." 
                  : "Search all registrations..."
            }
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Events Overview */}
        {viewMode === 'events' && !selectedEvent && (
          <View>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Title style={styles.statsTitle}>Overview</Title>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{events.length}</Text>
                    <Text style={styles.statLabel}>Total Events</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {events.reduce((sum, event) => sum + (event.registrationCount || 0), 0)}
                    </Text>
                    <Text style={styles.statLabel}>Total Registrations</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {filteredEvents.map((event) => (
              <Card key={event._id} style={styles.eventCard}>
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <Title style={styles.eventTitle}>{event.title}</Title>
                    <Badge style={styles.registrationBadge}>
                      {event.registrationCount || 0}
                    </Badge>
                  </View>
                  
                  <Text style={styles.eventDetails}>
                    📅 {formatDate(event.startDate)} • 📍 {event.location}
                  </Text>
                  <Text style={styles.eventDetails}>
                    👤 {event.organizer} • 🏷️ {event.category}
                  </Text>
                  
                  {event.maxParticipants && (
                    <View style={styles.capacityRow}>
                      <Text style={styles.capacityText}>
                        Capacity: {event.registrationCount || 0}/{event.maxParticipants}
                      </Text>
                      <Chip
                        style={[
                          styles.capacityChip,
                          (event.registrationCount || 0) >= event.maxParticipants
                            ? styles.fullChip
                            : styles.availableChip
                        ]}
                        textStyle={styles.chipText}
                      >
                        {(event.registrationCount || 0) >= event.maxParticipants ? 'Full' : 'Available'}
                      </Chip>
                    </View>
                  )}
                  
                  <Button
                    mode="contained"
                    onPress={() => loadEventRegistrations(event._id)}
                    style={styles.viewButton}
                    icon="eye"
                    disabled={!event.registrationCount}
                  >
                    View Registrations ({event.registrationCount || 0})
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Event Registrations Detail */}
        {selectedEvent && (
          <View>
            <Card style={styles.eventDetailCard}>
              <Card.Content>
                <View style={styles.eventDetailHeader}>
                  <Title style={styles.eventDetailTitle}>{selectedEvent.title}</Title>
                  <Button
                    mode="outlined"
                    onPress={() => setSelectedEvent(null)}
                    icon="arrow-left"
                    compact
                  >
                    Back
                  </Button>
                </View>
                
                <Text style={styles.eventDetailInfo}>
                  📅 {formatDate(selectedEvent.startDate)} • 📍 {selectedEvent.location}
                </Text>
                <Text style={styles.registrationCount}>
                  Total Registrations: {registrations.length}
                  {selectedEvent.maxParticipants && ` / ${selectedEvent.maxParticipants}`}
                </Text>
              </Card.Content>
            </Card>

            {filteredEventRegistrations.length > 0 ? (
              <Card style={styles.tableCard}>
                <Card.Content>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Name</DataTable.Title>
                      <DataTable.Title>Email</DataTable.Title>
                      <DataTable.Title>Date</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {filteredEventRegistrations.map((registration) => (
                      <DataTable.Row key={registration.id}>
                        <DataTable.Cell>
                          <View>
                            <Text style={styles.registrationName}>{registration.name}</Text>
                            {registration.studentId !== 'N/A' && (
                              <Text style={styles.studentId}>ID: {registration.studentId}</Text>
                            )}
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.registrationEmail}>{registration.email}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.registrationDate}>
                            {formatDateTime(registration.registeredAt)}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Button
                            mode="outlined"
                            onPress={() => deleteRegistration(registration.id)}
                            icon="delete"
                            compact
                            textColor="#D32F2F"
                          >
                            Remove
                          </Button>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No registrations found for this event.</Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

        {/* All Registrations View */}
        {viewMode === 'all-registrations' && !selectedEvent && (
          <View>
            <Card style={styles.statsCard}>
              <Card.Content>
                <Title style={styles.statsTitle}>All Registrations</Title>
                <Text style={styles.totalRegistrations}>
                  Total: {allRegistrations.length} registrations
                </Text>
              </Card.Content>
            </Card>

            {filteredRegistrations.length > 0 ? (
              <Card style={styles.tableCard}>
                <Card.Content>
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Student</DataTable.Title>
                      <DataTable.Title>Event</DataTable.Title>
                      <DataTable.Title>Date</DataTable.Title>
                      <DataTable.Title>Actions</DataTable.Title>
                    </DataTable.Header>

                    {filteredRegistrations.map((registration) => (
                      <DataTable.Row key={registration.id}>
                        <DataTable.Cell>
                          <View>
                            <Text style={styles.registrationName}>{registration.studentName}</Text>
                            <Text style={styles.registrationEmail}>{registration.studentEmail}</Text>
                            {registration.studentId !== 'N/A' && (
                              <Text style={styles.studentId}>ID: {registration.studentId}</Text>
                            )}
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <View>
                            <Text style={styles.eventTitle}>{registration.eventTitle}</Text>
                            <Text style={styles.eventDate}>
                              {formatDate(registration.eventDate)}
                            </Text>
                          </View>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Text style={styles.registrationDate}>
                            {formatDateTime(registration.registeredAt)}
                          </Text>
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Button
                            mode="outlined"
                            onPress={() => deleteRegistration(registration.id)}
                            icon="delete"
                            compact
                            textColor="#D32F2F"
                          >
                            Remove
                          </Button>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                </Card.Content>
              </Card>
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Text style={styles.emptyText}>No registrations found.</Text>
                </Card.Content>
              </Card>
            )}
          </View>
        )}
      </ScrollView>

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
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  unauthorizedTitle: {
    color: '#D32F2F',
    marginBottom: 16,
  },
  unauthorizedText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#003366',
    fontSize: 24,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  statsTitle: {
    color: '#003366',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalRegistrations: {
    fontSize: 16,
    color: '#666',
  },
  eventCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    color: '#003366',
  },
  registrationBadge: {
    backgroundColor: '#003366',
    color: '#fff',
  },
  eventDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
  },
  capacityChip: {
    height: 24,
  },
  fullChip: {
    backgroundColor: '#FFEBEE',
  },
  availableChip: {
    backgroundColor: '#E8F5E8',
  },
  chipText: {
    fontSize: 12,
  },
  viewButton: {
    backgroundColor: '#003366',
    marginTop: 8,
  },
  eventDetailCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  eventDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventDetailTitle: {
    flex: 1,
    color: '#003366',
    fontSize: 20,
  },
  eventDetailInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  registrationCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
  },
  tableCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  registrationName: {
    fontWeight: 'bold',
    color: '#003366',
  },
  registrationEmail: {
    fontSize: 12,
    color: '#666',
  },
  studentId: {
    fontSize: 11,
    color: '#999',
  },
  registrationDate: {
    fontSize: 12,
    color: '#666',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
    marginTop: 0,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#003366',
  },
});

export default EventRegistrationManagement;

