import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRealm } from "@/libs/realm";
import { Historic } from "@/libs/realm/schemas/Historic";
import { useUser } from "@realm/react";

import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { LicensePlateInput } from "@/components/LicensePlateInput";
import { LocationInfo } from "@/components/LocationInfo";
import { Map } from "@/components/Map";
import { TextAreaInput } from "@/components/TextAreaInput";
import { useToast } from "@/components/Toast";

import { colors } from "@/styles/colors";

import { startLocationTask } from "@/tasks/backgroundLocationTask";
import { getAddressLocation } from "@/utils/getAddressLocation";
import { openSettings } from "@/utils/openSettings";
import { validateLicensePlate } from "@/utils/validateLicensePlate";
import {
  LocationAccuracy,
  LocationObjectCoords,
  LocationSubscription,
  requestBackgroundPermissionsAsync,
  useForegroundPermissions,
  watchPositionAsync,
} from "expo-location";
import { Check, MapPin, MapPinned } from "lucide-react-native";

export function Departure() {
  const { toast } = useToast();

  const descriptionRef = useRef<TextInput>(null);
  const licensePlateRef = useRef<TextInput>(null);

  const realm = useRealm();
  const user = useUser();

  const { goBack } = useNavigation();

  const [locationForegroundPermission, requestLocationForegroundPermission] =
    useForegroundPermissions();
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] =
    useState<LocationObjectCoords | null>(null);
  const [description, setDescription] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleDepartureRegister() {
    try {
      if (!validateLicensePlate(licensePlate)) {
        licensePlateRef.current?.focus();

        return toast(
          "A placa é inválida. Por favor, verifique a placa do veículo.",
          "destructive"
        );
      }

      if (description.trim().length === 0) {
        return toast(
          "Por favor, informe o motivo da utilização do veículo.",
          "destructive"
        );
      }

      if (!currentCoords?.latitude || !currentCoords?.longitude) {
        return toast(
          "Não foi possível obter a localização atual. Por favor, tente novamente.",
          "destructive"
        );
      }

      const backgroundPermissions = await requestBackgroundPermissionsAsync();

      if (!backgroundPermissions.granted) {
        setIsRegistering(false);

        return Alert.alert(
          "Localização",
          'É necessário permitir que o App tenha acesso localização em segundo plano. Acesse as configurações do dispositivo e habilite "Permitir o tempo todo."',
          [{ text: "Abrir configurações", onPress: openSettings }]
        );
      }

      await startLocationTask();

      realm.write(() => {
        realm.create(
          "Historic",
          Historic.generate({
            user_id: user!.id,
            user_name: user.profile.name || "",
            license_plate: licensePlate.toUpperCase(),
            description,
            coords: [
              {
                latitude: currentCoords.latitude,
                longitude: currentCoords.longitude,
                timestamp: new Date().getTime(),
              },
            ],
          })
        );
      });

      toast("Saída do veículo registrada!", "success");

      goBack();
    } catch (err) {
      console.error(err);

      setIsRegistering(false);

      toast("Não foi possível registrar a saída do veículo.", "destructive");
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission();
  }, []);

  useEffect(() => {
    if (!locationForegroundPermission?.granted) return;

    let subscription: LocationSubscription;

    watchPositionAsync(
      { accuracy: LocationAccuracy.High, timeInterval: 1000 },
      (location) => {
        setCurrentCoords(location.coords);

        getAddressLocation(location.coords)
          .then((address) => {
            if (address) {
              setCurrentAddress(address);
            }
          })
          .finally(() => {
            setIsLoadingLocation(false);
          });
      }
    ).then((sub) => {
      subscription = sub;
    });

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [locationForegroundPermission]);

  if (!locationForegroundPermission?.granted) {
    return (
      <View className="flex-1 bg-gray-800">
        <Header title="Saída" />

        <View className="flex-1 items-center justify-center gap-6 px-6">
          <MapPinned size={52} color={colors["brand-light"]} />

          <Text className="text-white text-center">
            Para registrar a saída do veículo, precisamos da sua permissão para
            acessar a localização.
          </Text>
          <View className="w-full">
            <Button
              variant="default"
              label="Abrir configurações"
              onPress={openSettings}
            />
          </View>
        </View>
      </View>
    );
  }

  if (isLoadingLocation) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-800">
        <ActivityIndicator color={colors["brand-light"]} size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-800">
      <Header title="Saída" />

      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          {currentCoords && <Map coords={[currentCoords]} />}

          <View className="w-full gap-4 p-8">
            {currentAddress && (
              <LocationInfo
                label="Localização atual"
                description={currentAddress}
                icon={MapPin}
              />
            )}

            <LicensePlateInput
              ref={licensePlateRef}
              label="Placa do veículo"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              onChangeText={setLicensePlate}
              returnKeyType="next"
            />

            <TextAreaInput
              ref={descriptionRef}
              label="Motivo"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={handleDepartureRegister}
              onChangeText={setDescription}
              returnKeyType="send"
              blurOnSubmit
            />

            <Button
              variant="default"
              label="Registrar saída"
              isLoading={isRegistering}
              icon={<Check size={20} color="white" />}
              onPress={handleDepartureRegister}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
