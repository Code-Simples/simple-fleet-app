import { Text, TouchableOpacity, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowLeft } from "lucide-react-native";

import { colors } from "@/styles/colors";
import { useNavigation } from "@react-navigation/native";

type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  const { goBack } = useNavigation();

  const insets = useSafeAreaInsets();

  const paddingTop = insets.top + 32;

  return (
    <View style={{ paddingTop }} className="w-full p-8 bg-gray-700">
      <View className="flex-row gap-4">
        <TouchableOpacity activeOpacity={0.7} onPress={() => goBack()}>
          <ArrowLeft size={24} color={colors["brand-light"]} />
        </TouchableOpacity>
        <Text className="text-xl text-gray-100 font-bold">{title}</Text>
      </View>
    </View>
  );
}
