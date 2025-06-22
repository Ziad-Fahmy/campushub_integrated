import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Title, Paragraph } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { voteComplaint } from '../../redux/slices/complaintSlice';

const ComplaintHistoryScreen = () => {
  const complaints = useSelector(state => state.complaints.complaints);
  const sortedComplaints = [...complaints].sort((a, b) => {
    const netVotesA = a.upvotes - a.downvotes;
    const netVotesB = b.upvotes - b.downvotes;
    return netVotesB - netVotesA; // Sort in descending order of net votes
  });
  const currentUser = useSelector(state => state.auth.user); // Assuming auth slice stores current user
  const dispatch = useDispatch();

  const handleVote = (complaintId, voteType) => {
    if (!currentUser) {
      // Handle case where user is not logged in (e.g., show a message)
      console.log('User not logged in to vote.');
      return;
    }
    dispatch(voteComplaint({ complaintId, userId: currentUser.id, voteType }));
  };

  const renderItem = ({ item }) => {
    const netVotes = item.upvotes - item.downvotes;
    const userVote = currentUser ? item.votedBy[currentUser.id] : null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title>{item.title}</Title>
          <Paragraph>Category: {item.category}</Paragraph>
          <Paragraph>Location: {item.location}</Paragraph>
          <Paragraph>{item.description}</Paragraph>
          <View style={styles.voteContainer}>
            <TouchableOpacity onPress={() => handleVote(item.id, 'upvote')}>
              <MaterialCommunityIcons
                name="arrow-up-bold-box"
                size={24}
                color={userVote === 'upvote' ? 'green' : 'gray'}
              />
            </TouchableOpacity>
            <Text style={styles.voteCount}>{netVotes}</Text>
            <TouchableOpacity onPress={() => handleVote(item.id, 'downvote')}>
              <MaterialCommunityIcons
                name="arrow-down-bold-box"
                size={24}
                color={userVote === 'downvote' ? 'red' : 'gray'}
              />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Complaint History</Text>
      {complaints.length === 0 ? (
        <Text style={styles.emptyText}>No complaints submitted yet.</Text>
      ) : (
        <FlatList
          data={sortedComplaints}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#003366',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 15,
    elevation: 2,
    borderRadius: 8,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
});

export default ComplaintHistoryScreen;