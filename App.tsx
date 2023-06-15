import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';
import { useEffect, useState } from 'react';
import Voice from '@react-native-voice/voice';

export default function App() {

  let [started, setStarted] = useState(false);
  let [results, setResults] = useState([]);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    } 
  }, []);

  const startSpeechToText = async () => {
    await Voice.start("en-US");
    setStarted(true);
  }

  const stopSpeechToText = async () => {
    await Voice.stop();
    setStarted(false);
  }

  const onSpeechResults = (result:any) => {
    setResults(result.value)
  }

  const onSpeechError = (error:any) => {
    console.log(error);
  }

  return (
    <View style={styles.container}>
      { !started ? <Button title='Start Speech to Text' onPress={startSpeechToText}></Button> : undefined } 
      { started ? <Button title='Stop Speech to Text' onPress={stopSpeechToText}></Button> : undefined }
      {results.map((result, index) => <Text key={index}>{result}</Text>)}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
