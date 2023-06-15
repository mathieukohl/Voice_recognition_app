import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';
import { useEffect, useState } from 'react';
import Voice from '@react-native-voice/voice';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

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

  const openApp = () => {
    // Logic to open the app or perform related actions
    console.log('Opening the app...');
  }

  const closeApp = () => {
    // Logic to close the app or perform related actions
    console.log('Closing the app...');
  }

  const commands = [
    { command: 'open', callback: openApp },
    { command: 'close', callback: closeApp },
    // Add more commands as needed
  ];

  const startSpeechToText = async () => {
    try {
      await Voice.start("en-US");
      setStarted(true);
    } catch (error) {
      console.error(error);
    }
  }

  const stopSpeechToText = async () => {
    await Voice.stop();
    setStarted(false);
  }

  const onSpeechResults = (result:any) => {
    const spokenText = result.value[0].toLowerCase(); // Get the recognized text
    console.log(spokenText);
    //setResults(result.value)
    // Loop through the commands array to check if the spoken text matches any command
    for (const { command, callback } of commands) {
      if (spokenText.includes(command)) {
        callback();
        break; // Exit the loop after the first match
      }
    }
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
