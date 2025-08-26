import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Avatar, Card, Title } from 'react-native-paper';

const API_BASE_URL = 'http://192.168.1.50:5000/api'; // Your server IP address

const sendMessageToChatbot = async (message) => {
  try {
const response = await fetch('http://10.220.1.107:5000/api/chatbot/chat', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ message: message }),    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return 'Sorry, I am having trouble connecting to the chatbot service. Please try again later.';
  }
};

const ChatInterface = () => {
  const [message, setMessage] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState([
    {
      id: '1',
      message: 'Hello! I\'m your CampusHub assistant. How can I help you today? You can ask me about admissions, courses, facilities, events, or anything about King Salman International University!',
      isUserMessage: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5)
    }
  ]);
  const [loading, setLoading] = React.useState(false);
  const scrollViewRef = React.useRef();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      message: message.trim(),
      isUserMessage: true,
      createdAt: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const botResponse = await sendMessageToChatbot(currentMessage);

      const botMessageObj = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        isUserMessage: false,
        createdAt: new Date()
      };

      setChatHistory(prev => [...prev, botMessageObj]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Sorry, I encountered an error. Please make sure your backend server is running and try again.',
        isUserMessage: false,
        createdAt: new Date()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSuggestionPress = (suggestionText) => {
    setMessage(suggestionText);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContent}
      >
        {chatHistory.map((chat) => (
          <View
            key={chat.id}
            style={[
              styles.messageContainer,
              chat.isUserMessage ? styles.userMessageContainer : styles.botMessageContainer
            ]}
          >
            {!chat.isUserMessage && (
              <Avatar.Text
                size={40}
                label="CH"
                style={styles.botAvatar}
                color="#fff"
                backgroundColor="#003366"
              />
            )}
            <View
              style={[
                styles.messageBubble,
                chat.isUserMessage ? styles.userMessageBubble : styles.botMessageBubble
              ]}
            >
              <Text style={[styles.messageText, chat.isUserMessage && styles.userMessageText]}>
                {chat.message}
              </Text>
              <Text style={styles.messageTime}>{formatTime(chat.createdAt)}</Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <Avatar.Text
              size={40}
              label="CH"
              style={styles.botAvatar}
              color="#fff"
              backgroundColor="#003366"
            />
            <View style={[styles.messageBubble, styles.botMessageBubble, styles.typingBubble]}>
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <Card style={styles.inputCard}>
        <Card.Content style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask me about admissions, courses, facilities..."
            style={styles.input}
            multiline
            right={
              <TextInput.Icon
                icon="send"
                onPress={handleSendMessage}
                disabled={!message.trim() || loading}
                color={!message.trim() || loading ? "#ccc" : "#003366"}
              />
            }
            onSubmitEditing={handleSendMessage}
          />
        </Card.Content>
      </Card>

      <Card style={styles.helpCard}>
        <Card.Content>
          <Title style={styles.helpTitle}>Quick Questions</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Button
              mode="outlined"
              onPress={() => handleSuggestionPress("What are the admission requirements for Computer Science?")}
              style={styles.suggestionButton}
            >
              Admission Requirements
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleSuggestionPress("What facilities are available on campus?")}
              style={styles.suggestionButton}
            >
              Campus Facilities
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleSuggestionPress("What courses are offered in Engineering?")}
              style={styles.suggestionButton}
            >
              Engineering Courses
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleSuggestionPress("How can I contact the admissions office?")}
              style={styles.suggestionButton}
            >
              Contact Admissions
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleSuggestionPress("What events are happening this week?")}
              style={styles.suggestionButton}
            >
              Upcoming Events
            </Button>
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatContent: {
    paddingBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessageBubble: {
    backgroundColor: '#003366',
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  typingBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  typingText: {
    fontStyle: 'italic',
    color: '#666',
  },
  inputCard: {
    margin: 8,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
  },
  helpCard: {
    margin: 8,
    marginTop: 0,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#003366',
  },
  suggestionButton: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#003366',
  },
});

export default ChatInterface;

