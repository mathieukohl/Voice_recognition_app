import { StyleSheet, View, Text } from 'react-native';
import React from 'react';
import VoiceRecognition from './components/VoiceRecognition';

/**
 * 
 * On Android devices, there is a time limit for continuous speech recognition to 
 * prevent battery drain and ensure optimal performance.
 * 
 */


export default function App() {
  return (
    <View style={styles.container}>
      <VoiceRecognition /> 
    </View> 
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f0f0f0',
  },
})