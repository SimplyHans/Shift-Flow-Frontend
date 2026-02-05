import { StyleSheet, Text, View } from 'react-native';

export default function AvailabilityScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Availability</Text>
      <Text style={styles.subtitle}>Team availability will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
