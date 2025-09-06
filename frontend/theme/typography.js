// typography.js
import { Platform } from 'react-native';

export const typography = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    xxxxl: 36
  },
  
  // Font weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700'
  },
  
  // Font families (example - adjust based on your actual fonts)
  families: {
    primary: Platform.select({
      ios: 'Avenir',
      android: 'sans-serif',
      web: "'Inter', sans-serif"
    }),
    heading: Platform.select({
      ios: 'Avenir-Heavy',
      android: 'sans-serif-condensed',
      web: "'Inter', sans-serif"
    })
  }
};