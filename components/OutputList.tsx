import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { ref, onValue, DataSnapshot } from  '@firebase/database';
import { database } from '../firebase'
import '../locales/index';
import { useTranslation } from 'react-i18next';

type OutputData = {
  command: string;
  value: number;
  countValue: number;
};


export default function OutputList() {

  const [data, setData] = useState<OutputData[]>([]);
  const {t} = useTranslation();
  
  useEffect(() => {
    const fetchData = () => {
      const dataRef = ref(database);
      // Listen for changes in the data at the specified reference
      // and execute the callback function when the data changes
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
      <Text style={styles.title}>{t('textDisplay.valuesTitle')}</Text> 
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{t('textDisplay.commandText')} {item.command}</Text>
            <Text style={styles.itemText}>{t('textDisplay.valueText')} {item.value}</Text>
            <Text style={styles.itemText}>{t('textDisplay.countText')} {item.countValue}</Text>
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