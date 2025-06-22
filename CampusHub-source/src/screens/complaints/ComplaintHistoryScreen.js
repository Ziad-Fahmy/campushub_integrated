import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Chip, 
  Snackbar, 
  ActivityIndicator,
  Text,
  Divider,
  Modal,
  Portal,
  TextInput
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { getComplaints, getAllComplaints, updateComplaintStatus } from '../../api/api';

const ComplaintHistoryScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('in-progress');

  useFocusEffect(
    useCallback(() => {
      loadComplaints();
    }, [isAdmin])
  );

  const loadComplaints = async () => {
    try {
      setLoading(true);
      let complaintsData;
      
      if (isAdmin) {
        complaintsData = await getAllComplaints();
      } else {
        complaintsData = await getComplaints();
      }
      
      setComplaints(complaintsData || []);
    } catch (error) {
      console.error('Error loading complaints:', error);
      setSnackbarMessage('Failed to load complaints');
      setSnackbarVisible(true);
      
      // Set some mock data for testing
      const mockComplaints = [
        {
          _id: '1',
          title: 'Broken AC in Library',
          description: 'The air conditioning in the main library is not working properly.',
          category: 'Facilities',
          status: 'pending',
          createdAt: new Date().toISOString(),
          userId: isAdmin ? { name: 'John Doe', email: 'john@example.com' } : undefined
        },
        {
          _id: '2',
          title: 'Cafeteria Food Quality',
          description: 'The food quality in the main cafeteria has declined recently.',
          category: 'Food Services',
          status: 'in-progress',
          response: 'We are investigating this issue and will improve our food quality standards.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          userId: isAdmin ? { name: 'Jane Smith', email: 'jane@example.com' } : undefined
        }
      ];
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadComplaints();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#4CAF50';
      case 'in-progress': return '#FF9800';
      default: return '#F44336';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in-progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Facilities': '#2196F3',
      'Food Services': '#FF5722',
      'Academic': '#9C27B0',
      'Technology': '#607D8B',
      'Other': '#795548'
    };
    return colors[category] || '#666';
  };

  const handleAdminResponse = (complaint) => {
    setSelectedComplaint(complaint);
    setResponseText(complaint.response || '');
    setResponseStatus(complaint.status === 'pending' ? 'in-progress' : complaint.status);
    setModalVisible(true);
  };

  const submitResponse = async () => {
    if (!responseText.trim()) {
      setSnackbarMessage('Please enter a response');
      setSnackbarVisible(true);
      return;
    }

    try {
      await updateComplaintStatus(selectedComplaint._id, {
        status: responseStatus,
        response: responseText
      });

      setSnackbarMessage('Response submitted successfully');
      setSnackbarVisible(true);
      setModalVisible(false);
      
      // Update local state
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === selectedComplaint._id 
            ? { ...complaint, status: responseStatus, response: responseText }
            : complaint
        )
      );
    } catch (error) {
      console.error('Error submitting response:', error);
      setSnackbarMessage('Failed to submit response');
      setSnackbarVisible(true);
    }
  };

  const renderComplaintItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Title style={styles.title} numberOfLines={2}>{item.title}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <View style={styles.categoryContainer}>
          <Chip 
            style={[styles.categoryChip, { backgroundColor: getCategoryColor(item.category) }]}
            textStyle={styles.categoryText}
          >
            {item.category}
          </Chip>
        </View>

        <Paragraph style={styles.description} numberOfLines={3}>
          {item.description}
        </Paragraph>

        {isAdmin && item.userId && (
          <View style={styles.userInfo}>
            <Text style={styles.userLabel}>Submitted by:</Text>
            <Text style={styles.userName}>{item.userId.name}</Text>
            <Text style={styles.userEmail}>{item.userId.email}</Text>
          </View>
        )}

        {item.response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseLabel}>Response:</Text>
            <Text style={styles.responseText}>{item.response}</Text>
          </View>
        )}

        <Divider style={styles.divider} />

        <View style={styles.footerContainer}>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
          
          {isAdmin && item.status !== 'resolved' && (
            <Button
              mode="contained"
              onPress={() => handleAdminResponse(item)}
              style={styles.respondButton}
              icon="reply"
            >
              {item.response ? 'Update Response' : 'Respond'}
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>
          {isAdmin ? 'All Complaints' : 'My Complaints'}
        </Title>
        <Text style={styles.headerSubtitle}>
          {isAdmin 
            ? 'Manage and respond to student complaints' 
            : 'Track the status of your submitted complaints'
          }
        </Text>
      </View>

      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {isAdmin 
              ? 'No complaints have been submitted yet.' 
              : 'You haven\'t submitted any complaints yet.'
            }
          </Text>
          {!isAdmin && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Complaints')}
              style={styles.submitButton}
              icon="plus"
            >
              Submit a Complaint
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaintItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Admin Response Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Title style={styles.modalTitle}>Respond to Complaint</Title>
          
          {selectedComplaint && (
            <View style={styles.complaintSummary}>
              <Text style={styles.complaintTitle}>{selectedComplaint.title}</Text>
              <Text style={styles.complaintDescription}>{selectedComplaint.description}</Text>
            </View>
          )}

          <View style={styles.statusSelector}>
            <Text style={styles.statusLabel}>Status:</Text>
            <View style={styles.statusButtons}>
              <Button
                mode={responseStatus === 'in-progress' ? 'contained' : 'outlined'}
                onPress={() => setResponseStatus('in-progress')}
                style={styles.statusButton}
              >
                In Progress
              </Button>
              <Button
                mode={responseStatus === 'resolved' ? 'contained' : 'outlined'}
                onPress={() => setResponseStatus('resolved')}
                style={styles.statusButton}
              >
                Resolved
              </Button>
            </View>
          </View>

          <TextInput
            label="Response"
            value={responseText}
            onChangeText={setResponseText}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.responseInput}
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={submitResponse}
              style={[styles.modalButton, styles.submitResponseButton]}
            >
              Submit Response
            </Button>
          </View>
        </Modal>
      </Portal>

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
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#003366',
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    color: '#003366',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
  },
  description: {
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  userLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
  },
  responseContainer: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 18,
  },
  divider: {
    marginVertical: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  respondButton: {
    backgroundColor: '#003366',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#003366',
  },
  complaintSummary: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  complaintDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  statusSelector: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
  },
  responseInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  submitResponseButton: {
    backgroundColor: '#003366',
  },
});

export default ComplaintHistoryScreen;

