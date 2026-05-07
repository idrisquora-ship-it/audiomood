import { PropsWithChildren } from "react";
import { Screen, type ScreenProps } from "@/components/ui/Screen";
import { spacing } from "@/theme/spacing";

type Props = PropsWithChildren<Omit<ScreenProps, "contentTopGap"> & { contentTopGap?: number }>;

/**
 * Artist tab shell: stronger top inset than listener `Screen` defaults so headers clear the status bar.
 * Bottom safe area: include `bottom` in `edges` when content should sit above the home indicator (see individual scroll padding for tab bar overlap).
 */
export function ArtistScreen({ contentTopGap, children, ...rest }: Props) {
  return (
    <Screen {...rest} contentTopGap={contentTopGap ?? spacing.artistScreenTopGap}>
      {children}
    </Screen>
  );
}
