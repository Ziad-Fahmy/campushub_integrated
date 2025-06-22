import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Button, 
  TextInput, 
  Text, 
  ActivityIndicator,
  Snackbar,
  Chip,
  HelperText,
  Menu,
  Divider
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../../api/apiClient';

const AddEventScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
    category: 'academic',
    organizer: user?.name || '',
    contactEmail: user?.email || '',
    contactPhone: '',
    maxParticipants: '',
    registrationRequired: true,
    registrationLink: '',
    requirements: '',
    tags: [],
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  const isAdmin = user?.role === 'admin';

  const categories = [
    { key: 'academic', label: 'Academic' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'sports', label: 'Sports' },
    { key: 'social', label: 'Social' },
    { key: 'workshop', label: 'Workshop' },
    { key: 'seminar', label: 'Seminar' },
    { key: 'conference', label: 'Conference' },
    { key: 'other', label: 'Other' },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
    }

    if (!formData.organizer.trim()) {
      newErrors.organizer = 'Organizer name is required';
    }

    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.maxParticipants && (isNaN(formData.maxParticipants) || parseInt(formData.maxParticipants) < 1)) {
      newErrors.maxParticipants = 'Please enter a valid number of participants';
    }

    if (formData.registrationLink && !/^https?:\/\/.+/.test(formData.registrationLink)) {
      newErrors.registrationLink = 'Please enter a valid URL (starting with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [type]: selectedDate
      }));
    }
    
    // Hide pickers
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);

      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        registrationLink: formData.registrationLink || undefined,
        requirements: formData.requirements || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      };

      const response = await apiClient.post('/events', eventData);
      
      showSnackbar('Event created successfully!');
      
      // Navigate back to events list after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error.response?.data?.msg || 'Failed to create event';
      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAdmin) {
    return (
      <View style={styles.unauthorizedContainer}>
        <Title style={styles.unauthorizedTitle}>Access Denied</Title>
        <Text style={styles.unauthorizedText}>
          You need admin privileges to create events.
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Create New Event</Title>
          <Text style={styles.headerSubtitle}>
            Fill in the details below to create a new campus event
          </Text>
        </Card.Content>
      </Card>

      {/* Basic Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Basic Information</Title>
          
          <TextInput
            label="Event Title *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            style={styles.input}
            error={!!errors.title}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>

          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            style={styles.input}
            error={!!errors.description}
            mode="outlined"
            multiline
            numberOfLines={4}
          />
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>

          <TextInput
            label="Location *"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            style={styles.input}
            error={!!errors.location}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.location}>
            {errors.location}
          </HelperText>

          <View style={styles.categoryContainer}>
            <Text style={styles.inputLabel}>Category *</Text>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setCategoryMenuVisible(true)}
                  style={styles.categoryButton}
                  icon="chevron-down"
                  contentStyle={styles.categoryButtonContent}
                >
                  {categories.find(cat => cat.key === formData.category)?.label || 'Select Category'}
                </Button>
              }
            >
              {categories.map((category) => (
                <Menu.Item
                  key={category.key}
                  onPress={() => {
                    handleInputChange('category', category.key);
                    setCategoryMenuVisible(false);
                  }}
                  title={category.label}
                />
              ))}
            </Menu>
          </View>
        </Card.Content>
      </Card>

      {/* Date and Time */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Date & Time</Title>
          
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.inputLabel}>Start Date *</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateTimeButton}
                icon="calendar"
              >
                {formatDate(formData.startDate)}
              </Button>
            </View>
            
            <View style={styles.dateTimeColumn}>
              <Text style={styles.inputLabel}>Start Time *</Text>
              <Button
                mode="outlined"
                onPress={() => setShowStartTimePicker(true)}
                style={styles.dateTimeButton}
                icon="clock"
              >
                {formatTime(formData.startDate)}
              </Button>
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeColumn}>
              <Text style={styles.inputLabel}>End Date *</Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateTimeButton}
                icon="calendar"
                disabled={!formData.startDate}
              >
                {formatDate(formData.endDate)}
              </Button>
            </View>
            
            <View style={styles.dateTimeColumn}>
              <Text style={styles.inputLabel}>End Time *</Text>
              <Button
                mode="outlined"
                onPress={() => setShowEndTimePicker(true)}
                style={styles.dateTimeButton}
                icon="clock"
                disabled={!formData.startDate}
              >
                {formatTime(formData.endDate)}
              </Button>
            </View>
          </View>

          <HelperText type="error" visible={!!errors.endDate}>
            {errors.endDate}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Organizer Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Organizer Information</Title>
          
          <TextInput
            label="Organizer Name *"
            value={formData.organizer}
            onChangeText={(value) => handleInputChange('organizer', value)}
            style={styles.input}
            error={!!errors.organizer}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.organizer}>
            {errors.organizer}
          </HelperText>

          <TextInput
            label="Contact Email"
            value={formData.contactEmail}
            onChangeText={(value) => handleInputChange('contactEmail', value)}
            style={styles.input}
            error={!!errors.contactEmail}
            mode="outlined"
            keyboardType="email-address"
          />
          <HelperText type="error" visible={!!errors.contactEmail}>
            {errors.contactEmail}
          </HelperText>

          <TextInput
            label="Contact Phone"
            value={formData.contactPhone}
            onChangeText={(value) => handleInputChange('contactPhone', value)}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
        </Card.Content>
      </Card>

      {/* Registration Settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Registration Settings</Title>
          
          <TextInput
            label="Maximum Participants"
            value={formData.maxParticipants}
            onChangeText={(value) => handleInputChange('maxParticipants', value)}
            style={styles.input}
            error={!!errors.maxParticipants}
            mode="outlined"
            keyboardType="numeric"
            placeholder="Leave empty for unlimited"
          />
          <HelperText type="error" visible={!!errors.maxParticipants}>
            {errors.maxParticipants}
          </HelperText>

          <TextInput
            label="External Registration Link"
            value={formData.registrationLink}
            onChangeText={(value) => handleInputChange('registrationLink', value)}
            style={styles.input}
            error={!!errors.registrationLink}
            mode="outlined"
            placeholder="https://example.com/register"
          />
          <HelperText type="error" visible={!!errors.registrationLink}>
            {errors.registrationLink}
          </HelperText>
        </Card.Content>
      </Card>

      {/* Additional Information */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Additional Information</Title>
          
          <TextInput
            label="Requirements"
            value={formData.requirements}
            onChangeText={(value) => handleInputChange('requirements', value)}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Any special requirements or prerequisites"
          />

          <View style={styles.tagsContainer}>
            <Text style={styles.inputLabel}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                label="Add tag"
                value={newTag}
                onChangeText={setNewTag}
                style={styles.tagInput}
                mode="outlined"
                dense
              />
              <Button
                mode="outlined"
                onPress={addTag}
                style={styles.addTagButton}
                icon="plus"
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </View>
            
            <View style={styles.tagsDisplay}>
              {formData.tags.map((tag, index) => (
                <Chip
                  key={index}
                  style={styles.tag}
                  onClose={() => removeTag(tag)}
                  textStyle={styles.tagText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <Card style={styles.actionCard}>
        <Card.Content>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
              icon="check"
            >
              Create Event
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'startDate')}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'endDate')}
          minimumDate={formData.startDate}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startDate}
          mode="time"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'startDate')}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={formData.endDate}
          mode="time"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'endDate')}
        />
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
    </ScrollView>
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
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerTitle: {
    color: '#003366',
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  sectionTitle: {
    color: '#003366',
    fontSize: 18,
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  categoryContainer: {
    marginTop: 8,
  },
  categoryButton: {
    justifyContent: 'flex-start',
  },
  categoryButtonContent: {
    flexDirection: 'row-reverse',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateTimeButton: {
    justifyContent: 'flex-start',
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    marginBottom: 8,
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#E3F2FD',
  },
  tagText: {
    color: '#1976D2',
  },
  actionCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    elevation: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#003366',
  },
  backButton: {
    backgroundColor: '#003366',
  },
});

export default AddEventScreen;

