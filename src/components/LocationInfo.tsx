import { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";
import { IconBox } from "./IconBox";

export type LocationInfoProps = {
  label: string;
  description: string;
};

type Props = LocationInfoProps & {
  icon: LucideIcon;
};

export function LocationInfo({ label, description, icon: Icon }: Props) {
  return (
    <View className="w-full flex-row items-center">
      <IconBox icon={Icon} size="LARGE" />
      <View className="flex-1">
        <Text numberOfLines={1} className="text-gray-300 text-sm">
          {label}
        </Text>
        <Text numberOfLines={1} className="text-gray-100 text-base">
          {description}
        </Text>
      </View>
    </View>
  );
}
