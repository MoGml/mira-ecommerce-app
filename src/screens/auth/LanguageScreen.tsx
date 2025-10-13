import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LanguageScreenProps {
  onNext: (language: string) => void;
}

const LanguageScreen: React.FC<LanguageScreenProps> = ({ onNext }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar'>('en');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Order Online</Text>
        <Text style={styles.subtitle}>The smart way to shop</Text>

        {/* Language Selection */}
        <View style={styles.languageContainer}>
          <Text style={styles.languageTitle}>Choose your preferred language</Text>
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'ar' && styles.languageOptionSelected,
            ]}
            onPress={() => setSelectedLanguage('ar')}
          >
            <View style={styles.radioOuter}>
              {selectedLanguage === 'ar' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.languageText}>العربية</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              selectedLanguage === 'en' && styles.languageOptionSelected,
            ]}
            onPress={() => setSelectedLanguage('en')}
          >
            <View style={styles.radioOuter}>
              {selectedLanguage === 'en' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.languageText}>English</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.proceedButton}
          onPress={() => onNext(selectedLanguage)}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageContainer: {
    flex: 1,
  },
  languageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageOptionSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#FFF5F5',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  proceedButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LanguageScreen;

