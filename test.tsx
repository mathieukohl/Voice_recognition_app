import { ref, onValue, DataSnapshot, set } from '@firebase/database';
import { database } from './firebase';

const spokenText = 'count 1 8';

const processCountCommand = (spokenNumbers: string): string | null => {    
    const countNumbers = spokenNumbers.split(' ');
    const countValue = countNumbers.join('');
  
    return countValue.length > 0 ? countValue : null;
};

const countCommand = (params: string) => {
    const spokenNumbers = params
    if (spokenNumbers !== null) {
        const countValue = processCountCommand(spokenNumbers);
        if (countValue !== null) {
            const codeCommandData = {
                command: 'count',
                value: '',
                countValue: countValue
            };
            console.log('codeCommandData',codeCommandData)

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

                console.log("lastCodeCommandDataIndex", lastCommandData)

                // Check if the lastCommandData exists
                if (lastCommandData) {
                    // Update the countValue of the last command data
                    lastCommandData.countValue = countValue;

                    // Update the "commandData" node in the database with the updated command data
                    set(commandDataRef, commandDataArray)
                    .catch((error) => {
                    console.error('Error updating command data:', error);
                    });
                } else {
                    console.log('No code command found in the database');
                }
                } else {
                console.log('Command data is null');
                }
            }, {
                onlyOnce: true
            });
        } else {
        console.log('Invalid code'); // Handle invalid code numbers
        }
    }
};
  



const commands = [
  { command: 'count', callback: countCommand },
];

const commandMatched = commands.some(({ command, callback }) => {
  if (spokenText.startsWith(command)) {
    const params = spokenText.replace(command, '').trim();
    console.log('spokenText', spokenText);
    callback(params);
    return true;
  }
  return false;
});

if (!commandMatched) {
  console.log('Command not matched');
}