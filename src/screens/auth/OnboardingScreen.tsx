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
            <View style={styles.phoneFrame}>
              <View style={styles.phoneContent}>
                <View style={styles.shoppingGrid}>
                  <View style={[styles.gridItem, { backgroundColor: '#FFE5E5' }]} />
                  <View style={[styles.gridItem, { backgroundColor: '#E5F5FF' }]} />
                  <View style={[styles.gridItem, { backgroundColor: '#FFF5E5' }]} />
                  <View style={[styles.gridItem, { backgroundColor: '#E5FFE5' }]} />
                </View>
              </View>
            </View>
            <View style={styles.cartIcon}>
              <View style={styles.cartHandle} />
            </View>
            <View style={styles.personFigure} />
          </View>
        );
      case 'delivery':
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.basketContainer}>
              <View style={styles.basket}>
                <View style={styles.vegetable1} />
                <View style={styles.vegetable2} />
                <View style={styles.vegetable3} />
              </View>
            </View>
          </View>
        );
      case 'payment':
        return (
          <View style={styles.illustrationContainer}>
            <View style={styles.scooterContainer}>
              <View style={styles.scooterBody} />
              <View style={styles.scooterWheel} />
              <View style={styles.deliveryBox} />
            </View>
            <View style={styles.doorFrame}>
              <View style={styles.doorHandle} />
            </View>
            <View style={styles.deliveryPerson} />
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
  phoneFrame: {
    width: 160,
    height: 240,
    backgroundColor: '#F0F0F0',
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#333',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  phoneContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
  },
  shoppingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: 55,
    height: 55,
    borderRadius: 12,
  },
  cartIcon: {
    position: 'absolute',
    bottom: 100,
    right: 40,
    width: 60,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#333',
  },
  cartHandle: {
    width: 30,
    height: 15,
    borderWidth: 3,
    borderColor: '#333',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
    alignSelf: 'center',
    marginTop: -10,
  },
  personFigure: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 50,
    height: 80,
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
  },
  basketContainer: {
    alignItems: 'center',
  },
  basket: {
    width: 180,
    height: 120,
    backgroundColor: '#FF3B58',
    borderRadius: 16,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  vegetable1: {
    width: 40,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    position: 'absolute',
    top: 10,
    left: 30,
  },
  vegetable2: {
    width: 35,
    height: 45,
    backgroundColor: '#FF9800',
    borderRadius: 18,
    position: 'absolute',
    top: 15,
    right: 30,
  },
  vegetable3: {
    width: 45,
    height: 40,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    position: 'absolute',
    bottom: 15,
  },
  scooterContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  scooterBody: {
    width: 120,
    height: 80,
    backgroundColor: '#FF3B58',
    borderRadius: 40,
  },
  scooterWheel: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    position: 'absolute',
    bottom: -10,
    right: 10,
  },
  deliveryBox: {
    width: 50,
    height: 50,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    position: 'absolute',
    top: -20,
    left: 10,
  },
  doorFrame: {
    width: 100,
    height: 160,
    backgroundColor: '#333',
    borderRadius: 12,
    position: 'absolute',
    right: 40,
    top: 60,
  },
  doorHandle: {
    width: 8,
    height: 20,
    backgroundColor: '#FFD700',
    borderRadius: 4,
    position: 'absolute',
    right: 20,
    top: '50%',
  },
  deliveryPerson: {
    width: 50,
    height: 80,
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    position: 'absolute',
    right: 100,
    bottom: 40,
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

