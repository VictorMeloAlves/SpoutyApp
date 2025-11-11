import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estado para controlar o Switch da LGPD
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSignUp = () => {
    // Verifica se os termos foram aceitos
    if (!acceptedTerms) {
      Alert.alert('Termos de Uso', 'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.');
      return;
    }
    
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Usuário criado & logado!');
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

  // Função para abrir os termos
  const showTerms = () => {
    Alert.alert(
      "Termos e Privacidade",
      "Preciso colocar a LGPD aqui!!!!!."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha (mínimo 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      {/* Bloco do Switch LGPD */}
      <View style={styles.termsContainer}>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={acceptedTerms ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={setAcceptedTerms}
          value={acceptedTerms}
        />
        <TouchableOpacity onPress={showTerms} style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            Eu li e concordo com os <Text style={styles.linkText}>Termos de Uso</Text> e a <Text style={styles.linkText}>Política de Privacidade (LGPD)</Text>.
          </Text>
        </TouchableOpacity>
      </View>
      {/* FIM DO BLOCO */}

      <View style={styles.buttonContainer}>
        <Button title="Cadastrar" onPress={handleSignUp} />
      </View>
      <Button 
        title="Já tenho uma conta (Login)" 
        onPress={() => navigation.navigate('Login')} 
        color="#6200ee"
      />
    </View>
  );
};

// Estilos
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
    marginTop: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 5,
  },
  termsTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
  },
  linkText: {
    color: '#6200ee',
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;