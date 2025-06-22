import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Title, Text, RadioButton, HelperText, Divider, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../redux/slices/authSlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  // Basic user information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Role selection
  const [role, setRole] = useState('student');
  
  // Student-specific fields
  const [studentId, setStudentId] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  
  // Admin-specific fields
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  
  // Form validation
  const [errors, setErrors] = useState({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate basic fields
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    // Validate role-specific fields
    if (role === 'student') {
      if (!studentId) newErrors.studentId = 'Student ID is required';
      if (!major) newErrors.major = 'Major is required';
      if (!year) newErrors.year = 'Year is required';
    } else if (role === 'admin') {
      if (!department) newErrors.department = 'Department is required';
      if (!position) newErrors.position = 'Position is required';
      if (!employeeId) newErrors.employeeId = 'Employee ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        // Prepare registration data based on role
        const userData = {
          name,
          email,
          password,
          role,
          ...(role === 'student' 
            ? { studentId, major, year } 
            : { department, position, employeeId })
        };
        
        // Dispatch the register action
        const result = await dispatch(register(userData));
        
        if (register.fulfilled.match(result)) {
          // Registration successful
          setSnackbarMessage('Account created successfully! You are now logged in.');
          setSnackbarVisible(true);
          
          // Navigate to main app after a short delay
          setTimeout(() => {
            // The user should now be authenticated and the app will navigate automatically
            // based on the authentication state in your navigation logic
          }, 1500);
        } else {
          // Registration failed - error is handled by Redux and will show in the error state
          console.error('Registration failed:', result.payload);
        }
      } catch (error) {
        console.error('Registration error:', error);
        setSnackbarMessage('Registration failed. Please try again.');
        setSnackbarVisible(true);
      }
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Title style={styles.title}>Create Account</Title>
        
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Divider style={styles.divider} />
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            error={!!errors.name}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
          />
          {errors.name && <HelperText type="error">{errors.name}</HelperText>}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            error={!!errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            left={<TextInput.Icon icon="email" />}
          />
          {errors.email && <HelperText type="error">{errors.email}</HelperText>}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
          />
          {errors.password && <HelperText type="error">{errors.password}</HelperText>}
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
            error={!!errors.confirmPassword}
            mode="outlined"
            left={<TextInput.Icon icon="lock-check" />}
          />
          {errors.confirmPassword && <HelperText type="error">{errors.confirmPassword}</HelperText>}
        </View>
        
        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Type</Text>
          <Divider style={styles.divider} />
          
          <Text style={styles.label}>Select your role:</Text>
          
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[
                styles.roleCard, 
                role === 'student' && styles.selectedRoleCard
              ]}
              onPress={() => setRole('student')}
            >
              <Icon name="school" size={40} color={role === 'student' ? '#fff' : '#003366'} />
              <Text style={[styles.roleText, role === 'student' && styles.selectedRoleText]}>Student</Text>
              <RadioButton
                value="student"
                status={role === 'student' ? 'checked' : 'unchecked'}
                onPress={() => setRole('student')}
                color={role === 'student' ? '#fff' : '#003366'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.roleCard, 
                role === 'admin' && styles.selectedRoleCard
              ]}
              onPress={() => setRole('admin')}
            >
              <Icon name="account-tie" size={40} color={role === 'admin' ? '#fff' : '#003366'} />
              <Text style={[styles.roleText, role === 'admin' && styles.selectedRoleText]}>Administrator</Text>
              <RadioButton
                value="admin"
                status={role === 'admin' ? 'checked' : 'unchecked'}
                onPress={() => setRole('admin')}
                color={role === 'admin' ? '#fff' : '#003366'}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Conditional Fields Based on Role */}
        {role === 'student' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Student Information</Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="Student ID"
              value={studentId}
              onChangeText={setStudentId}
              style={styles.input}
              error={!!errors.studentId}
              mode="outlined"
              left={<TextInput.Icon icon="card-account-details" />}
            />
            {errors.studentId && <HelperText type="error">{errors.studentId}</HelperText>}
            
            <TextInput
              label="Major"
              value={major}
              onChangeText={setMajor}
              style={styles.input}
              error={!!errors.major}
              mode="outlined"
              left={<TextInput.Icon icon="book-open-variant" />}
            />
            {errors.major && <HelperText type="error">{errors.major}</HelperText>}
            
            <TextInput
              label="Year of Study"
              value={year}
              onChangeText={setYear}
              style={styles.input}
              error={!!errors.year}
              keyboardType="number-pad"
              mode="outlined"
              left={<TextInput.Icon icon="calendar" />}
            />
            {errors.year && <HelperText type="error">{errors.year}</HelperText>}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administrator Information</Text>
            <Divider style={styles.divider} />
            
            <TextInput
              label="Department"
              value={department}
              onChangeText={setDepartment}
              style={styles.input}
              error={!!errors.department}
              mode="outlined"
              left={<TextInput.Icon icon="domain" />}
            />
            {errors.department && <HelperText type="error">{errors.department}</HelperText>}
            
            <TextInput
              label="Position"
              value={position}
              onChangeText={setPosition}
              style={styles.input}
              error={!!errors.position}
              mode="outlined"
              left={<TextInput.Icon icon="briefcase" />}
            />
            {errors.position && <HelperText type="error">{errors.position}</HelperText>}
            
            <TextInput
              label="Employee ID"
              value={employeeId}
              onChangeText={setEmployeeId}
              style={styles.input}
              error={!!errors.employeeId}
              mode="outlined"
              left={<TextInput.Icon icon="badge-account" />}
            />
            {errors.employeeId && <HelperText type="error">{errors.employeeId}</HelperText>}
          </View>
        )}
        
        {/* Registration Button */}
        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
          icon="account-plus"
        >
          Create Account
        </Button>
        
        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
        
        {/* Display API error if any */}
        {error && (
          <Text style={styles.errorText}>
            {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
          </Text>
        )}
      </View>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
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
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 5,
  },
  divider: {
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  roleCard: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#003366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRoleCard: {
    backgroundColor: '#003366',
  },
  roleText: {
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#003366',
  },
  selectedRoleText: {
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#003366',
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginLink: {
    color: '#003366',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;
