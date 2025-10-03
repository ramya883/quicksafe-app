import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { MapPin, CircleAlert as AlertCircle, Shield, Lightbulb, Plus } from 'lucide-react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeLocation } from '@/types';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState<SafeLocation['type']>('safe_space');
  const [reportDescription, setReportDescription] = useState('');

  useEffect(() => {
    requestLocationPermission();
    loadSafeLocations();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    }
  };

  const loadSafeLocations = async () => {
    const locationsJson = await AsyncStorage.getItem('safeLocations');
    if (locationsJson) {
      setSafeLocations(JSON.parse(locationsJson));
    } else {
      const defaultLocations: SafeLocation[] = [
        {
          id: '1',
          latitude: 40.7580,
          longitude: -73.9855,
          type: 'police',
          description: 'NYPD Midtown North Precinct',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          latitude: 40.7614,
          longitude: -73.9776,
          type: 'hospital',
          description: 'Mount Sinai Hospital',
          created_at: new Date().toISOString(),
        },
      ];
      await AsyncStorage.setItem('safeLocations', JSON.stringify(defaultLocations));
      setSafeLocations(defaultLocations);
    }
  };

  const reportLocation = async () => {
    if (!location) {
      Alert.alert('Location Required', 'Please enable location services to report a location.');
      return;
    }

    if (!reportDescription.trim()) {
      Alert.alert('Description Required', 'Please provide a description for this location.');
      return;
    }

    const newLocation: SafeLocation = {
      id: Date.now().toString(),
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      type: reportType,
      description: reportDescription,
      created_at: new Date().toISOString(),
    };

    const updatedLocations = [...safeLocations, newLocation];
    await AsyncStorage.setItem('safeLocations', JSON.stringify(updatedLocations));
    setSafeLocations(updatedLocations);
    setIsReporting(false);
    setReportDescription('');
    Alert.alert('Success', 'Thank you for reporting this location!');
  };

  const getLocationIcon = (type: SafeLocation['type']) => {
    switch (type) {
      case 'police':
        return <Shield size={24} color="#2563eb" />;
      case 'hospital':
        return <AlertCircle size={24} color="#dc2626" />;
      case 'well_lit':
        return <Lightbulb size={24} color="#f59e0b" />;
      default:
        return <MapPin size={24} color="#10b981" />;
    }
  };

  const getLocationLabel = (type: SafeLocation['type']) => {
    switch (type) {
      case 'police':
        return 'Police Station';
      case 'hospital':
        return 'Hospital';
      case 'well_lit':
        return 'Well-Lit Area';
      default:
        return 'Safe Space';
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const sortedLocations = location
    ? [...safeLocations].sort((a, b) => {
        const distA = Math.hypot(
          a.latitude - location.coords.latitude,
          a.longitude - location.coords.longitude
        );
        const distB = Math.hypot(
          b.latitude - location.coords.latitude,
          b.longitude - location.coords.longitude
        );
        return distA - distB;
      })
    : safeLocations;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Map</Text>
        <Text style={styles.subtitle}>Nearby safe locations</Text>
      </View>

      <ScrollView style={styles.content}>
        {location && (
          <View style={styles.currentLocation}>
            <MapPin size={20} color="#2563eb" />
            <Text style={styles.currentLocationText}>
              Your location: {location.coords.latitude.toFixed(4)},{' '}
              {location.coords.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Locations ({sortedLocations.length})</Text>
          {sortedLocations.map((loc) => (
            <View key={loc.id} style={styles.locationCard}>
              <View style={styles.locationIcon}>{getLocationIcon(loc.type)}</View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{loc.description}</Text>
                <Text style={styles.locationType}>{getLocationLabel(loc.type)}</Text>
                {location && (
                  <Text style={styles.locationDistance}>
                    {calculateDistance(
                      location.coords.latitude,
                      location.coords.longitude,
                      loc.latitude,
                      loc.longitude
                    )}{' '}
                    away
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {isReporting && (
          <View style={styles.reportForm}>
            <Text style={styles.formTitle}>Report a Location</Text>
            <Text style={styles.formSubtitle}>Help others by sharing safe locations</Text>

            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'safe_space' && styles.typeButtonActive,
                ]}
                onPress={() => setReportType('safe_space')}>
                <MapPin size={20} color={reportType === 'safe_space' ? '#10b981' : '#9ca3af'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    reportType === 'safe_space' && styles.typeButtonTextActive,
                  ]}>
                  Safe Space
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'well_lit' && styles.typeButtonActive,
                ]}
                onPress={() => setReportType('well_lit')}>
                <Lightbulb size={20} color={reportType === 'well_lit' ? '#f59e0b' : '#9ca3af'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    reportType === 'well_lit' && styles.typeButtonTextActive,
                  ]}>
                  Well-Lit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'police' && styles.typeButtonActive,
                ]}
                onPress={() => setReportType('police')}>
                <Shield size={20} color={reportType === 'police' ? '#2563eb' : '#9ca3af'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    reportType === 'police' && styles.typeButtonTextActive,
                  ]}>
                  Police
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reportType === 'hospital' && styles.typeButtonActive,
                ]}
                onPress={() => setReportType('hospital')}>
                <AlertCircle size={20} color={reportType === 'hospital' ? '#dc2626' : '#9ca3af'} />
                <Text
                  style={[
                    styles.typeButtonText,
                    reportType === 'hospital' && styles.typeButtonTextActive,
                  ]}>
                  Hospital
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Describe this location..."
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setIsReporting(false);
                  setReportDescription('');
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={reportLocation}>
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {!isReporting && (
        <TouchableOpacity style={styles.reportButton} onPress={() => setIsReporting(true)}>
          <Plus size={24} color="#ffffff" />
          <Text style={styles.reportButtonText}>Report Location</Text>
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
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
  },
  currentLocationText: {
    fontSize: 12,
    color: '#1e40af',
    marginLeft: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  locationCard: {
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
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  locationType: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  locationDistance: {
    fontSize: 12,
    color: '#9ca3af',
  },
  reportForm: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  typeButtonActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  typeButtonText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: '#10b981',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  reportButton: {
    flexDirection: 'row',
    backgroundColor: '#10b981',
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
  reportButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
