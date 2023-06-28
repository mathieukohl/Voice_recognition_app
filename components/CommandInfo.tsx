import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CommandInfo = () => {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoText}>Available Commands:</Text>
      <Text style={styles.infoText}>- Code (add a new product)</Text>
      <Text style={styles.infoText}>- Count (add quantity to the product)</Text>
      <Text style={styles.infoText}>- Rest (reset the previous command)</Text>
      <Text style={styles.infoText}>- Back (remove the last code)</Text>
      <Text style={styles.infoText}> </Text>
      <Text style={styles.infoText}>Enter new code :</Text>
      <Text style={styles.infoText}>1. Use the command code to add a new code</Text>
      <Text style={styles.infoText}>2. Use the command count to add quantity to this new code</Text>
      <Text style={styles.infoText}>3. If you made a mistake use the command reset to delete the wrong code</Text>
      <Text style={styles.infoText}> </Text>
      <Text style={styles.infoText}>! Use only number from 0-9, if the code is 13534. You will say Code One Three Five Three Four !</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: '#F8F8F8',
    padding: 10,
    marginTop: 10,
    borderRadius: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
});

export default CommandInfo;