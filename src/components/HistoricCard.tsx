import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import { colors } from "@/styles/colors";
import { Check, RefreshCwOff } from "lucide-react-native";

export type HistoricCardProps = {
  id: string;
  licensePlate: string;
  created: string;
  isSync: boolean;
};

type Props = TouchableOpacityProps & {
  data: HistoricCardProps;
};

export function HistoricCard({ data, ...rest }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.7} {...rest}>
      <View className="bg-gray-700 flex-row justify-between items-center p-4 rounded-md mb-3">
        <View className="flex">
          <Text className="text-white font-bold text-lg">
            {data.licensePlate}
          </Text>
          <Text className="text-gray-200 text-sm mt-1">{data.created}</Text>
        </View>

        {data.isSync ? (
          <Check size={24} color={colors["brand-light"]} />
        ) : (
          <RefreshCwOff size={24} color={colors.gray[400]} />
        )}
      </View>
    </TouchableOpacity>
  );
}
