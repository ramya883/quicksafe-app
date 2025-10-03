import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { useState } from 'react';
import { Phone, MessageCircle, ExternalLink, Circle as HelpCircle, Send } from 'lucide-react-native';
import { HotlineResource } from '@/types';

const hotlines: HotlineResource[] = [
  {
    id: '1',
    name: 'National Domestic Violence Hotline',
    phone: '1-800-799-7233',
    description: '24/7 support for domestic violence survivors',
    available: '24/7',
  },
  {
    id: '2',
    name: 'RAINN Sexual Assault Hotline',
    phone: '1-800-656-4673',
    description: 'Support for survivors of sexual assault',
    available: '24/7',
  },
  {
    id: '3',
    name: 'Crisis Text Line',
    phone: '741741',
    description: 'Text HOME to 741741 for crisis support',
    available: '24/7',
  },
  {
    id: '4',
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Mental health crisis support',
    available: '24/7',
  },
  {
    id: '5',
    name: 'Love is Respect',
    phone: '1-866-331-9474',
    description: 'Support for teen dating abuse',
    available: '24/7',
  },
];

const faqData = [
  {
    question: 'What should I do if I feel unsafe?',
    answer:
      'Trust your instincts. Move to a well-lit, populated area. Use the SOS button to alert your emergency contacts. Call 911 if in immediate danger.',
  },
  {
    question: 'How do I prepare for walking alone?',
    answer:
      'Share your route with trusted contacts, stay in well-lit areas, keep your phone charged, be aware of your surroundings, and trust your instincts.',
  },
  {
    question: 'What information should I share in an emergency?',
    answer:
      'Share your exact location, describe your situation briefly, mention any immediate threats, and follow the instructions of emergency responders.',
  },
  {
    question: 'How can I help a friend in danger?',
    answer:
      'Stay calm, listen without judgment, help them contact authorities if needed, offer to accompany them to safe locations, and respect their decisions.',
  },
];

export default function ResourcesScreen() {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [showChat, setShowChat] = useState(false);

  const callHotline = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages([...chatMessages, { role: 'user', text: userMessage }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = "I'm here to help. Here are some resources that might be useful:";

      const lowerInput = userMessage.toLowerCase();
      if (lowerInput.includes('unsafe') || lowerInput.includes('danger')) {
        botResponse =
          "If you're in immediate danger, please call 911. For support, you can contact the National Domestic Violence Hotline at 1-800-799-7233. Would you like to see more resources?";
      } else if (lowerInput.includes('walk') || lowerInput.includes('alone')) {
        botResponse =
          'When walking alone, stay in well-lit areas, share your route with trusted contacts, keep your phone charged, and trust your instincts. Use the Safety Map to find nearby safe locations.';
      } else if (lowerInput.includes('help') || lowerInput.includes('support')) {
        botResponse =
          'I can help you find crisis resources, safety tips, and emergency contacts. Check the Resources tab for hotlines, or visit the Contacts tab to set up your emergency contacts.';
      }

      setChatMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>Help & Support</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Hotlines</Text>
          <Text style={styles.sectionSubtitle}>24/7 support is available</Text>

          {hotlines.map((hotline) => (
            <View key={hotline.id} style={styles.hotlineCard}>
              <View style={styles.hotlineIcon}>
                <Phone size={24} color="#2563eb" />
              </View>
              <View style={styles.hotlineInfo}>
                <Text style={styles.hotlineName}>{hotline.name}</Text>
                <Text style={styles.hotlineDescription}>{hotline.description}</Text>
                <Text style={styles.hotlineAvailable}>{hotline.available}</Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callHotline(hotline.phone)}>
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqData.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <HelpCircle size={20} color="#2563eb" />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Chatbot</Text>
          <Text style={styles.sectionSubtitle}>Ask questions about safety and resources</Text>

          {!showChat ? (
            <TouchableOpacity style={styles.startChatButton} onPress={() => setShowChat(true)}>
              <MessageCircle size={24} color="#ffffff" />
              <Text style={styles.startChatText}>Start Chat</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.chatContainer}>
              <ScrollView style={styles.chatMessages}>
                {chatMessages.length === 0 && (
                  <View style={styles.chatWelcome}>
                    <Text style={styles.chatWelcomeText}>
                      Hi! I'm here to help with safety information and resources. Ask me anything!
                    </Text>
                  </View>
                )}
                {chatMessages.map((msg, index) => (
                  <View
                    key={index}
                    style={[
                      styles.chatMessage,
                      msg.role === 'user' ? styles.chatMessageUser : styles.chatMessageBot,
                    ]}>
                    <Text
                      style={[
                        styles.chatMessageText,
                        msg.role === 'user' && styles.chatMessageTextUser,
                      ]}>
                      {msg.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Type your question..."
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                  <Send size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://www.thehotline.org')}>
            <ExternalLink size={20} color="#2563eb" />
            <Text style={styles.linkText}>The National Domestic Violence Hotline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://www.rainn.org')}>
            <ExternalLink size={20} color="#2563eb" />
            <Text style={styles.linkText}>RAINN - Sexual Assault Resources</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => Linking.openURL('https://www.loveisrespect.org')}>
            <ExternalLink size={20} color="#2563eb" />
            <Text style={styles.linkText}>Love is Respect - Dating Safety</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  hotlineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotlineIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hotlineInfo: {
    flex: 1,
  },
  hotlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  hotlineDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  hotlineAvailable: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  callButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  faqCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  startChatButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startChatText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  chatContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatMessages: {
    height: 300,
    padding: 16,
  },
  chatWelcome: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  chatWelcomeText: {
    fontSize: 14,
    color: '#1e40af',
  },
  chatMessage: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    maxWidth: '80%',
  },
  chatMessageUser: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  chatMessageBot: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  chatMessageText: {
    fontSize: 14,
    color: '#1f2937',
  },
  chatMessageTextUser: {
    color: '#ffffff',
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 12,
    flex: 1,
  },
});
