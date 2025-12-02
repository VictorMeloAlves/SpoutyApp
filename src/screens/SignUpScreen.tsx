import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text, StyleSheet, Switch, TouchableOpacity, Linking } from 'react-native';
import auth from '@react-native-firebase/auth';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  
  // Estados dos valores
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  
  // Estados de ERRO (Mensagens vermelhas)
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Função auxiliar para validar a força da senha
  const checkPasswordStrength = (pass: string): string | null => {
    if (!/[A-Z]/.test(pass)) return 'Falta uma letra maiúscula.';
    if (!/[0-9]/.test(pass)) return 'Falta um número.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return 'Falta um caractere especial (!@#$).';
    if (pass.length < 6) return 'Mínimo de 6 caracteres.';
    return null;
  };

  const handleSignUp = () => {
    // 1. Limpa erros anteriores antes de validar
    setPasswordError('');
    setConfirmError('');
    let hasError = false;

    // Validação de Campos Vazios
    if (email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validação: Senha igual ao Email
    if (password === email) {
      setPasswordError('A senha não pode ser igual ao e-mail.');
      hasError = true;
    }

    // Validação: Força da Senha
    const weakness = checkPasswordStrength(password);
    if (weakness) {
      setPasswordError(weakness); // Define o texto vermelho
      hasError = true;
    }

    // Validação: Confirmação de Senha
    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.'); // Define o texto vermelho
      hasError = true;
    }

    // Se houve qualquer erro, para aqui.
    if (hasError) return;

    // Validação LGPD (Esta continua como Alerta pois é uma regra de negócio)
    if (!acceptedTerms) {
      Alert.alert('Termos de Uso', 'Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar uma conta.');
      return;
    }

    // Criação da conta no Firebase
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('Usuário criado & logado!');
        Alert.alert("Sucesso", "Conta criada com segurança!");
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          Alert.alert('Erro', 'Este endereço de e-mail já está em uso!');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'O endereço de e-mail é inválido!');
        } else {
          Alert.alert('Erro', 'Ocorreu um erro ao criar a conta.');
          console.error(error);
        }
      });
  };

  const showTerms = () => {
    Alert.alert(
      "Privacidade e Dados (LGPD)",
      "O Spouty coleta seu e-mail para autenticação e dados dos sensores para o monitoramento. \n\nOs dados são armazenados de forma segura (via Google Firebase) e utilizados exclusivamente para o funcionamento do aplicativo, sem uso comercial por terceiros.\n\nDeseja ler a lei completa?",
      [
        { text: "Ler Lei Oficial", onPress: () => { Linking.openURL('http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'); } },
        { text: "Entendi", style: "cancel" }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      
      <TextInput
        placeholder="Email"
        placeholderTextColor="#dadadaff"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      {/* Campo de Senha */}
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#dadadaff"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError('');
        }}
        style={[styles.input, passwordError ? styles.inputError : null]}
        secureTextEntry
      />
      {/* MENSAGEM DE ERRO DA SENHA */}
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* Campo de Confirmação */}
      <TextInput
        placeholder="Confirme sua Senha"
        placeholderTextColor="#dadadaff"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setConfirmError('');
        }}
        style={[styles.input, confirmError ? styles.inputError : null]}
        secureTextEntry
      />
      {/* MENSAGEM DE ERRO DA CONFIRMAÇÃO */}
      {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

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

      <View style={styles.buttonContainer}>
        <Button title="Cadastrar" onPress={handleSignUp}
        color="#499844ff" />
      </View>
      
      <Button 
        title="Já tenho uma conta (Login)" 
        onPress={() => navigation.navigate('Login')} 
        color="#074503ff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f1ffe7ff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#174209ff',
  },
  input: {
    height: 50,
    borderColor: '#124803ff',
    borderWidth: 2,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#406932ff',
    color: '#ffffffff',
  },
  // Estilo para quando houver erro
  inputError: {
    borderColor: '#d32f2f',
    borderWidth: 1.5,
  },
  // Estilo do texto de erro
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
    marginTop: -5,
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