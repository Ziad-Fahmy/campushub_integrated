import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .matches(/^[a-zA-Z0-9._%+-]+@university\.edu$/, 'Must be a university email')
    .required('Required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Required'),
});

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);

  const handleLogin = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')} // We'll add this later
        style={styles.logo}
        defaultSource={require('../../../assets/logo.png')}
      />
      <Text style={styles.title}>CampusHub</Text>
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
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
            
            <TextInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && errors.password}
              secureTextEntry={secureTextEntry}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? "eye" : "eye-off"} 
                  onPress={() => setSecureTextEntry(!secureTextEntry)} 
                />
              }
              style={styles.input}
            />
            {touched.password && errors.password && (
              <HelperText type="error">{errors.password}</HelperText>
            )}
            
            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              loading={loading}
              style={styles.button}
            >
              Login
            </Button>
            
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.textButton}
            >
              Forgot Password?
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Register')}
              style={styles.outlinedButton}
            >
              Create Account
            </Button>
            
            {error && error.msg && (
              <HelperText type="error" style={styles.errorText}>
                {error.msg}
              </HelperText>
            )}
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#003366',
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
  outlinedButton: {
    marginTop: 10,
    borderColor: '#003366',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginScreen;
