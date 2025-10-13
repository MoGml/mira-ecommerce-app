import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Order Everything You Need',
    subtitle: 'From one place – anytime, anywhere.',
    illustration: 'shopping',
  },
  {
    id: 2,
    title: 'Fast Delivery to Your Doorstep',
    subtitle: '15 local countries while we bring your order quickly and safely to your home.',
    illustration: 'delivery',
  },
  {
    id: 3,
    title: 'Easy Checkout & Flexible Payment',
    subtitle: 'Choose your delivery slot and pay the way that suits you.',
    illustration: 'payment',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const renderIllustration = (type: string) => {
    switch (type) {
      case 'shopping':
        return (
          <View style={styles.illustrationContainer}>
            <Image 
              source={require('../../../assets/Illustration.png')} 
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        );
      case 'delivery':
        return (
          <View style={styles.illustrationContainer}>
            <Image 
              source={require('../../../assets/Illustration2.png')} 
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        );
      case 'payment':
        return (
          <View style={styles.illustrationContainer}>
            <Image 
              source={require('../../../assets/Illustration3.png')} 
              style={styles.illustrationImage}
              resizeMode="contain"
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            {renderIllustration(slide.illustration)}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <View style={styles.nextButtonCircle}>
            <Text style={styles.nextButtonText}>→</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  slide: {
    width,
    flex: 1,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
    maxWidth: 300,
    maxHeight: 300,
  },
  textContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#FF0000',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#DDD',
  },
  nextButton: {
    alignSelf: 'center',
  },
  nextButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;

