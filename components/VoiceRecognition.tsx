import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import Voice from '@react-native-voice/voice';
import OutputList from './OutputList';
import { ref, onValue, DataSnapshot, set } from '@firebase/database';
import { database } from '../firebase';

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
  let [message, setMessage] = useState('');

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
    console.log('Opening the app...');
    setCommandData((prevCommandData) => [...prevCommandData, { command: 'open', value: undefined, countValue: undefined }]);
    setStatus('open');
    setParameters('');
  }

  const closeApp = () => {
    console.log('Closing the app...');
    stopSpeechToText();
    setCommandData([]);
  }

  const codeCommand = (params: string) => {
    const codeMatch = params
    if (/^\d+$/.test(codeMatch)) {
        const codeValue = processCodeCommand(codeMatch);
        console.log('codeValue',codeValue)
        if (codeValue !== null) {
          const codeCommandData = {
            command: 'code',
            value: codeValue.value,
            countValue: 0,
          };
          // Get a reference to the "commandData" node in your database
          const commandDataRef = ref(database);
    
          // Retrieve the current command data from the database
          onValue(commandDataRef, (snapshot: DataSnapshot) => {
            // Get the command data as an array
            const commandDataArray = snapshot.val();
    
            // Check if the commandDataArray is not null
            if (commandDataArray !== null) {
            
              // Check if the code value already exists in the command data array
              const existingCodeValue = commandDataArray.find(
                (data: any) => data.command === 'code' && data.value === codeCommandData.value
              );
    
              if (existingCodeValue) {
                showMessage('Code value already exists');
                return;
              }
              
              // Add the new code command data to the existing command data array
              const updatedCommandDataArray = [...commandDataArray, codeCommandData];
    
              // Update the "commandData" node in the database with the updated command data
              set(commandDataRef, updatedCommandDataArray)
                .catch(() => {
                  showMessage('Error updating command data:');
                });
            } else {
              showMessage('Command data is null');
            }
          }, {
            onlyOnce: true
        });
       } else {
        showMessage('Invalid code'); // Handle invalid code numbers
       }
      } else {
      showMessage('Input should contain only numeric characters');
    }
  }

  const countCommand = (params: string) => {
    const spokenNumbers = params
    if (/^\d+$/.test(spokenNumbers)) {
        const countValue = processCountCommand(spokenNumbers);
        if (countValue !== null) {

            // Get a reference to the "commandData" node in your database
            const commandDataRef = ref(database);

            // Retrieve the current command data from the database
            onValue(commandDataRef, (snapshot: DataSnapshot) => {
                // Get the command data as an array
                const commandDataArray = snapshot.val();

                // Check if the commandDataArray is not null
                if (commandDataArray !== null) {
                // Find the last code command data in the array
                const lastCommandData = commandDataArray[commandDataArray.length - 1];

                // Check if the lastCommandData exists
                if (lastCommandData) {
                    // Update the countValue of the last command data
                    lastCommandData.countValue = countValue;

                    // Update the "commandData" node in the database with the updated command data
                    set(commandDataRef, commandDataArray)
                    .catch(() => {
                    showMessage('Error updating command data:');
                    });
                } else {
                  showMessage('No code command found in the database');
                }
              } else {
              showMessage('Command data is null');
              }
            }, {
                onlyOnce: true
            });
        } else {
        showMessage('Invalid value');
        }
      } else {
      showMessage('Input should contain only numeric characters');
    }
  };

  const resetCommand = () => {
    setCommandData([]);
  }

  // Back Comamand, delete the last line of data
  const backCommand = () => {

    // Get a reference to the "commandData" node in your database
    const commandDataRef = ref(database);

    // Retrieve the current command data from the database
    onValue(commandDataRef, (snapshot: DataSnapshot) => {
      // Get the command data as an array
      const commandDataArray = snapshot.val();

      // Check if the commandDataArray is not null
      if (commandDataArray !== null) {
        // Remove the last element from the command data array
        const updatedCommandDataArray = commandDataArray.slice(0, -1);

        // Update the "commandData" node in the database with the updated command data
        set(commandDataRef, updatedCommandDataArray)
          .catch((error) => {
            console.error('Error updating command data:', error);
          });
      } else {
        console.log('Command data is null');
      }
    }, {
      onlyOnce: true
    });
  };

  const commands = [
    { command: 'open', callback: openApp },
    //{ command: 'ouvrir', callback: openApp },
    { command: 'close', callback: closeApp },
    { command: 'code', callback: codeCommand },
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
  
    const commandMatched = commands.some(({ command, callback }) => {
      if (spokenText.includes(command)) {
        const params = spokenText.replace(command, '').trim();
        callback(params);
        return true;
      }
      return false;
    });

    if (!commandMatched) {
      showMessage('Command not matched');
    }
  }

  const processCodeCommand = (spokenNumbers: string): { command: string; value: string } | null => {
    const codeNumbers = spokenNumbers.split(' ');
    const codeValue = codeNumbers.join('');
    return codeValue.length > 0 ? { command: 'code', value: codeValue } : null;
  };

  const processCountCommand = (spokenNumbers: string): string | null => {    
      const countNumbers = spokenNumbers.split(' ');
      const countValue = countNumbers.join('');
    
      return countValue.length > 0 ? countValue : null;
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

  function showMessage(message: string) {
    setMessage(message);
  }

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
      <Text id="message">{message}</Text>
    </View>
    <View>
      {listening ? <Text style={styles.listeningContainer}>listening...</Text> : undefined}
    </View>

    <OutputList />

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