import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, Button, View } from 'react-native';
import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import Voice from '@react-native-voice/voice';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

/**
 * 
 * On Android devices, there is a time limit for continuous speech recognition to 
 * prevent battery drain and ensure optimal performance.
 * 
 */

type CommandData = {
  command: string;
  value?: string | number;
};

export default function App() {

  let [started, setStarted] = useState(false);
  let [results, setResults] = useState([]);
  let [commandData, setCommandData] = useState<CommandData[]>([]);

  const recognitionTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef(null);

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
    setCommandData((prevCommandData) => [...prevCommandData, { command: 'open', value: undefined }]);
  }

  const closeApp = () => {
    // Logic to close the app or perform related actions
    console.log('Closing the app...');
    stopSpeechToText();
    setCommandData([]);
  }

  const countCommand = (params: string) => {
    const value = parseInt(params.replace(/\s/g, ''), 10);
    if (!isNaN(value)) {
      console.log(`Count command: ${value}`);
      setCommandData((prevCommandData) => [...prevCommandData, { command: 'count', value }]);
    } else {
      console.log('Invalid count command. Ignoring.');
    }
  }

  const resetCommand = () => {
    console.log('Reset command');
    setCommandData([]);
  }

  const backCommand = () => {
    console.log('Back command');
    setCommandData((prevCommandData) => prevCommandData.slice(0, -1));
  }

  const commands = [
    { command: 'open', callback: openApp },
    //{ command: 'ouvrir', callback: openApp },
    { command: 'close', callback: closeApp },
    { command: 'count', callback: countCommand },
    { command: 'reset', callback: resetCommand },
    { command: 'back', callback: backCommand },
    // Add more commands as needed
  ];

  const startSpeechToText = async () => {
    try {
      await Voice.start("en-US");
      //await Voice.start("fr-FR");
      setStarted(true);
      recognitionTimeoutRef.current = setTimeout(() => {
        stopSpeechToText();
        startSpeechToText();
      }, 5000); // Restart the recognition after 5 seconds
    } catch (error) {
      console.error(error);
    }
  }

  const stopSpeechToText = async () => {
    clearTimeout(recognitionTimeoutRef.current!);
    recognitionTimeoutRef.current = null;
    await Voice.stop();
    setStarted(false);
  }

  const onSpeechResults = (result:any) => {
    const spokenText = result.value[0].toLowerCase(); // Get the recognized text
    console.log(spokenText);
    //setResults(result.value)
    // Check if any recognized word matches a command

    // Check if the spoken text matches the count command pattern
    const countMatch = spokenText.match(/count (\w+)/);
    if (countMatch) {
      const countValue = parseInt(countMatch[1], 10); // Extract the numerical value
      const countCommandData = {
        command: 'count',
        value: countValue,
      };
      setCommandData((prevCommandData) => [...prevCommandData, countCommandData]);
      return;
    }
  
    const commandMatched = commands.some(({ command, callback }) => {
      if (spokenText.includes(command)) {
        const params = spokenText.replace(command, '').trim();
        callback(params);
        console.log('goes here true')
        return true;
      }
      console.log('goes here false')
      return false;
    });


    if (!commandMatched) {
      console.log('goes here not in array')
      setResults(result.value); // Update the results array
    }
  }

  const onSpeechError = (error:any) => {
    console.log(error);
  }

  return (
    <View style={styles.container}>
      { !started ? <Button title='Start to listen' onPress={startSpeechToText}></Button> : undefined } 
      { started ? <Button title='Stop listening' onPress={stopSpeechToText}></Button> : undefined }
      <Text>Command Data:</Text>
      {commandData.map((command, index) => (
        <Text key={index}>{JSON.stringify(command)}</Text>
      ))}
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
