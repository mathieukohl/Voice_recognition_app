import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';

type OutputData = {
  command: string;
  value: number;
  countValue: number;
};

export default function OutputList() {
  const [data, setData] = useState<OutputData[]>([
    { command: 'code', value: 4252, countValue: 18 },
    { command: 'code', value: 4251, countValue: 9 },
    { command: 'code', value: 4232, countValue: 27 },
    { command: 'code', value: 4221, countValue: 44 },
    { command: 'code', value: 5548, countValue: 2 },
    { command: 'code', value: 3252, countValue: 1 },
    { command: 'code', value: 6751, countValue: 34 },
    { command: 'code', value: 9832, countValue: 2 },
    { command: 'code', value: 2321, countValue: 1 },
    { command: 'code', value: 5363, countValue: 0 },
  ]);

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