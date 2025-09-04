// Quick test script to verify product similarity logic
const { areProductsSimilar } = require('./backend/services/recommendationService');

// Test cases
const testCases = [
  // Should be similar (sunscreen products)
  { product1: 'sunscreen', product2: 'SPF 50 sunblock', expected: true },
  { product1: 'sunscreen lotion', product2: 'UV protection cream', expected: true },
  { product1: 'Banana Boat Sunscreen', product2: 'Coppertone SPF 30', expected: true },
  
  // Should NOT be similar (different product types)
  { product1: 'sunscreen', product2: 'toothpaste', expected: false },
  { product1: 'sunscreen', product2: 'soap bar', expected: false },
  { product1: 'sunscreen', product2: 'shampoo', expected: false },
  
  // Should be similar (toothpaste products)
  { product1: 'toothpaste', product2: 'dental paste', expected: true },
  { product1: 'Colgate toothpaste', product2: 'Crest dental gel', expected: true },
  
  // Should be similar (soap products)
  { product1: 'soap bar', product2: 'body wash', expected: true },
  { product1: 'Dove soap', product2: 'shower gel', expected: true },
];

console.log('Testing Product Similarity Logic:');
console.log('================================');

testCases.forEach((test, index) => {
  try {
    const result = areProductsSimilar(test.product1, test.product2);
    const status = result === test.expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. "${test.product1}" vs "${test.product2}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result} ${status}`);
    console.log();
  } catch (error) {
    console.log(`${index + 1}. ERROR: ${error.message}`);
  }
});
