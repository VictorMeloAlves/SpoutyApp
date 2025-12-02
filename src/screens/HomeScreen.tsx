import React, { useState, useEffect } from 'react';
import { 
  View, Text, Button, StyleSheet, ActivityIndicator, Switch, Alert, 
  Modal, PermissionsAndroid 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Geolocation from 'react-native-geolocation-service';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

// --- COMPONENTE DE BARRA DE STATUS ---
// - label: O nome (ex: "Umidade")
// - value: Um número de 0.0 a 1.0 (representando 0% a 100%)
// - color: A cor da barra
const StatusBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {

  const clampedValue = Math.max(0, Math.min(1, value));
  
  return (
    <View style={barStyles.container}>
      <Text style={barStyles.label}>{label}</Text>
      <View style={barStyles.barBackground}>
        <View style={[barStyles.barFill, { width: `${clampedValue * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};
// Estilos para a barra
const barStyles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
  },
  barBackground: {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
});
// --- FIM DO COMPONENTE DE BARRA DE STATUS ---

// Define o Clima
type WeatherData = {
  temp: number;
  description: string;
  isNight: boolean;
  condition: string;
};

// Define um tipo para os dados de sensores
type SensorData = {
  luminosity: number;
  soilMoisture: number;
  uvLevel: number;
};

// Define um tipo para o estado de controle
type ControlData = {
  ledState: 'on' | 'off';
};

// --- Tradutor de status ---
const statusMap = {
  CARREGANDO: { message: 'Carregando...', color: '#888' },
  HAPPY: { message: 'Estou feliz e saudável!', color: '#2b8a3e' },
  SLEEPING: { message: 'Zzz... (Dormindo)', color: '#555' },
  THIRSTY: { message: 'Estou com muita sede!', color: '#cc3300' },
  OVERWATERED: { message: 'Acho que bebi água demais!', color: '#0066cc' },
  SAD_NEEDS_SUN: { message: 'Preciso de sol, quem sabe amanhã...', color: '#f5a623' },
  NEEDS_SUN_NOW: { message: 'Me leve para o sol, por favor!', color: '#f5a623' },
  UNKNOWN: { message: 'Status desconhecido...', color: '#888' },
};

type StatusKey = keyof typeof statusMap;

function translateStatus(statusKey: StatusKey): { message: string, color: string } {
  return statusMap[statusKey in statusMap ? statusKey : 'UNKNOWN'];
}

// Função para validar a string do Firestore
function isStatusKey(key: string): key is StatusKey {
  return key in statusMap;
}

const HomeScreen: React.FC<{ navigation: NavigationProp<ParamListBase> }> = ({ navigation }) => {
  const user = auth().currentUser;
  
  const [loading, setLoading] = useState(true);
  const [sensors, setSensors] = useState<SensorData | null>(null);
  const [controls, setControls] = useState<ControlData | null>(null);
  const [calculatedStatus, setCalculatedStatus] = useState<StatusKey>("CARREGANDO");
  const [weather, setWeather] = useState<WeatherData | null>(null);


  useEffect(() => {
    const subscriber = firestore()
      .collection('devices')
      .doc('vaso_01')
      .onSnapshot(
        (documentSnapshot) => {
          
          if (documentSnapshot.exists()) {
            
            const deviceData = documentSnapshot.data(); 
            if (deviceData) {
              
              if (deviceData.config && deviceData.config.difficulty) {
                setIsFirstUseModalVisible(false);
              } else {
                setIsFirstUseModalVisible(true);
              }

              if (deviceData.sensors) setSensors(deviceData.sensors);

              if (deviceData.weather) { //Le o Clima
                setWeather(deviceData.weather);
              }
              
              const statusString = deviceData.status?.calculatedStatus;
              if (statusString && isStatusKey(statusString)) {
                setCalculatedStatus(statusString);
              } else {
                setCalculatedStatus("HAPPY"); // Define o padrão se não encontrar
              }

              setControls({ ledState: deviceData.ledState || 'off' });
            }
          } else {
            console.warn("Documento 'vaso_01' não encontrado.");
            setIsFirstUseModalVisible(true);
            setCalculatedStatus("CARREGANDO");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Erro ao ouvir o documento 'vaso_01': ", error);
          Alert.alert("Erro de Conexão", "Não foi possível conectar ao banco de dados.");
          setLoading(false);
        }
      );
    return () => subscriber();
  }, []);

    // --- Estados para o Modal de Primeiro Uso ---
  const [isFirstUseModalVisible, setIsFirstUseModalVisible] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'FACIL' | 'MEDIO' | 'DIFICIL'>('MEDIO');
  const [isSavingSetup, setIsSavingSetup] = useState(false);

  // --- Define o tipo dificuldade ---
  type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL';

  // --- FUNÇÃO PARA PEDIR LOCALIZAÇÃO ---
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permissão de Localização do Spouty",
          message: "O Spouty precisa da sua localização para verificar o clima e dar melhores dicas sobre o sol.",
          buttonPositive: "Permitir",
          buttonNegative: "Negar",
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Permissão de localização concedida!");
        // Permissão concedida, agora busca a localização
        Geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Envia para o backend
            await fetch('https://spouty.onrender.com/api/setlocation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: lat, lon: lon }) 
            });
            console.log("Localização enviada para o backend.");
          },
          (error) => console.error(error),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        console.log("Permissão de localização negada.");
        Alert.alert("Aviso", "Sem a localização, o Spouty não poderá verificar o clima da sua região.");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // --- FUNÇÃO PARA SALVAR A CONFIGURAÇÃO DO MODAL ---
  const handleFirstUseSave = async () => {
    setIsSavingSetup(true);
    try {
      // Envia a dificuldade para o backend
      const diffResponse = await fetch('https://spouty.onrender.com/api/setdifficulty', { // Use sua URL!
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty: selectedDifficulty }) 
      });
      if (!diffResponse.ok) throw new Error('Falha ao salvar a dificuldade');
      
      console.log("Dificuldade salva!");

      // Pede e envia a localização
      await requestLocationPermission();

      // Fecha o Modal
      setIsSavingSetup(false);
      setIsFirstUseModalVisible(false);
      Alert.alert('Pronto!', 'Spouty configurado com sucesso!');

    } catch (error) {
      setIsSavingSetup(false);
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
      console.error(error);
    }
  };

  // --- CONTROLAR O LED ---
  const handleLedToggle = async (value: boolean) => {
    const newState = value ? 'on' : 'off';
    setControls({ ledState: newState }); // Atualiza a UI

    try {
      const response = await fetch('https://spouty.onrender.com/api/led', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: newState }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar comando');
      }
      
      console.log('Comando do LED enviado com sucesso!');
      
    } catch (error) {
      console.error("Erro ao controlar LED:", error);
      Alert.alert('Erro', 'Não foi possível enviar o comando para o vaso.');
      setControls({ ledState: value ? 'off' : 'on' }); 
    }
  };

  // --- NORMALIZAÇÃO DOS DADOS PARA AS BARRAS ---  

  const MAX_LUX_ESPERADO = 100; 
  const MAX_UV_ESPERADO = 11; 

  const humidityPercent = sensors ? sensors.soilMoisture : 0;
  const luxPercent = sensors ? sensors.luminosity / MAX_LUX_ESPERADO : 0;
  const uvPercent = sensors ? sensors.uvLevel / MAX_UV_ESPERADO : 0;

  // ---------------------------------------------------

  // Pega a mensagem e cor de status
  const plantStatus = translateStatus(calculatedStatus);

  if (loading && !isFirstUseModalVisible) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* --- MODAL DE PRIMEIRO USO --- */}
      <Modal
        visible={isFirstUseModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          // Impede o usuário de fechar o modal pelo botão "Voltar"
          Alert.alert("Configuração Pendente", "Você precisa configurar seu vaso antes de continuar.");
        }}
      >
        <View style={modalStyles.container}>
          <Text style={modalStyles.title}>Bem-vindo ao Spouty!</Text>
          <Text style={modalStyles.subtitle}>
            Para começar, precisamos saber o nível de dificuldade (o tipo de planta) que você irá cuidar.
          </Text>
          
          <Text style={modalStyles.pickerLabel}>Nível de Dificuldade:</Text>
          <View style={modalStyles.pickerContainer}>
            <Picker
              selectedValue={selectedDifficulty}
              onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
              style={modalStyles.picker}
            >
              <Picker.Item label="🌿 Fácil (Cacto, Suculenta)" value="FACIL" />
              <Picker.Item label="🌼 Médio (Jiboia, Violeta)" value="MEDIO" />
              <Picker.Item label="☀️ Difícil (Manjericão, Tomate)" value="DIFICIL" />
            </Picker>
          </View>

          <Text style={modalStyles.subtitle}>
            Também pediremos sua localização para que o Spouty saiba se está de dia ou chovendo lá fora.
          </Text>
          
          <View style={modalStyles.buttonContainer}>
            <Button 
              title={isSavingSetup ? "Salvando..." : "Salvar e Começar"}
              onPress={handleFirstUseSave}
              disabled={isSavingSetup}
            />
          </View>
        </View>
      </Modal>

      <Text style={styles.header}>Spouty</Text>

      {/* --- NOVO WIDGET DE CLIMA --- */}
      {weather && (
        <View style={styles.weatherContainer}>
          <Text style={styles.weatherIcon}>
            {weather.isNight ? '🌙' : (weather.condition === 'Rain' ? '🌧️' : '☀️')}
          </Text>
          <View>
            <Text style={styles.weatherTemp}>{weather.temp.toFixed(0)}°C</Text>
            <Text style={styles.weatherDesc}>
              {weather.description.charAt(0).toUpperCase() + weather.description.slice(1)}
            </Text>
          </View>
        </View>
      )}
      
      {/* MENSAGEM DE STATUS */}
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>Status:</Text>
        <Text style={[styles.statusMessage, { color: plantStatus.color }]}>
          {plantStatus.message}
        </Text>
      </View>

      {/* BARRAS DE ENERGIA */}
      <View style={styles.barsContainer}>
        <StatusBar 
          label="Umidade" 
          value={humidityPercent}
          color="#007aff"
        />
        <StatusBar 
          label="Luminosidade" 
          value={luxPercent}
          color="#f5dd4b"
        />
        <StatusBar 
          label="Exposição UV" 
          value={uvPercent}
          color="#87009fff"
        />
      </View>
      
      {/* CONTROLES */}
      <View style={styles.controlContainer}>
        <Text style={styles.dataLabel}>Luz do Vaso</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={controls?.ledState === 'on' ? "#f5dd4b" : "#f4f3f4"}
          onValueChange={handleLedToggle}
          value={controls?.ledState === 'on'}
        />
      </View>
      {/* --- BOTÃO PARA IR PARA AS CONFIGURAÇÕES --- */}
      <View style={styles.settingsButtonContainer}>
        <Button
          title="Configurações ⚙️"
          onPress={() => navigation.navigate('Settings')}
          color="#124803ff"
        />
      </View>
    </View>
  );
};

//estilos
const styles = StyleSheet.create({
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#c3e59eff',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    elevation: 1,
  },
  weatherIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#194509ff',
  },
  weatherDesc: {
    fontSize: 14,
    color: '#194509ff',
    textTransform: 'capitalize',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f1ffe7ff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  statusBox: {
    backgroundColor: '#c3e59eff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
  },
  statusMessage: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  barsContainer: {
    backgroundColor: '#c3e59eff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  controlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#c3e59eff',
    paddingHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
  },
  dataLabel: {
    fontSize: 18,
    color: '#333',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007aff',
    },
  settingsButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
    }
});

// Estilos para o Modal
const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 30,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 30,
  },
  picker: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 20,
  }
});

export default HomeScreen;