import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from 'react-native-geolocation-service';

// Define o tipo dificuldade para segurança
type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

const SettingsScreen = () => {
  // Estados para controlar a tela
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('MEDIO');
  const [isSavingDifficulty, setIsSavingDifficulty] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // --- FUNÇÃO PARA SALVAR A DIFICULDADE ---
  const handleSaveDifficulty = async () => {
    setIsSavingDifficulty(true);
    try {
      const response = await fetch('https://spouty.onrender.com/api/setdifficulty', { // Use sua URL correta!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: selectedDifficulty })
      });
      if (!response.ok) throw new Error('Falha ao salvar a dificuldade');
      
      Alert.alert('Sucesso!', `Dificuldade salva como: ${selectedDifficulty}`);

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a dificuldade.');
      console.error(error);
    }
    setIsSavingDifficulty(false);
  };

  // --- FUNÇÃO PARA PEGAR E SALVAR A LOCALIZAÇÃO ---
  const handleUpdateLocation = async () => {
    setIsFetchingLocation(true);
    try {
      // 1. Pede permissão
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permissão de Localização",
          message: "O Spouty precisa da sua localização para verificar o clima.",
          buttonPositive: "Permitir",
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permissão negada", "Sem a localização, o Spouty não poderá verificar o clima.");
        setIsFetchingLocation(false);
        return;
      }

      // Busca a localização
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Envia para o backend
          const response = await fetch('https://spouty.onrender.com/api/setlocation', { // Use sua URL!
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: latitude, lon: longitude })
          });
          if (!response.ok) throw new Error('Falha ao salvar localização');

          Alert.alert("Localização Atualizada!", "O Spouty já sabe onde você está.");
          setIsFetchingLocation(false);
        },
        (error) => {
          console.error(error);
          Alert.alert("Erro", "Não foi possível obter a localização.");
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (err) {
      console.warn(err);
      setIsFetchingLocation(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>

      {/* --- SELETOR DE DIFICULDADE --- */}
      <View style={styles.settingBlock}>
        <Text style={styles.label}>Nível de Dificuldade da Planta</Text>
        <Text style={styles.description}>
          Selecione o tipo de planta que você está cuidando.
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDifficulty}
            onValueChange={(itemValue) => setSelectedDifficulty(itemValue as Difficulty)}
            style={styles.picker}
          >
            <Picker.Item label="🌿 Fácil (Cacto, Suculenta)" value="FACIL" />
            <Picker.Item label="🌼 Médio (Jiboia, Violeta)" value="MEDIO" />
            <Picker.Item label="☀️ Difícil (Manjericão, Tomate)" value="DIFICIL" />
          </Picker>
        </View>
        <Button
          title={isSavingDifficulty ? "Salvando..." : "Salvar Dificuldade"}
          onPress={handleSaveDifficulty}
          disabled={isSavingDifficulty}
        />
      </View>

      {/* --- BOTÃO DE LOCALIZAÇÃO --- */}
      <View style={styles.settingBlock}>
        <Text style={styles.label}>Clima da Região</Text>
        <Text style={styles.description}>
          Atualize sua localização para o Spouty saber quando está chovendo ou de noite.
        </Text>
        {isFetchingLocation ? (
          <ActivityIndicator size="large" color="#007aff" />
        ) : (
          <Button
            title="Atualizar Minha Localização"
            onPress={handleUpdateLocation}
            color="#007aff"
          />
        )}
      </View>
    </View>
  );
};

// Estilos para a tela de Configurações
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  settingBlock: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  picker: {
    width: '100%',
  },
});

export default SettingsScreen;