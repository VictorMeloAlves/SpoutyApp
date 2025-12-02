import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Linking } from 'react-native';

const WifiSetupScreen = () => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');

  const handleConfigure = async () => {
    if (!ssid || !password) {
      Alert.alert("Erro", "Preencha o nome da rede e a senha.");
      return;
    }

    Alert.alert(
      "Conecte-se ao Vaso",
      "1. Vá nas configurações de Wi-Fi do seu celular.\n2. Conecte na rede 'Spouty-Setup' (Senha: spoutyadmin).\n3. Volte aqui e clique em 'Enviar'.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Já conectei, Enviar", 
          onPress: sendCredentials 
        }
      ]
    );
  };

  const sendCredentials = async () => {
    try {
      // O IP padrão do ESP32 em modo AP é 192.168.4.1
      // Enviamos os dados via URL (GET)
      const url = `http://192.168.4.1/configure?ssid=${encodeURIComponent(ssid)}&pass=${encodeURIComponent(password)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      Alert.alert("Sucesso!", "Configuração enviada. O vaso irá reiniciar e conectar na sua internet.");
    } catch (error) {
      Alert.alert("Enviado", "Verifique se o vaso reiniciou. Se sim, reconecte seu celular na internet normal.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Wi-Fi do Vaso</Text>
      <Text style={styles.instruction}>Digite o nome e a senha da SUA rede Wi-Fi (2.4GHz) para o Spouty conectar.</Text>
      
      <TextInput
        placeholder="Nome da Rede (SSID)"
        value={ssid}
        onChangeText={setSsid}
        style={styles.input}
      />
      
      <TextInput
        placeholder="Senha do Wi-Fi"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      
      <Button title="Configurar" onPress={handleConfigure} />
      
      <Text style={styles.note}>Nota: O Spouty não funciona em redes 5GHz.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f1ffe7ff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  instruction: { fontSize: 16, marginBottom: 20, color: '#555', textAlign: 'center' },
  input: { borderWidth: 2, borderColor: '#0a2401ff', padding: 10, marginBottom: 15, borderRadius: 5, backgroundColor: '#194509ff' },
  note: { marginTop: 20, color: 'red', textAlign: 'center', fontSize: 12 }
});

export default WifiSetupScreen;