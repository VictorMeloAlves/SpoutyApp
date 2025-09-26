import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

// telas importadas
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import HomeScreen from './src/screens/HomeScreen';

// Cria os "controladores" de navegação
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

// Navegador para quando o usuário NÃO está logado
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
};

// Navegador para quando o usuário ESTÁ logado
const AppNavigator = () => {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
      {/* Outras telas do app virão aqui */}
    </AppStack.Navigator>
  );
};

const App = () => {
  // Estado para saber se o usuário está sendo inicializado
  const [initializing, setInitializing] = useState(true);
  // Estado para guardar os dados do usuário logado
  const [user, setUser] = useState();

  // "Ouvinte" do Firebase
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // Se desinscreve ao desmontar
  }, []);

  if (initializing) return null; // Pode mostrar uma tela de loading aqui

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default App;