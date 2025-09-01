 import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>This is the Home Screen</Text>
      <Button
        title="Go to All Users"
        onPress={() => navigation.navigate('AllUsers')}
      />
    </View>
  );
}
