import React, { ReactNode, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, X } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { fonts, Palette, radius, useTheme } from '../theme';
import { haptic } from '../lib/haptics';
import { TeamBadgeIcon } from './TeamBadgeIcon';

export const MAX_W = 640;

/* ---------- Text ---------- */
type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'caption' | 'label' | 'score';
const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 38, letterSpacing: -1 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  heading: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  score: { fontFamily: fonts.extrabold, fontSize: 60, lineHeight: 64, letterSpacing: -2, fontVariant: ['tabular-nums'] },
};

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}: {
  variant?: Variant;
  color?: keyof Palette | (string & {});
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
  numberOfLines?: number;
  accessibilityRole?: 'header';
}) {
  const { colors } = useTheme();
  const c = Object.prototype.hasOwnProperty.call(colors, color) ? colors[color as keyof Palette] : color;
  return (
    <Text {...rest} style={[variants[variant], { color: c }, style]}>
      {children}
    </Text>
  );
}

/* ---------- Press ---------- */
const APressable = Animated.createAnimatedComponent(Pressable);

export function Tap({
  children,
  onPress,
  style,
  disabled,
  quiet,
  hapticEnabled = true,
  scaleTo = 0.96,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  quiet?: boolean;
  hapticEnabled?: boolean;
  scaleTo?: number;
}) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        s.value = withTiming(scaleTo, { duration: 90 });
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      onPress={(e) => {
        if (!quiet && hapticEnabled) haptic.tap();
        onPress?.(e);
      }}
      style={[style, a] as any}
      {...rest}
    >
      {children}
    </APressable>
  );
}

/* ---------- Layout ---------- */
export function Screen({
  children,
  scroll = true,
  fillContent = false,
  edges = ['top'],
  footer,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  fillContent?: boolean;
  edges?: ('top' | 'bottom')[];
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.bg }}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, fillContent && { flexGrow: 1 }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.maxWidth, fillContent && { flexGrow: 1 }]}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, styles.scrollContent, contentStyle]}>
          <View style={[styles.maxWidth, { flex: 1 }]}>{children}</View>
        </View>
      )}
      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <View style={styles.maxWidth}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {back ? (
        <IconButton icon={ChevronLeft} label="Go back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      ) : null}
      <View style={{ flex: 1 }}>
        <AppText variant="title" numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="label" color="textMuted">
        {title}
      </AppText>
      {action}
    </View>
  );
}

export function Card({
  children,
  style,
  onPress,
  index,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  index?: number;
}) {
  const { colors, isDark } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: isDark ? '#000000' : '#2B3A2E',
    shadowOpacity: isDark ? 0.2 : 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: isDark ? 3 : 2,
  };
  const entering = index !== undefined ? FadeInDown.delay(Math.min(index, 8) * 50).duration(320) : undefined;
  if (onPress) {
    return (
      <Animated.View entering={entering}>
        <Tap onPress={onPress} style={[base, style]}>
          {children}
        </Tap>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={entering} style={[base, style]}>
      {children}
    </Animated.View>
  );
}

/* ---------- Controls ---------- */
export function IconButton({
  icon: Icon,
  onPress,
  label,
  tone = 'plain',
  size = 44,
  disabled,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  tone?: 'plain' | 'primary' | 'danger';
  size?: number;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const bg = tone === 'primary' ? colors.primary : tone === 'danger' ? colors.dangerSoft : colors.surfaceAlt;
  const fg = tone === 'primary' ? colors.onPrimary : tone === 'danger' ? colors.danger : colors.text;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon size={20} color={fg} strokeWidth={2.2} />
    </Tap>
  );
}

type BtnVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'soft';
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  style,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const { colors } = useTheme();
  const map: Record<BtnVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    accent: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surfaceAlt, fg: colors.text },
    ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
    danger: { bg: colors.danger, fg: colors.onDanger },
    soft: { bg: colors.primarySoft, fg: colors.primary },
  };
  const v = map[variant];
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[
        {
          height: h,
          paddingHorizontal: size === 'sm' ? 16 : 24,
          borderRadius: radius.pill,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {Icon ? <Icon size={size === 'sm' ? 16 : 20} color={v.fg} strokeWidth={2.4} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: size === 'sm' ? 14 : 16, color: v.fg }}>{label}</Text>
    </Tap>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  disabled,
  selectedBackgroundColor,
  selectedTextColor,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
}) {
  const { colors } = useTheme();
  const bg = selected ? selectedBackgroundColor ?? colors.primarySoft : colors.surfaceAlt;
  const fg = selected ? selectedTextColor ?? colors.primary : colors.textMuted;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: !!selected }}
      style={{
        height: 40,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {Icon ? <Icon size={16} color={fg} strokeWidth={2.4} /> : null}
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: fg }}>{label}</Text>
    </Tap>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Tap
            key={o.value}
            onPress={() => onChange(o.value)}
            scaleTo={0.97}
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              height: 38,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.primarySoft : 'transparent',
            }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: active ? colors.primary : colors.textMuted }}>
              {o.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'accent' | 'danger' }) {
  const { colors } = useTheme();
  const m = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={{ backgroundColor: m.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, color: m.fg, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

export function LiveDot() {
  const { colors } = useTheme();
  const o = useSharedValue(1);
  useEffect(() => {
    o.value = withRepeat(withSequence(withTiming(0.25, { duration: 700 }), withTiming(1, { duration: 700 })), -1);
  }, [o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }, a]} />;
}

export function Avatar({ name, color, size = 44, badge }: { name: string; color?: string; size?: number; badge?: string }) {
  const { colors } = useTheme();
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {badge && badge !== 'initials' ? <TeamBadgeIcon badge={badge} size={size * 0.62} color={color ? '#08130D' : colors.primary} /> : <Text style={{ fontFamily: fonts.extrabold, fontSize: size * 0.36, color: color ? '#08130D' : colors.primary }}>{initials}</Text>}
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label?: string }) {
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <AppText variant="label" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        {...props}
        onFocus={(e) => {
          setFocus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            height: 52,
            borderRadius: 14,
            paddingHorizontal: 16,
            backgroundColor: colors.surfaceAlt,
            color: colors.text,
            fontFamily: fonts.medium,
            fontSize: 16,
            borderWidth: 1.5,
            borderColor: focus ? colors.primary : 'transparent',
          },
          props.style,
        ]}
      />
    </View>
  );
}

export function Stepper({ value, onChange, min = 1, max = 50 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const { colors } = useTheme();
  const btn = (label: string, delta: number, off: boolean) => (
    <Tap
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={off}
      accessibilityLabel={delta > 0 ? 'Increase' : 'Decrease'}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.4 : 1,
      }}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>{label}</Text>
    </Tap>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {btn('−', -1, value <= min)}
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 28, color: colors.text, minWidth: 48, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      {btn('+', 1, value >= max)}
    </View>
  );
}

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { colors } = useTheme();
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [value, w]);
  const a = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}>
      <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: color ?? colors.primary }, a]} />
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={32} color={colors.primary} strokeWidth={2} />
      </View>
      <AppText variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" style={{ textAlign: 'center', maxWidth: 320 }}>
        {text}
      </AppText>
      {children ? <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 12 }}>{children}</View> : null}
    </Animated.View>
  );
}

/* ---------- Sheet ---------- */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Animated.View entering={FadeIn.duration(180)} style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }} pointerEvents="box-none">
          <Animated.View
            entering={SlideInDown.duration(280).easing(Easing.out(Easing.cubic))}
            style={{
              width: '100%',
              maxWidth: MAX_W,
              maxHeight: '88%',
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderWidth: 1,
              borderBottomWidth: 0,
              borderColor: colors.border,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            }}
          >
            <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12, gap: 12 }}>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{title}</AppText>
                {subtitle ? (
                  <AppText variant="caption" color="textMuted">
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
              <IconButton icon={X} label="Close" onPress={onClose} size={36} />
            </View>
            <ScrollView
              style={{ flexGrow: 0, flexShrink: 1, minHeight: 0 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 16 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
            {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>{footer}</View> : null}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
          <Button label="Cancel" variant="secondary" onPress={onCancel} />
        </>
      }
    >
      <AppText variant="body" color="textMuted">
        {message}
      </AppText>
    </Sheet>
  );
}

export function PlayerRow({
  name,
  sub,
  trailing,
  onPress,
  color,
  disabled,
  selected,
}: {
  name: string;
  sub?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
  selected?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Tap
      onPress={onPress}
      disabled={disabled || !onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Avatar name={name} color={color} size={40} />
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong" numberOfLines={1} color="text">
          {name}
        </AppText>
        {sub ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {trailing}
    </Tap>
  );
}

export function useScorePop(key: string | number) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 220 }));
  }, [key, s]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center' },
  maxWidth: { width: '100%', maxWidth: MAX_W },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, alignItems: 'center' },
});
