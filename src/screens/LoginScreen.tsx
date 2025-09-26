import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

// Definindo a tipagem para a propriedade de navegação
interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha o e-mail e a senha.');
      return;
    }

    auth()
      .signInWithEmailAndPassword(email, password)
      .then(userCredentials => {
        console.log('Usuário logado com sucesso!', userCredentials.user.email);
        // A navegação para a HomeScreen será automática por causa do onAuthStateChanged no App.tsx
      })
      .catch(error => {
        let errorMessage = 'Ocorreu um erro ao tentar fazer o login.';
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Nenhum usuário encontrado com este e-mail.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Senha incorreta. Por favor, tente novamente.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'O formato do e-mail é inválido.';
        }
        
        Alert.alert('Erro de Login', errorMessage);
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Spouty!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Entrar" onPress={handleLogin} />
      </View>
      <Button 
        title="Não tem uma conta? Cadastre-se" 
        onPress={() => navigation.navigate('SignUp')} 
        color="#6200ee" // Uma cor diferente para o botão secundário
      />
    </View>
  );
};

// Estilos básicos para organizar a tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginBottom: 12,
  },
});


export default LoginScreen;