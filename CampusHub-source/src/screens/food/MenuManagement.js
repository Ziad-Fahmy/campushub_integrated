import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Snackbar,
  ActivityIndicator,
  Divider,
  Text,
  Modal,
  Portal,
  Chip,
  FAB
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import apiClient from '../../api/apiClient';
import * as ImagePicker from 'react-native-image-picker';

const MenuManagement = ({ navigation }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state for adding/editing menu items
  const [formData, setFormData] = useState({
    imageUri: null,
    category: '',
    restaurantId: '',
    available: true
  });

  const categories = ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Snack'];

  const fetchMenuItems = async () => {
    try {
      const response = await apiClient.get('/admin/menu-items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems(response.data.menuItems || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setSnackbarMessage('Failed to fetch menu items');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await apiClient.get('/admin/restaurants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(response.data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([
        { _id: '1', name: 'Campus Café' },
        { _id: '2', name: 'The Dining Hall' },
        { _id: '3', name: 'Sushi Express' },
        { _id: '4', name: 'Pizza Place' }
      ]);
    }
  };

  const fetchData = async () => {
    await Promise.all([fetchMenuItems(), fetchRestaurants()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      imageUri: null,
      category: '',
      restaurantId: '',
      available: true
    });
    setModalVisible(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      imageUri: item.imageUrl || null,
      category: item.category,
      restaurantId: item.restaurantId?._id || item.restaurantId,
      available: item.available
    });
    setModalVisible(true);
  };

  const handleImagePick = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        setFormData(prev => ({ ...prev, imageUri: response.assets[0].uri }));
      }
    });
  };

  const handleSaveItem = async () => {
    if (!formData.imageUri || !formData.category || !formData.restaurantId) {
      setSnackbarMessage('Please select an image, category, and restaurant.');
      setSnackbarVisible(true);
      return;
    }

    try {
      const data = new FormData();
      data.append('category', formData.category);
      data.append('restaurantId', formData.restaurantId);
      data.append('available', formData.available);
      if (formData.imageUri) {
        const uriParts = formData.imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        data.append('image', {
          uri: formData.imageUri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      if (editingItem) {
        await apiClient.put(`/admin/menu-items/${editingItem._id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        setSnackbarMessage('Menu item updated successfully');
      } else {
        await apiClient.post('/admin/menu-items', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        setSnackbarMessage('Menu item added successfully');
      }

      setSnackbarVisible(true);
      setModalVisible(false);
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      setSnackbarMessage('Failed to save menu item');
      setSnackbarVisible(true);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await apiClient.delete(`/admin/menu-items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbarMessage('Menu item deleted successfully');
      setSnackbarVisible(true);
      
      setMenuItems(prev => prev.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setSnackbarMessage('Failed to delete menu item');
      setSnackbarVisible(true);
    }
  };

  const toggleAvailability = async (itemId, currentAvailability) => {
    try {
      await apiClient.put(`/admin/menu-items/${itemId}`, 
        { available: !currentAvailability },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnackbarMessage(`Item ${!currentAvailability ? 'enabled' : 'disabled'} successfully`);
      setSnackbarVisible(true);
      
      setMenuItems(prev => 
        prev.map(item => 
          item._id === itemId 
            ? { ...item, available: !currentAvailability }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      setSnackbarMessage('Failed to update item availability');
      setSnackbarVisible(true);
    }
  };

  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find(r => r._id === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Loading menu items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Title style={styles.header}>Menu Management</Title>
        <Paragraph style={styles.subtitle}>
          Manage menu items across all restaurants
        </Paragraph>

        {menuItems.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Paragraph style={styles.emptyText}>
                No menu items found. Add your first menu item!
              </Paragraph>
            </Card.Content>
          </Card>
        ) : (
          menuItems.map((item) => (
            <Card key={item._id} style={styles.menuCard}>
              <Card.Content>
                {item.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
                )}
                <View style={styles.itemDetails}>
                  <Chip 
                    style={[styles.categoryChip, { backgroundColor: '#E3F2FD' }]} 
                    textStyle={styles.categoryText}
                  >
                    {item.category}
                  </Chip>
                  <Chip 
                    style={[
                      styles.availabilityChip, 
                      { backgroundColor: item.available ? '#E8F5E8' : '#FFEBEE' }
                    ]}
                    textStyle={[
                      styles.availabilityText,
                      { color: item.available ? '#2E7D32' : '#C62828' }
                    ]}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </Chip>
                </View>

                <Divider style={styles.divider} />

                <View style={styles.restaurantInfo}>
                  <Paragraph style={styles.label}>Restaurant:</Paragraph>
                  <Paragraph style={styles.value}>
                    {getRestaurantName(item.restaurantId?._id || item.restaurantId)}
                  </Paragraph>
                </View>

                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => handleEditItem(item)}
                    style={styles.actionButton}
                    icon="pencil"
                  >
                    Edit
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => toggleAvailability(item._id, item.available)}
                    style={[
                      styles.actionButton,
                      { borderColor: item.available ? '#FF9800' : '#4CAF50' }
                    ]}
                    icon={item.available ? 'eye-off' : 'eye'}
                  >
                    {item.available ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleDeleteItem(item._id)}
                    style={[styles.actionButton, styles.deleteButton]}
                    icon="delete"
                  >
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddItem}
        label="Add Menu Item"
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Title style={styles.modalTitle}>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </Title>

            <View style={styles.imageUploadSection}>
              <Button 
                mode="outlined" 
                onPress={handleImagePick} 
                icon="camera" 
                style={styles.imagePickerButton}
              >
                {formData.imageUri ? 'Change Image' : 'Select Image'}
              </Button>
              {formData.imageUri && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: formData.imageUri }} style={styles.imagePreview} />
                </View>
              )}
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((category) => (
                  <Chip
                    key={category}
                    selected={formData.category === category}
                    onPress={() => setFormData(prev => ({ ...prev, category }))}
                    style={styles.categoryOption}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Restaurant *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {restaurants.map((restaurant) => (
                  <Chip
                    key={restaurant._id}
                    selected={formData.restaurantId === restaurant._id}
                    onPress={() => setFormData(prev => ({ ...prev, restaurantId: restaurant._id }))}
                    style={styles.restaurantOption}
                  >
                    {restaurant.name}
                  </Chip>
                ))}
              </ScrollView>
            </View>

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
                onPress={handleSaveItem}
                style={[styles.modalButton, styles.saveButton]}
              >
                {editingItem ? 'Update' : 'Add'}
              
              </Button>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#003366',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  emptyCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  menuCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    flex: 1,
  },
  priceContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  itemDetails: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  categoryChip: {
    marginRight: 8,
  },
  categoryText: {
    color: '#1976D2',
  },
  availabilityChip: {
    marginRight: 8,
  },
  availabilityText: {
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  divider: {
    marginVertical: 10,
  },
  restaurantInfo: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
  },
  imageUploadSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePickerButton: {
    width: '80%',
    marginBottom: 10,
  },
  imagePreviewContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  categoryOption: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  restaurantOption: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#003366',
  },
});

export default MenuManagement;