import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Card, Title } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { addComplaint } from '../../redux/slices/complaintSlice';

const ComplaintSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, 'Title is too short')
    .max(100, 'Title is too long')
    .required('Required'),
  description: Yup.string()
    .min(20, 'Description is too short')
    .max(500, 'Description is too long')
    .required('Required'),
  location: Yup.string()
    .required('Required'),
  category: Yup.string()
    .required('Required'),
});

const NewComplaint = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      
      // In a real app, this would dispatch an action to submit to the API
      console.log("Submitting complaint:", values);
      dispatch(addComplaint({ ...values, id: Date.now() })); // Dispatch the addComplaint action
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      resetForm();
      setLoading(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Submit a Complaint</Title>
          <Text style={styles.subtitle}>
            Please provide details about your issue. We'll address it as soon as possible.
          </Text>
          
          {success && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Your complaint has been submitted successfully!
              </Text>
            </View>
          )}
          
          <Formik
            initialValues={{ 
              title: '', 
              description: '', 
              location: '',
              category: 'facilities' 
            }}
            validationSchema={ComplaintSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <View style={styles.form}>
                <TextInput
                  label="Complaint Title"
                  value={values.title}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  error={touched.title && errors.title}
                  style={styles.input}
                />
                {touched.title && errors.title && (
                  <HelperText type="error">{errors.title}</HelperText>
                )}
                
                <TextInput
                  label="Description"
                  value={values.description}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  error={touched.description && errors.description}
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
                {touched.description && errors.description && (
                  <HelperText type="error">{errors.description}</HelperText>
                )}
                
                <TextInput
                  label="Location"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                  error={touched.location && errors.location}
                  style={styles.input}
                  placeholder="e.g., Science Building, Room 101"
                />
                {touched.location && errors.location && (
                  <HelperText type="error">{errors.location}</HelperText>
                )}
                
                <Text style={styles.label}>Category</Text>
                <View style={styles.categoryContainer}>
                  {['facilities', 'academics', 'staff', 'food', 'other'].map((category) => (
                    <Button
                      key={category}
                      mode={values.category === category ? "contained" : "outlined"}
                      onPress={() => setFieldValue('category', category)}
                      style={styles.categoryButton}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Button>
                  ))}
                </View>
                
                <Button 
                  mode="contained" 
                  onPress={handleSubmit} 
                  loading={loading}
                  style={styles.button}
                  disabled={loading}
                >
                  Submit Complaint
                </Button>
              </View>
            )}
          </Formik>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>My Complaints</Title>
          <Text style={styles.emptyText}>
            You haven't submitted any complaints yet.
          </Text>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('ComplaintHistory')}
            style={styles.historyButton}
          >
            View Complaint History
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textArea: {
    marginBottom: 10,
    backgroundColor: '#fff',
    height: 100,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryButton: {
    margin: 4,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
  successContainer: {
    backgroundColor: '#DFF2BF',
    padding: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  successText: {
    color: '#4F8A10',
    textAlign: 'center',
  },
  historyButton: {
    marginTop: 10,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

export default NewComplaint;
