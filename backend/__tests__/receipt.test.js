// // __tests__/receipt.test.js
// const { matchItemsAndCalculatePoints } = require("../services/matchService");

// // Mock DB Product model
// jest.mock("../models/Product", () => ({
//   find: jest.fn(() => [
//     { _id: "1", name: "Organic Milk", points: 5 },
//     { _id: "2", name: "Brown Bread", points: 2 },
//   ]),
// }));

// describe("Receipt pipeline", () => {
//   test("calculates points correctly", async () => {
//     // Fake OCR items (pretend these came from Mindee)
//     const fakeOcrItems = [
//       { description: "Organic Milk 1L", qty: 2 },
//       { description: "Brown Bread Loaf", qty: 1 },
//       { description: "Random Unknown", qty: 1 },
//     ];

//     const { matched, totalPoints } = await matchItemsAndCalculatePoints(fakeOcrItems);

//     expect(totalPoints).toBe(12); // 2*5 + 1*2
//     expect(matched[0].matchedProduct).toBe("Organic Milk");
//     expect(matched[1].matchedProduct).toBe("Brown Bread");
//     expect(matched[2].matchedProduct).toBeNull();
//   });
// });
