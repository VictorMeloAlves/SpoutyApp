import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Usuário criado & logado!');
        // A navegação para a HomeScreen será automática por causa do onAuthStateChanged
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erro', 'Este endereço de e-mail já está em uso!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'O endereço de e-mail é inválido!');
        } else {
          Alert.alert('Erro', 'Ocorreu um erro ao criar a conta.');
        }
        console.error(error);
      });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>Criar Conta</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        secureTextEntry
      />
      <Button title="Cadastrar" onPress={handleSignUp} />
      <Button title="Já tenho uma conta (Login)" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

export default SignUpScreen;