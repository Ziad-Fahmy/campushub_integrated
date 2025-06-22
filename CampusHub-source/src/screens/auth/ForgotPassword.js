import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .matches(/^[a-zA-Z0-9._%+-]+@university\.edu$/, 'Must be a university email')
    .required('Required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const handleForgotPassword = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setError('Failed to process request. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            Password reset instructions have been sent to your email.
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          >
            Back to Login
          </Button>
        </View>
      ) : (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <Text style={styles.instructions}>
                Enter your university email address and we'll send you instructions to reset your password.
              </Text>
              
              <TextInput
                label="University Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              {touched.email && errors.email && (
                <HelperText type="error">{errors.email}</HelperText>
              )}
              
              <Button 
                mode="contained" 
                onPress={handleSubmit} 
                loading={loading}
                style={styles.button}
              >
                Send Reset Instructions
              </Button>
              
              <Button 
                mode="text" 
                onPress={() => navigation.navigate('Login')}
                style={styles.textButton}
              >
                Back to Login
              </Button>
              
              {error && (
                <HelperText type="error" style={styles.errorText}>
                  {error}
                </HelperText>
              )}
            </View>
          )}
        </Formik>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#003366',
    textAlign: 'center',
  },
  instructions: {
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
  textButton: {
    marginTop: 10,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ForgotPasswordScreen;
