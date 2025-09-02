// screens/PointsPage.js
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function PointsPage({ navigation }) {
  const [points, setPoints] = useState(0);
  const confettiRef = useRef(null);

  useEffect(() => {
    // Random points from 1–100
    const randomPoints = Math.floor(Math.random() * 100) + 1;
    setPoints(randomPoints);

    // Fire confetti immediately
    confettiRef.current?.start();

    // Navigate back to HomeScreen after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Home');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.congrats}>🎉 Congrats! 🎉</Text>
      <Text style={styles.pointsText}>You earned {points} points!</Text>
      <Text style={styles.note}>(Returning to HomeScreen...)</Text>

      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -10, y: 0 }}
        fadeOut={true}
        autoStart={false}
        explosionSpeed={350}
        fallSpeed={3000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe4e1',
  },
  congrats: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff4500',
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 28,
    color: '#008000',
    fontWeight: '600',
  },
  note: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
});
