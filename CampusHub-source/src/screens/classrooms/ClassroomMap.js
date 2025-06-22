import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Button, Text, ActivityIndicator, Searchbar, Chip, DataTable, Badge, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ClassroomMap = ({ navigation }) => {
  // In a real app, this would fetch from the API
  const [classrooms, setClassrooms] = useState([
    {
      id: '1',
      name: 'Room 101',
      building: 'Science Building',
      floor: 1,
      capacity: 40,
      facilities: ['projector', 'whiteboard', 'air_conditioning'],
      type: 'lecture',
      availability: true,
      currentClass: null,
      nextClass: 'Physics 101',
      nextAvailableTime: '11:30 AM',
      mapCoordinates: { x: 30, y: 40 }
    },
    {
      id: '2',
      name: 'Room 205',
      building: 'Arts Building',
      floor: 2,
      capacity: 30,
      facilities: ['whiteboard', 'audio_system'],
      type: 'seminar',
      availability: false,
      currentClass: 'Literature Studies',
      nextClass: 'Creative Writing',
      nextAvailableTime: '2:00 PM',
      mapCoordinates: { x: 120, y: 80 }
    },
    {
      id: '3',
      name: 'Computer Lab 3',
      building: 'Technology Building',
      floor: 1,
      capacity: 25,
      facilities: ['computers', 'projector', 'air_conditioning'],
      type: 'lab',
      availability: true,
      currentClass: null,
      nextClass: 'Programming 101',
      nextAvailableTime: '1:00 PM',
      mapCoordinates: { x: 200, y: 150 }
    },
    {
      id: '4',
      name: 'Lecture Hall A',
      building: 'Main Building',
      floor: 1,
      capacity: 120,
      facilities: ['projector', 'whiteboard', 'air_conditioning', 'audio_system', 'recording_equipment'],
      type: 'lecture',
      availability: false,
      currentClass: 'Introduction to Psychology',
      nextClass: 'Business Ethics',
      nextAvailableTime: '3:15 PM',
      mapCoordinates: { x: 80, y: 200 }
    },
    {
      id: '5',
      name: 'Study Room 12',
      building: 'Library',
      floor: 2,
      capacity: 8,
      facilities: ['whiteboard', 'power_outlets'],
      type: 'study',
      availability: true,
      currentClass: null,
      nextClass: 'Reserved: Study Group',
      nextAvailableTime: '5:00 PM',
      mapCoordinates: { x: 150, y: 220 }
    },
    {
      id: '6',
      name: 'Conference Room B',
      building: 'Business Building',
      floor: 3,
      capacity: 20,
      facilities: ['projector', 'whiteboard', 'video_conferencing'],
      type: 'meeting',
      availability: true,
      currentClass: null,
      nextClass: 'Faculty Meeting',
      nextAvailableTime: '4:30 PM',
      mapCoordinates: { x: 250, y: 100 }
    },
    {
      id: '7',
      name: 'Design Studio',
      building: 'Arts Building',
      floor: 1,
      capacity: 35,
      facilities: ['drawing_tables', 'computers', 'printing_equipment'],
      type: 'studio',
      availability: false,
      currentClass: 'Graphic Design Workshop',
      nextClass: 'Architecture Studio',
      nextAvailableTime: '6:00 PM',
      mapCoordinates: { x: 180, y: 30 }
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update classroom availability in a real app this would be from an API
      if (Math.random() > 0.7) {
        const randomIndex = Math.floor(Math.random() * classrooms.length);
        const updatedClassrooms = [...classrooms];
        updatedClassrooms[randomIndex] = {
          ...updatedClassrooms[randomIndex],
          availability: !updatedClassrooms[randomIndex].availability
        };
        setClassrooms(updatedClassrooms);
      }
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [classrooms]);
  
  const handleClassroomSelect = (classroom) => {
    setSelectedClassroom(classroom);
  };
  
  const onChangeSearch = (query) => {
    setSearchQuery(query);
  };
  
  const filteredClassrooms = classrooms
    .filter(classroom => {
      const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           classroom.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           classroom.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || classroom.type === filterType;
      
      return matchesSearch && matchesType;
    });
  
  const refreshData = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Randomly update a few classrooms
      const updatedClassrooms = classrooms.map(classroom => {
        if (Math.random() > 0.7) {
          return {
            ...classroom,
            availability: !classroom.availability
          };
        }
        return classroom;
      });
      setClassrooms(updatedClassrooms);
      setRefreshing(false);
    }, 1000);
  };
  
  const formatFacility = (facility) => {
    return facility.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const getIconForFacility = (facility) => {
    const icons = {
      'projector': 'projector',
      'whiteboard': 'whiteboard',
      'air_conditioning': 'air-conditioner',
      'audio_system': 'speaker',
      'computers': 'desktop-classic',
      'power_outlets': 'power-socket',
      'video_conferencing': 'video',
      'drawing_tables': 'table-furniture',
      'printing_equipment': 'printer',
      'recording_equipment': 'microphone'
    };
    
    return icons[facility] || 'checkbox-blank-circle-outline';
  };
  
  const renderMapView = () => (
    <>
      <View style={styles.mapContainer}>
        <View style={styles.map}>
          {filteredClassrooms.map((classroom) => (
            <TouchableOpacity
              key={classroom.id}
              style={[
                styles.classroomMarker,
                {
                  left: classroom.mapCoordinates.x,
                  top: classroom.mapCoordinates.y,
                  backgroundColor: classroom.availability ? '#4CAF50' : '#F44336',
                  transform: [{ scale: selectedClassroom?.id === classroom.id ? 1.3 : 1 }]
                }
              ]}
              onPress={() => handleClassroomSelect(classroom)}
            >
              <Text style={styles.markerText}>{classroom.name.split(' ')[1]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#4CAF50' }]} />
          <Text>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendMarker, { backgroundColor: '#F44336' }]} />
          <Text>Occupied</Text>
        </View>
      </View>
    </>
  );
  
  const renderTableView = () => (
    <DataTable style={styles.dataTable}>
      <DataTable.Header>
        <DataTable.Title>Room</DataTable.Title>
        <DataTable.Title>Building</DataTable.Title>
        <DataTable.Title>Type</DataTable.Title>
        <DataTable.Title numeric>Capacity</DataTable.Title>
        <DataTable.Title>Status</DataTable.Title>
      </DataTable.Header>
      
      {filteredClassrooms.map((classroom) => (
        <DataTable.Row 
          key={classroom.id} 
          onPress={() => handleClassroomSelect(classroom)}
          style={selectedClassroom?.id === classroom.id ? styles.selectedRow : null}
        >
          <DataTable.Cell>{classroom.name}</DataTable.Cell>
          <DataTable.Cell>{classroom.building}</DataTable.Cell>
          <DataTable.Cell>{classroom.type}</DataTable.Cell>
          <DataTable.Cell numeric>{classroom.capacity}</DataTable.Cell>
          <DataTable.Cell>
            <Badge 
              size={8} 
              style={{ 
                backgroundColor: classroom.availability ? '#4CAF50' : '#F44336',
                marginRight: 5
              }} 
            />
            {classroom.availability ? 'Available' : 'Occupied'}
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );
  
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search classrooms..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip 
            selected={filterType === 'all'} 
            onPress={() => setFilterType('all')} 
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip 
            selected={filterType === 'lecture'} 
            onPress={() => setFilterType('lecture')} 
            style={styles.filterChip}
          >
            Lecture
          </Chip>
          <Chip 
            selected={filterType === 'seminar'} 
            onPress={() => setFilterType('seminar')} 
            style={styles.filterChip}
          >
            Seminar
          </Chip>
          <Chip 
            selected={filterType === 'lab'} 
            onPress={() => setFilterType('lab')} 
            style={styles.filterChip}
          >
            Lab
          </Chip>
          <Chip 
            selected={filterType === 'study'} 
            onPress={() => setFilterType('study')} 
            style={styles.filterChip}
          >
            Study
          </Chip>
          <Chip 
            selected={filterType === 'meeting'} 
            onPress={() => setFilterType('meeting')} 
            style={styles.filterChip}
          >
            Meeting
          </Chip>
          <Chip 
            selected={filterType === 'studio'} 
            onPress={() => setFilterType('studio')} 
            style={styles.filterChip}
          >
            Studio
          </Chip>
        </ScrollView>
      </View>
      
      <View style={styles.viewToggleContainer}>
        <Button 
          mode={viewMode === 'map' ? 'contained' : 'outlined'} 
          onPress={() => setViewMode('map')}
          style={styles.viewToggleButton}
        >
          Map View
        </Button>
        <Button 
          mode={viewMode === 'table' ? 'contained' : 'outlined'} 
          onPress={() => setViewMode('table')}
          style={styles.viewToggleButton}
        >
          Table View
        </Button>
      </View>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          <Icon name="clock-outline" size={16} /> Last updated: {new Date().toLocaleTimeString()}
        </Text>
        <Button 
          mode="text" 
          onPress={refreshData} 
          loading={refreshing}
          icon="refresh"
        >
          Refresh
        </Button>
      </View>
      
      {viewMode === 'map' ? renderMapView() : renderTableView()}
      
      <ScrollView style={styles.infoContainer}>
        {selectedClassroom ? (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View>
                  <Title>{selectedClassroom.name}</Title>
                  <Paragraph style={styles.location}>
                    {selectedClassroom.building}, Floor {selectedClassroom.floor}
                  </Paragraph>
                </View>
                <Badge 
                  size={16} 
                  style={{ 
                    backgroundColor: selectedClassroom.availability ? '#4CAF50' : '#F44336',
                    alignSelf: 'flex-start'
                  }} 
                />
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[
                  styles.infoValue, 
                  {color: selectedClassroom.availability ? '#4CAF50' : '#F44336'}
                ]}>
                  {selectedClassroom.availability ? 'Available' : 'Occupied'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Type:</Text>
                <Text style={styles.infoValue}>{selectedClassroom.type.charAt(0).toUpperCase() + selectedClassroom.type.slice(1)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Capacity:</Text>
                <Text style={styles.infoValue}>{selectedClassroom.capacity} people</Text>
              </View>
              
              {!selectedClassroom.availability && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current Class:</Text>
                  <Text style={styles.infoValue}>{selectedClassroom.currentClass}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Class:</Text>
                <Text style={styles.infoValue}>{selectedClassroom.nextClass}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Next Available:</Text>
                <Text style={styles.infoValue}>{selectedClassroom.nextAvailableTime}</Text>
              </View>
              
              <Text style={styles.facilitiesTitle}>Facilities:</Text>
              <View style={styles.facilitiesList}>
                {selectedClassroom.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Icon name={getIconForFacility(facility)} size={16} style={styles.facilityIcon} />
                    <Text>{formatFacility(facility)}</Text>
                  </View>
                ))}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained" 
                disabled={!selectedClassroom.availability}
                onPress={() => {
                  // In a real app, this would navigate to a booking screen
                  alert('Classroom booking would be implemented here');
                }}
                icon="calendar-check"
              >
                {selectedClassroom.availability ? 'Book Now' : 'Not Available'}
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => {
                  // In a real app, this would show directions
                  alert('Directions to this classroom would be shown here');
                }}
                icon="map-marker"
              >
                Directions
              </Button>
            </Card.Actions>
          </Card>
        ) : (
          <Text style={styles.selectPrompt}>Select a classroom to view details</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 8,
    elevation: 2,
  },
  filterContainer: {
    padding: 8,
    backgroundColor: '#fff',
  },
  filterChip: {
    marginRight: 8,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  viewToggleButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#e0e0e0',
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  map: {
    flex: 1,
    position: 'relative',
  },
  classroomMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  dataTable: {
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 8,
    elevation: 2,
  },
  selectedRow: {
    backgroundColor: '#e3f2fd',
  },
  infoContainer: {
    flex: 1,
    padding: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  divider: {
    marginVertical: 10,
  },
  location: {
    color: '#666',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  facilitiesTitle: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  facilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  facilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  facilityIcon: {
    marginRight: 6,
  },
  selectPrompt: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default ClassroomMap;
