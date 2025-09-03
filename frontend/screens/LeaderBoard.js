// screens/Leaderboard.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const personalData = [
  { id: '1', name: 'You', score: 85 },
  { id: '2', name: 'Alice', score: 90 },
  { id: '3', name: 'Bob', score: 80 },
];

const neighbourhoodData = [
  { id: '1', name: 'Charlie', score: 95 },
  { id: '2', name: 'You', score: 85 },
  { id: '3', name: 'Eve', score: 80 },
];

export default function Leaderboard() {
  const renderItem = (item, index, highlightName = 'You') => (
    <View style={[styles.row, item.name === highlightName && styles.highlightRow]}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personal Leaderboard</Text>
      <FlatList
        data={personalData.sort((a,b) => b.score - a.score)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderItem(item, index)}
      />

      <Text style={[styles.title, { marginTop: 30 }]}>Neighbourhood Leaderboard</Text>
      <FlatList
        data={neighbourhoodData.sort((a,b) => b.score - a.score)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderItem(item, index)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  highlightRow: { backgroundColor: '#d0f0ff', borderRadius: 5 },
  rank: { fontWeight: 'bold', width: 30 },
  name: { flex: 1 },
  score: { fontWeight: 'bold' },
});
