// typography.js
import { Platform } from 'react-native';

export const typography = {
  // Font sizes - responsive scaling would be better in real app
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
      ios: 'System',
      android: 'Roboto',
      web: 'Arial, sans-serif'
    }),
    heading: Platform.select({
      ios: 'System',
      android: 'Roboto',
      web: "'Montserrat', sans-serif"
    })
  }
};