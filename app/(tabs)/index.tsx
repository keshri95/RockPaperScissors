import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const soundFiles = {
  click: require('../../assets/sounds/button-09a.mp3'),
  win: require('../../assets/sounds/applause-2.mp3'),
  lose: require('../../assets/sounds/button-2.mp3'),
  draw: require('../../assets/sounds/beep-05.mp3'),
};

const HomeScreen = () => {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedChoices, setSelectedChoices] = useState({ player: null, computer: null });

  const rockAnim = useRef(new Animated.Value(1)).current;
  const paperAnim = useRef(new Animated.Value(1)).current;
  const scissorsAnim = useRef(new Animated.Value(1)).current;

  const [sounds, setSounds] = useState({
    click: null,
    win: null,
    lose: null,
    draw: null,
  });

  const shakeAnimation = (anim) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.95, duration: 125, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.05, duration: 125, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.95, duration: 125, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.05, duration: 125, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1, duration: 125, useNativeDriver: true }),
    ]).start();
  };

  const playSound = async (soundKey) => {
    const soundObject = sounds[soundKey];
    if (soundObject) {
      try {
        await soundObject.replayAsync();
      } catch (error) {
        console.log(`${soundKey} sound failed`, error);
        Alert.alert('Error', `${soundKey} sound failed to play`);
      }
    }
  };

  const play = (playerChoice) => {
    playSound('click');

    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];

    setSelectedChoices({ player: playerChoice, computer: computerChoice });

    if (playerChoice === 'rock' || computerChoice === 'rock') shakeAnimation(rockAnim);
    if (playerChoice === 'paper' || computerChoice === 'paper') shakeAnimation(paperAnim);
    if (playerChoice === 'scissors' || computerChoice === 'scissors') shakeAnimation(scissorsAnim);

    let resultText = '';

    if (playerChoice === computerChoice) {
      resultText = "It's a Draw!";
      playSound('draw');

    } else if (

      (playerChoice === 'rock' && computerChoice === 'scissors') ||
      (playerChoice === 'paper' && computerChoice === 'rock') ||
      (playerChoice === 'scissors' && computerChoice === 'paper')

    ) {
      resultText = 'You Win!';
      setPlayerScore(playerScore + 1);
      playSound('win');

    } else {
      resultText = 'Computer Wins!';
      setComputerScore(computerScore + 1);
      playSound('lose');
    }

    setResult(`You chose ${playerChoice}, Computer chose ${computerChoice}. ${resultText}`);
    setHistory([
      ...history,
      `Round ${history.length + 1}: You chose ${playerChoice}, Computer chose ${computerChoice}. ${resultText}`,
    ]);

    setTimeout(() => {
      setSelectedChoices({ player: null, computer: null });
    }, 1000);
  };

  const resetGame = () => {
    playSound('click');
    setPlayerScore(0);
    setComputerScore(0);
    setResult('');
    setHistory([]);
    setSelectedChoices({ player: null, computer: null });
  };

  const scrollViewRef = useRef();

  useEffect(() => {
    const loadSounds = async () => {
      const soundMap = {};
        try {
          soundMap.click = new Audio.Sound();
          await soundMap.click.loadAsync(soundFiles.click);
          soundMap.win = new Audio.Sound();
          await soundMap.win.loadAsync(soundFiles.win);
          soundMap.lose = new Audio.Sound();
          await soundMap.lose.loadAsync(soundFiles.lose);
          soundMap.draw = new Audio.Sound();
          await soundMap.draw.loadAsync(soundFiles.draw);
          setSounds(soundMap);

        } catch (error) {
          console.log('Failed to load sounds', error);
          Alert.alert('Error', 'Failed to load sounds');
        }

    };

    loadSounds();

    return () => {
      Object.values(sounds).forEach((sound) => sound?.unloadAsync());
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [history]);

  return (
    <View style={styles.body}>
      <View style={styles.gameContainer}>
        <Text style={styles.title}>Rock-Paper-Scissors</Text>
        <View style={styles.scoreboard}>
          <Text style={styles.scoreText}>Player: {playerScore}</Text>
          <Text style={styles.scoreText}>Computer: {computerScore}</Text>
        </View>
        <View style={styles.choices}>
          {[
            { id: 'rock', image: 'https://img.icons8.com/?size=100&id=37409&format=png&color=000000', anim: rockAnim },
            { id: 'paper', image: 'https://img.icons8.com/?size=100&id=26243&format=png&color=000000', anim: paperAnim },
            { id: 'scissors', image: 'https://img.icons8.com/?size=100&id=37828&format=png&color=000000', anim: scissorsAnim },
          ].map((choice) => (
            <TouchableOpacity
              key={choice.id}
              style={[
                styles.choice,
                (selectedChoices.player === choice.id || selectedChoices.computer === choice.id) && styles.selected,
              ]}
              onPress={() => play(choice.id)}
              activeOpacity={0.7}
            >
              <Animated.Image
                source={{ uri: choice.image }}
                style={[styles.choiceImage, { transform: [{ scale: choice.anim }] }]}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.result}>{result}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </TouchableOpacity>
        <ScrollView style={styles.history} ref={scrollViewRef}>
          {history.map((item, index) => (
            <Text key={index} style={styles.historyItem}>{item}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default HomeScreen;

const { width } = Dimensions.get('window');
const isSmallDevice = width < 600;

const styles = StyleSheet.create({
  body: { 
    flex: 1, 
    flexDirection: 'column', 
    alignItems: 'center', 
    backgroundColor: '#ebe8e8', 
    padding: 20
  },

  gameContainer: { 
    maxWidth: 600, 
    width: '100%', 
    alignItems: 'center'
  },

  title: {
    fontFamily: Platform.select({ ios: 'GillSans', android: 'sans-serif' }),
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  scoreboard: { 
    flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 
  },
  scoreText: {
    fontFamily: Platform.select({ ios: 'GillSans', android: 'sans-serif' }),
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: 'bold',
  },

  choices: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    marginBottom: 20 
  },

  choice: {
    width: isSmallDevice ? 80 : 100,
    height: isSmallDevice ? 80 : 100,
    borderWidth: 3,
    borderColor: 'transparent',
    borderRadius: 10,
  },
  selected: { 
    borderColor: '#0f9b7d'
  },

  choiceImage: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'contain' 
  },

  result: {
    fontFamily: Platform.select({ ios: 'GillSans', android: 'sans-serif' }),
    fontSize: isSmallDevice ? 18 : 20,
    marginVertical: 20,
    minHeight: 24,
  },

  resetButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    backgroundColor: '#dc3545', 
    borderRadius: 5 
  },

  resetButtonText: {
    fontFamily: Platform.select({ ios: 'GillSans', android: 'sans-serif' }),
    fontSize: 18,
    color: 'white',
  },
  history: { 
    marginTop: 20, 
    maxHeight: 150, 
    width: '100%' 
  },

  historyItem: {
    fontFamily: Platform.select({ ios: 'GillSans', android: 'sans-serif' }),
    fontSize: 16,
    marginBottom: 5,
  },
});