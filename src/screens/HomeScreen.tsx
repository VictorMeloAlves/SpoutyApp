import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {

  // Pega o email do usuário atualmente logado para personalizar a mensagem
  const user = auth().currentUser;
  const userEmail = user ? user.email : 'Usuário';

  const handleLogout = () => {
    auth()
      .signOut()
      .then(() => {
        console.log('Usuário deslogado!');
        // A navegação para a tela de Login será automática por causa do onAuthStateChanged no App.tsx
      })
      .catch(error => {
        Alert.alert('Erro', 'Ocorreu um erro ao tentar sair.');
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bem-vindo!</Text>
      <Text style={styles.emailText}>{userEmail}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Sair (Logout)" 
          onPress={handleLogout}
          color="#d32f2f" // Cor vermelha para o botão de sair
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  emailText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '80%',
  }
});

export default HomeScreen;