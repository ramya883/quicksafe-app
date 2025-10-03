import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Car, Phone, MessageCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [checkInTimer, setCheckInTimer] = useState<number | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    }
  };

  const sendQuickAlert = async (type: 'car' | 'phone' | 'chat') => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to send alerts.');
      return;
    }

    const contactsJson = await AsyncStorage.getItem('emergencyContacts');
    const contacts = contactsJson ? JSON.parse(contactsJson) : [];

    if (contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add emergency contacts first in the Contacts tab.');
      return;
    }

    const messages = {
      car: '🚗 Come get me! I need a ride.',
      phone: '📞 Please call me now!',
      chat: '💬 I need some advice. Can we talk?',
    };

    const locationUrl = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    const message = `${messages[type]}\n\nMy location: ${locationUrl}`;

    Alert.alert(
      'Alert Sent',
      `Your alert has been prepared for ${contacts.length} contacts.\n\n${message}`,
      [{ text: 'OK' }]
    );
  };

  const startSafetyCheckIn = () => {
    const duration = 30;
    setCheckInTimer(duration);

    const interval = setInterval(() => {
      setCheckInTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          Alert.alert(
            'Safety Check-In',
            'Time to check in! Are you safe?',
            [
              { text: "I'm Safe", onPress: () => setCheckInTimer(null) },
              {
                text: 'Send SOS',
                style: 'destructive',
                onPress: () => sendSOS(),
              },
            ]
          );
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendSOS = async () => {
    if (!location) {
      await requestLocationPermission();
    }

    const contactsJson = await AsyncStorage.getItem('emergencyContacts');
    const contacts = contactsJson ? JSON.parse(contactsJson) : [];

    const locationUrl = location
      ? `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`
      : 'Location unavailable';

    Alert.alert(
      '🆘 SOS ALERT SENT',
      `Emergency alert has been sent to ${contacts.length} contacts.\n\nLocation: ${locationUrl}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>QuickSafe</Text>
        <Text style={styles.subtitle}>Your Safety Companion</Text>
      </View>

      <View style={styles.sosContainer}>
        <TouchableOpacity style={styles.sosButton} onPress={sendSOS}>
          <AlertTriangle size={48} color="#ffffff" />
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubtext}>Tap for Emergency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Alerts</Text>
        <View style={styles.alertGrid}>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => sendQuickAlert('car')}>
            <Car size={32} color="#2563eb" />
            <Text style={styles.alertLabel}>Come Get Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => sendQuickAlert('phone')}>
            <Phone size={32} color="#2563eb" />
            <Text style={styles.alertLabel}>Call Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => sendQuickAlert('chat')}>
            <MessageCircle size={32} color="#2563eb" />
            <Text style={styles.alertLabel}>Need Advice</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Check-In</Text>
        {checkInTimer !== null ? (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{checkInTimer}s</Text>
            <Text style={styles.timerLabel}>until check-in required</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCheckInTimer(null)}>
              <Text style={styles.cancelButtonText}>Cancel Timer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.checkInButton}
            onPress={startSafetyCheckIn}>
            <Text style={styles.checkInButtonText}>Start 30s Safety Timer</Text>
          </TouchableOpacity>
        )}
      </View>

      {location && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Current Location: {location.coords.latitude.toFixed(4)},{' '}
            {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </ScrollView>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
  },
  sosContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  sosButton: {
    backgroundColor: '#dc2626',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sosText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  sosSubtext: {
    fontSize: 12,
    color: '#fee2e2',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  alertGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  alertButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  alertLabel: {
    fontSize: 12,
    color: '#1e40af',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  timerLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#ef4444',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationInfo: {
    backgroundColor: '#f3f4f6',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
});
