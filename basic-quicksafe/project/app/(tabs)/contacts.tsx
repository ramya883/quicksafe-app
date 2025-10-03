import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Plus, Trash2, UserPlus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact } from '@/types';

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const contactsJson = await AsyncStorage.getItem('emergencyContacts');
    if (contactsJson) {
      setContacts(JSON.parse(contactsJson));
    }
  };

  const saveContacts = async (updatedContacts: EmergencyContact[]) => {
    await AsyncStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      Alert.alert('Missing Information', 'Please enter name and phone number.');
      return;
    }

    if (contacts.length >= 6) {
      Alert.alert('Maximum Reached', 'You can add up to 6 emergency contacts.');
      return;
    }

    const contact: EmergencyContact = {
      id: Date.now().toString(),
      ...newContact,
    };

    const updatedContacts = [...contacts, contact];
    saveContacts(updatedContacts);
    setNewContact({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
  };

  const deleteContact = (id: string) => {
    Alert.alert('Delete Contact', 'Are you sure you want to remove this contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedContacts = contacts.filter((c) => c.id !== id);
          saveContacts(updatedContacts);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.subtitle}>
          {contacts.length} of 6 contacts added
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {contacts.length === 0 && !isAdding && (
          <View style={styles.emptyState}>
            <UserPlus size={64} color="#9ca3af" />
            <Text style={styles.emptyText}>No emergency contacts yet</Text>
            <Text style={styles.emptySubtext}>
              Add trusted friends or family who can help in emergencies
            </Text>
          </View>
        )}

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              {contact.relationship && (
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteContact(contact.id)}>
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ))}

        {isAdding && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>Add New Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Name *"
              value={newContact.name}
              onChangeText={(text) =>
                setNewContact({ ...newContact, name: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={newContact.phone}
              keyboardType="phone-pad"
              onChangeText={(text) =>
                setNewContact({ ...newContact, phone: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Relationship (optional)"
              value={newContact.relationship}
              onChangeText={(text) =>
                setNewContact({ ...newContact, relationship: text })
              }
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsAdding(false);
                  setNewContact({ name: '', phone: '', relationship: '' });
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addContact}>
                <Text style={styles.saveButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!isAdding && contacts.length < 6 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAdding(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      )}
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
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
  },
  addForm: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
