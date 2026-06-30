import React, { forwardRef } from "react";
import { Text as RNText, TextInput as RNTextInput, TextProps, TextInputProps } from "react-native";
import { fontFamily } from "../theme";

// Drop-in replacements for RN's Text/TextInput that default to the
// terminal-style monospace font app-wide. Explicit fontFamily in a passed
// `style` still wins since it's applied after the default.
export const Text = forwardRef<RNText, TextProps>(({ style, ...props }, ref) => (
  <RNText ref={ref} style={[{ fontFamily: fontFamily.regular }, style]} {...props} />
));
Text.displayName = "Text";

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({ style, ...props }, ref) => (
  <RNTextInput ref={ref} style={[{ fontFamily: fontFamily.regular }, style]} {...props} />
));
TextInput.displayName = "TextInput";
