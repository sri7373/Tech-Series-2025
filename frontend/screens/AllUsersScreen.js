import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, FlatList } from 'react-native';
import { getUsers } from '../services/api';   

export default function AllUsersScreen({ navigation }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    getUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    }, []); //empty array means on mount(when component loads on the screen), run this effect (fetching users).



    //screen return

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>All Users</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <Text style={{ fontSize: 16, marginVertical: 4 }}>
              {item.name} ({item.email})
            </Text>
          )}
        />
      )}
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
} 
