import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Caption, Text, Button, Card, Divider, TextInput } from 'react-native-paper';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EditProfileScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);
  
  // In a real app, these would be state variables updated from the user object
  const [name, setName] = React.useState(user?.name || 'Demo User');
  const [email, setEmail] = React.useState(user?.email || 'demo@university.edu');
  const [phone, setPhone] = React.useState('+1 (555) 123-4567');
  const [address, setAddress] = React.useState('123 University Ave, Campus Housing Block B');
  const [emergencyContact, setEmergencyContact] = React.useState('Jane Doe (+1 555-987-6543)');
  
  const handleSave = () => {
    // In a real app, this would dispatch an action to update the user profile
    alert('Profile updated successfully!');
    navigation.goBack();
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={name.split(' ').map(n => n[0]).join('')} 
          backgroundColor="#003366" 
        />
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </View>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Personal Information</Title>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />
          
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
          
          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
            mode="outlined"
            multiline
          />
          
          <TextInput
            label="Emergency Contact"
            value={emergencyContact}
            onChangeText={setEmergencyContact}
            style={styles.input}
            mode="outlined"
          />
        </Card.Content>
      </Card>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={handleSave}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  changePhotoText: {
    marginTop: 10,
    color: '#003366',
    fontWeight: 'bold',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#003366',
    marginBottom: 5,
  },
  divider: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  saveButton: {
    flex: 1,
    marginRight: 5,
    backgroundColor: '#003366',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
    borderColor: '#003366',
  }
});

export default EditProfileScreen;
