import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import Voice from '@react-native-voice/voice';
import OutputList from './OutputList';
import { database } from '../firebase'
import { ref } from  'firebase/database';

/** to remove and fix the WARN */
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
LogBox.ignoreAllLogs(); //Ignore all log notifications

type CommandData = {
    command: string;
    value?: string | number;
    countValue?: number;
  };

export default function VoiceRecognition() {

let [started, setStarted] = useState(false);
  let [results, setResults] = useState([]);
  let [listening, setListening] = useState(false);
  let [status, setStatus] = useState('');
  let [parameters, setParameters] = useState('');
  let [spokenText, setSpokenText] = useState('');
  let [commandData, setCommandData] = useState<CommandData[]>([]);
  let [data, setData] = useState<CommandData[]>([]);
  let [selectedLanguage, setSelectedLanguage] = useState("en-US"); // Default language is "en-US"
  let [showDropdown, setShowDropdown] = useState(false);

  let isSpeechStopped = false;
  const recognitionTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null> = useRef(null);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    } 
  }, []);

  const handleLanguageChange = (language:any) => {
    setSelectedLanguage(language);
    if (started) {
      stopSpeechToText();
      startSpeechToText();
    }
    setShowDropdown(false);
  };

  const openApp = () => {
    // Logic to open the app or perform related actions
    console.log('Opening the app...');
    setCommandData((prevCommandData) => [...prevCommandData, { command: 'open', value: undefined, countValue: undefined }]);
    setStatus('open');
    setParameters('');
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
      //to test with the countValue: undefined
      setCommandData((prevCommandData) => [...prevCommandData, { command: 'count', value, countValue: undefined }]);
      setStatus('count');
      setParameters(value.toString());
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
      await Voice.start(selectedLanguage);
      const timeout = setTimeout(stopSpeechToText, 5000);
      setTimeoutRef(timeout);
      setListening(true);
    } catch (error) {
      console.error(error);
    }
  }

  const stopSpeechToText = async () => {
    clearTimeout(recognitionTimeoutRef.current!);
    recognitionTimeoutRef.current = null;
    await Voice.stop();
    setListening(false);
  }

  const onSpeechResults = (result:any) => {
    const spokenText = result.value[0].toLowerCase(); // Get the recognized text
    setSpokenText(spokenText);
    stopSpeechToText(); // Stop the speech recognition when any speech is detected
    setStarted(false);

    // // Check if the spoken text matches the code command pattern
    // const codeMatch = spokenText.match(/code (\w+)/);
    // if (codeMatch) {
    //   const codeNumbers = codeMatch[1].split(' '); // Split the spoken numbers by spaces
    //   const codeValue = processCodeCommand(codeNumbers); // Process the spoken numbers as a code command
    //   if (codeValue !== null) {
    //     const codeCommandData = {
    //       command: 'code',
    //       value: codeValue.value,
    //     };
    //     setCommandData((prevCommandData) => [...prevCommandData, codeCommandData]);
    //   } else {
    //     console.log('Invalid code'); // Handle invalid code numbers
    //   }
    //   return;
    // }

    // Check if the spoken text matches the code command pattern
    const codeMatch = spokenText.match(/code (\w+)/);
    if (codeMatch) {
      const codeNumbers = codeMatch[1].split(' '); // Split the spoken numbers by spaces
      const codeValue = processCodeCommand(codeNumbers); // Process the spoken numbers as a code command
      if (codeValue !== null) {
        const codeCommandData = {
          command: 'code',
          value: codeValue.value,
          countValue: undefined, 
        };
        // Add the codeCommandData to the Firebase database
        database.ref('commands').push(codeCommandData)
        .then(() => {
          console.log('New line added to Firebase database');
        })
        .catch((error:any) => {
          console.log('Error adding new line to Firebase database:', error);
        });
      } else {
        console.log('Invalid code'); // Handle invalid code numbers
      }
      return;
    }

    // // Check if the spoken text matches the count command pattern
    // const countMatch = spokenText.match(/count (\w+)/);
    // if (countMatch) {
    //   const countNumbers = countMatch[1].split(' '); // Split the spoken numbers by spaces
    //   const countValue = processCountCommand(countNumbers); // Convert the spoken numbers to a numerical sequence
    //   if (countValue !== null) {
    //     const countCommandData = {
    //       command: 'count',
    //       value: countValue,

    //     };
    //     setCommandData((prevCommandData) => [...prevCommandData, countCommandData]);
    //   } else {
    //     console.log('Invalid number'); // Handle invalid numbers
    //   }
    //   return;
    // }
    // Check if the spoken text matches the count command pattern
    const countMatch = spokenText.match(/count (\w+)/);
    if (countMatch) {
      const countNumbers = countMatch[1].split(' '); // Split the spoken numbers by spaces
      const countValue = processCountCommand(countNumbers); // Convert the spoken numbers to a numerical sequence

      if (countValue !== null) {
        // Check if the value already exists in the data array
        const existingIndex = data.findIndex(item => item.value === parseInt(countValue));

        if (existingIndex !== -1) {
          // Value already exists, update the countValue
          const updatedData = [...data];
          updatedData[existingIndex].countValue = parseInt(countValue);
          setData(updatedData);
        } else {
          // Value doesn't exist, add a new data object
          const countCommandData = {
            command: 'code',
            value: parseInt(countValue),
            countValue: parseInt(countValue),
          };
          setData(prevData => [...prevData, countCommandData]);
        }
      } else {
        console.log('Invalid number'); // Handle invalid numbers
      }
      return;
    }
  
    const commandMatched = commands.some(({ command, callback }) => {
      if (spokenText.includes(command)) {
        const params = spokenText.replace(command, '').trim();
        callback(params);
        return true;
      }
      return false;
    });


    if (!commandMatched) {
      setResults(result.value); // Update the results array
    }
  }

  const processCodeCommand = (spokenNumbers: string[]): { command: string; value: string } | null => {
    const numberMap: { [key: string]: string } = {
      zero: '0',
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
    };
  
    const codeValue = spokenNumbers
      .map((spokenNumber) => numberMap[spokenNumber])
      .join('');
  
    return codeValue.length > 0 ? { command: 'code', value: codeValue } : null;
  };

  const processCountCommand = (spokenNumbers: string[]): string | null => {
    const numberMap: { [key: string]: string } = {
      zero: '0',
      one: '1',
      two: '2',
      three: '3',
      four: '4',
      five: '5',
      six: '6',
      seven: '7',
      eight: '8',
      nine: '9',
    };
  
    const countValue = spokenNumbers
    .map((spokenNumber) => {
      const number = numberMap[spokenNumber];
      console.log(`Spoken number: ${spokenNumber}, Mapped number: ${number}`);
      return number;
    })
    .join('');

    console.log(`Count value: ${countValue}`);
  
    return countValue.length > 0 && /^[0-9]+$/.test(countValue) ? countValue : null; // Return null if the count value is empty
  };

  const onSpeechError = (error:any) => {
    if (!isSpeechStopped) {
      if (error && error.code && error.message) {
        console.log(`Error occurred: ${error.code}/${error.message}`);
      } else {
        console.log("An error occurred while processing speech");
      }
      stopSpeechToText(); // Stop the speech recognition when an error occurs
      isSpeechStopped = true; // Set the flag to true to prevent further stopping attempts
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return ( 
  <View style={styles.container}>
    <View style={styles.statusContainer}>
      <Text style={styles.statusTitle}>Current Status</Text>
      <Text style={styles.status}>Status: {status}</Text>
      <Text style={styles.parametersTitle}>Parameters: {parameters}</Text>
    </View>
    <View style={styles.speechContainer}>
      <Text style={styles.speechTitle}>Current Speech</Text>
      <Text style={styles.speech}>{spokenText}</Text>
    </View>
    <View>
      {listening ? <Text style={styles.listeningContainer}>listening...</Text> : undefined}
    </View>

    <OutputList />

    {/*
    <View style={styles.speechContainer}>
      <Text>Data:</Text>
      {commandData.map((command, index) => (
        <Text key={index}>{JSON.stringify(command)}</Text>
      ))}
      <StatusBar style="auto" />
    </View>
    */}

    <View style={styles.bottomMenu}>
      {!listening ? (
        <TouchableOpacity style={styles.menuItem} onPress={startSpeechToText}>
          <Text style={styles.menuItemText}>Start to Listen</Text>
        </TouchableOpacity>
      ) : (
        undefined
      )}
      {listening ? (
        <TouchableOpacity style={styles.menuItem} onPress={stopSpeechToText}>
          <Text style={styles.menuItemText}>Stop Listening</Text>
        </TouchableOpacity>
      ) : (
        undefined
      )}
      <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
        <Text style={styles.dropdownButtonText}>{selectedLanguage}</Text>
      </TouchableOpacity>
    </View>
  {/* Dropdown list */}
  {showDropdown && (
      <View style={styles.dropdownList}>
        <TouchableOpacity
          style={styles.dropdownListItem}
          onPress={() => handleLanguageChange('en-US')}
        >
          <Text style={styles.dropdownListItemText}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dropdownListItem}
          onPress={() => handleLanguageChange('fr-FR')}
        >
          <Text style={styles.dropdownListItemText}>French</Text>
        </TouchableOpacity>
        {/* Add more language options as needed */}
      </View>
    )}
  </View>
  );
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#f0f0f0',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  menuItem: {
    flex: 1,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    position: 'absolute',
    top: 40,
    right: 0,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    elevation: 3,
    paddingVertical: 8,
  },
  dropdownListItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownListItemText: {
    fontSize: 16,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginTop: 35,
    marginHorizontal: 10,
    width:'95%', /** to adjust something wrong */
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  parametersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  speechContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    width: '95%', /** to adjust something wrong */
  },
  speechTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  speech: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  listeningContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginHorizontal: 10,
    width: '95%',
  },

});