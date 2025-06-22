import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Snackbar,
  ActivityIndicator,
  Text,
  Chip
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { createComplaint } from '../../api/api';

const NewComplaint = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const categories = [
    'Facilities',
    'Food Services', 
    'Academic',
    'Technology',
    'Transportation',
    'Safety & Security',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setSnackbarMessage('Please enter a complaint title');
      setSnackbarVisible(true);
      return false;
    }
    
    if (!formData.description.trim()) {
      setSnackbarMessage('Please enter a complaint description');
      setSnackbarVisible(true);
      return false;
    }
    
    if (!formData.category) {
      setSnackbarMessage('Please select a category');
      setSnackbarVisible(true);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category
      };

      await createComplaint(complaintData);
      
      setSnackbarMessage('Complaint submitted successfully!');
      setSnackbarVisible(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: ''
      });
      
      // Navigate to history after a short delay
      setTimeout(() => {
        navigation.navigate('ComplaintHistory');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setSnackbarMessage('Failed to submit complaint. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setFormData({
              title: '',
              description: '',
              category: ''
            });
          }
        }
      ]
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Facilities': '#2196F3',
      'Food Services': '#FF5722',
      'Academic': '#9C27B0',
      'Technology': '#607D8B',
      'Transportation': '#4CAF50',
      'Safety & Security': '#F44336',
      'Other': '#795548'
    };
    return colors[category] || '#666';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Submit a Complaint</Title>
        <Paragraph style={styles.headerSubtitle}>
          Help us improve campus services by reporting issues or concerns
        </Paragraph>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <TextInput
            label="Complaint Title *"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            mode="outlined"
            style={styles.input}
            placeholder="Brief description of the issue"
            maxLength={100}
            disabled={loading}
          />
          
          <Text style={styles.characterCount}>
            {formData.title.length}/100 characters
          </Text>

          <View style={styles.categorySection}>
            <Text style={styles.categoryLabel}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={formData.category === category}
                  onPress={() => handleInputChange('category', category)}
                  style={[
                    styles.categoryChip,
                    formData.category === category && {
                      backgroundColor: getCategoryColor(category)
                    }
                  ]}
                  textStyle={[
                    styles.categoryText,
                    formData.category === category && { color: '#fff' }
                  ]}
                  disabled={loading}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </View>

          <TextInput
            label="Detailed Description *"
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={styles.descriptionInput}
            placeholder="Please provide detailed information about the issue, including location, time, and any other relevant details..."
            maxLength={500}
            disabled={loading}
          />
          
          <Text style={styles.characterCount}>
            {formData.description.length}/500 characters
          </Text>

          <View style={styles.userInfo}>
            <Text style={styles.userInfoLabel}>Submitted by:</Text>
            <Text style={styles.userInfoText}>{user?.name}</Text>
            <Text style={styles.userInfoText}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={handleReset}
          style={styles.resetButton}
          icon="refresh"
          disabled={loading}
        >
          Reset
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          icon="send"
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </Button>
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.infoTitle}>What happens next?</Title>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>1.</Text>
            <Text style={styles.stepText}>Your complaint will be reviewed by our admin team</Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>2.</Text>
            <Text style={styles.stepText}>You'll receive updates on the status of your complaint</Text>
          </View>
          <View style={styles.infoStep}>
            <Text style={styles.stepNumber}>3.</Text>
            <Text style={styles.stepText}>Check the History tab to track progress</Text>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.navigationButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('ComplaintHistory')}
          style={styles.historyButton}
          icon="history"
        >
          View My Complaints
        </Button>
      </View>

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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  formCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
  },
  descriptionInput: {
    marginBottom: 8,
    minHeight: 120,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  userInfoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  userInfoText: {
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  resetButton: {
    flex: 1,
    borderColor: '#666',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#003366',
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#003366',
    marginRight: 8,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  navigationButtons: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  historyButton: {
    borderColor: '#003366',
  },
});

export default NewComplaint;

