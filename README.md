## Info & Testing

I had issues using the voice so I tested all the functions with a string command 
- EX : const spokenText = 'count 1 8';
- npx ts-node ./test.tsx

## Start the app 

 1. npx expo start
 2. start your emulator 
 3. accept & add microphone right on your emulator

## Build the app

 1. eas build --profile development --platform android
 2. npx expo start --dev-client
 3. Scan the QR code with your device


 ## How it work

 1. press the Start to Listen (be careful it might stop listening at any time)
 2. add a code by using the command "code" following by numbers from 0-9 like this 
 "code 2 5 4 8 1 6"
 3. if you made a mistake call the command "back it will remove the last line"
 4. after entering the right code use the command "count" to add the number of article of this specifc code like this (if it's 17 you will say one seven) "count 1 7"