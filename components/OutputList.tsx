import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, DataSnapshot } from  '@firebase/database';
// import { initializeApp } from 'firebase/app';
// import { getDatabase, ref, onValue, set } from 'firebase/database';

type OutputData = {
  command: string;
  value: number;
  countValue: number;
};

const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "AIzaSyANiQV3RKoUEwyZN8umCbp6UTCe-q8CJQw",
  authDomain: "zupanvoicereco.firebaseapp.com",
  databaseURL: "https://zupanvoicereco-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "zupanvoicereco",
  storageBucket: "zupanvoicereco.appspot.com",
  messagingSenderId: "105878091174",
  appId: "1:105878091174:web:d420df7358e95a1fd80b67"
};

initializeApp(firebaseConfig);
const database = getDatabase();


export default function OutputList() {

  const [data, setData] = useState<OutputData[]>([]);
  
  useEffect(() => {
    const fetchData = () => {
      const dataRef = ref(database);
      onValue(dataRef, (snapshot: DataSnapshot) => {
        const dataFromFirebase = snapshot.val();
        if (dataFromFirebase) {
          const newData = Object.values(dataFromFirebase);
          setData(newData as OutputData[]);
        }
      });
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Values</Text> 
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Command : {item.command}</Text>
            <Text style={styles.itemText}>Value : {item.value}</Text>
            <Text style={styles.itemText}>Count : {item.countValue}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: '#ebebeb',
    borderRadius: 10,
    padding: 25,
    marginVertical: 5,
    width: 400,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});