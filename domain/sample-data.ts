export const PRODUCTS = [
  {
    id: 'cyl-125',
    name: '12.5kg Cooking Gas Cylinder',
    price: 6500, // refill price
    images: [],
    sizes: [12.5],
    specs: { capacity: '12.5kg', material: 'Steel', dimensions: '33×28×58cm' },
    addOns: [
      { id: 'regulator', name: 'Regulator', price: 8000 },
      { id: 'hose', name: 'Hose', price: 2500 },
    ],
  },
  {
    id: 'burner-1',
    name: 'Gas Burner',
    price: 11000,
    images: [],
    specs: { material: 'Aluminum' },
  },
] as const;
