# React Native Emoji Keyboard

A custom emoji keyboard for react native

## Installation

Use as following after including it.

```javascript
import EmojiKeyboard from './EmojiKeyboard'

<EmojiKeyboard onChange={handleEmojiChange} show={showEmoji} />
```


## Errors
If it doesn't work for android make sure your AndroidManifest.xml setting is not set to adjustNothing.

```javascript
android:windowSoftInputMode="adjustNothing"
```

If you cannot change it then you can change it on runtime using

```bash
yarn add react-native-android-keyboard-adjust
```

```javascript
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust'
import { Platform } from 'react-native'

useEffect(() => {
    if (Platform.OS === 'android') {
      AndroidKeyboardAdjust.setAdjustResize()
    }
    return () => {
      if (Platform.OS === 'android') {
        AndroidKeyboardAdjust.setAdjustNothing()
      }
    }
}, [])
```
