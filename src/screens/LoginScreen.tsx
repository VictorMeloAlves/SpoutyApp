import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

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

  // Função para redefinir senha
  const handlePasswordReset = () => {
    if (email.length === 0) {
      Alert.alert('Recuperar Senha', 'Por favor, digite seu e-mail no campo acima para enviarmos o link de recuperação.');
      return;
    }

    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Verifique seu E-mail', 'Enviamos um link para você redefinir sua senha.');
      })
      .catch(error => {
        let errorMessage = 'Ocorreu um erro ao tentar enviar o e-mail.';
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'Nenhum usuário encontrado com este e-mail.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'O formato do e-mail é inválido.';
        }
        Alert.alert('Erro', errorMessage);
        console.error(error);
      });
  };
  // FIM DA FUNÇÃO ----------------------------------------

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
      />
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

      {/* Botão de Esqueci Minha Senha */}
      <TouchableOpacity onPress={handlePasswordReset} style={styles.forgotPasswordButton}>
        <Text style={styles.linkText}>Esqueceu sua senha?</Text>
      </TouchableOpacity>
      {/* FIM DO BOTÃO */}

      <View style={styles.buttonContainer}>
        <Button title="Entrar" onPress={handleLogin}
        color="#499844ff"
         />
      </View>
      <Button 
        title="Não tem uma conta? Cadastre-se" 
        onPress={() => navigation.navigate('SignUp')} 
        color="#074503ff"
      />
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  logo: {
    width: 350,       // Largura da logo
    height: 350,      // Altura da logo
    alignSelf: 'center',
    marginBottom: -100,
    resizeMode: 'contain'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f1ffe7ff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#d3d3d3ff',
  },
  input: {
    height: 50,
    borderColor: '#124803ff',
    borderWidth: 3,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 15,
    backgroundColor: '#406932ff',
    color: '#ffffffff',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  // Estilos para o botão de esqueci a senha
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  linkText: {
    color: '#124700ff',
    fontSize: 14,
  },
});

export default LoginScreen;