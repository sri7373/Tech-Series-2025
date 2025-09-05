// globalStyles.js
import { colours } from './colours';
import { typography } from './typography';
import { spacing } from './spacing';
import { StyleSheet, Platform } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colours.background,
    padding: spacing.screenMargin
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: colours.background
  },
  
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.screenMargin
  },
  
  // Card styles
  card: {
    backgroundColor: colours.cardBackground,
    borderRadius: 12,
    padding: spacing.cardPadding,
    marginBottom: spacing.base,
    shadowColor: colours.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  
  // Text styles
  heading1: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.xxxxl,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.md
  },
  
  heading2: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.semiBold,
    color: colours.textPrimary,
    marginBottom: spacing.base
  },
  
  heading3: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.medium,
    color: colours.textPrimary,
    marginBottom: spacing.sm
  },
  
  bodyText: {
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.base,
    color: colours.textSecondary,
    lineHeight: 24
  },
  
  caption: {
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.sm,
    color: colours.textSecondary
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: colours.primaryGreen,
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  buttonPrimaryText: {
    color: colours.textInverted,
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium
  },
  
  buttonSecondary: {
    backgroundColor: colours.primaryOrange,
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  buttonSecondaryText: {
    color: colours.textInverted,
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colours.primaryGreen,
    paddingVertical: spacing.buttonPadding,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  buttonOutlineText: {
    color: colours.primaryGreen,
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium
  },
  
  // Form styles
  input: {
    backgroundColor: colours.white,
    borderWidth: 1,
    borderColor: colours.borderLight,
    borderRadius: 8,
    padding: spacing.sm,
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.base,
    color: colours.textPrimary,
    marginBottom: spacing.base
  },
  
  inputLabel: {
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: typography.weights.medium
  },
  
  // Utility classes
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  divider: {
    height: 1,
    backgroundColor: colours.borderLight,
    marginVertical: spacing.lg
  },
  
  // Responsive adjustments for web
  ...Platform.select({
    web: {
      container: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
        width: '100%'
      }
    }
  })
});