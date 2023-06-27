I had issues using the voice so I tested all the functions with a string command 
- EX : const spokenText = 'count 1 8';
- npx ts-node ./test.tsx

Start the app 
 1. npx expo start
 2. start your emulator 
 3. accept & add microphone right on your emulator

Build the app
 1. eas build --profile development --platform android
 2. npx expo start --dev-client
 3. Scan the QR code with your device