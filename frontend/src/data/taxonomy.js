export const categoryTaxonomy = {
  Computing: {
    'Computers & Desktops': ['Desktops', 'All-In-One PCs', 'Mini PCs'],
    'Laptops': ['Ultrabooks', 'Gaming Laptops', '2-in-1 Convertibles', 'MacBooks'],
    'Tablets & iPads': ['iOS Tablets', 'Android Tablets', 'e-Readers'],
    'Computer Accessories': ['Monitors', 'Keyboards & Mice', 'Components']
  },
  'Phones & Wearables': {
    'Smartphones': ['Android Phones', 'iPhones', 'Feature Phones'],
    'Smartwatches & Wearables': ['Smartwatches', 'Fitness Trackers'],
    'Mobile Accessories': ['Cases', 'Power Banks', 'Cables']
  },
  'TV, Audio & Home Theater': {
    'Televisions': ['Smart TVs', 'Projectors'],
    'Audio': ['True Wireless Earbuds', 'Over-Ear Headphones', 'Bluetooth Speakers', 'Home Theater Systems']
  },
  'Cameras & Photography': {
    'Cameras': ['DSLR & Mirrorless', 'Point & Shoot', 'Action Cameras'],
    'Drones & Accessories': ['Drones', 'Lenses', 'Tripods']
  },
  Gaming: {
    'Consoles': ['PlayStation', 'Xbox', 'Nintendo'],
    'Accessories': ['Controllers', 'Gaming Headsets'],
    'Video Games': ['PS5 Games', 'Xbox Games', 'Nintendo Games']
  },
  'Home & Office Appliances': {
    'Large Appliances': ['Refrigerators', 'Washing Machines', 'Air Conditioners'],
    'Small Kitchen Appliances': ['Microwaves', 'Air Fryers', 'Blenders']
  }
};

// Dynamic Attributes Schema for specific leaf or sub-categories
export const categoryAttributes = {
  // Global attributes every product has (not explicitly listed in filters usually except Brand/Price)
  // Specific attributes:
  'Laptops': [
    { id: 'ram', label: 'RAM (Memory)', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { id: 'cpu', label: 'Processor', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M2', 'Apple M3'] },
    { id: 'storage', label: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
    { id: 'displaySize', label: 'Display Size', options: ['13.3"', '14"', '15.6"', '16"', '17.3"'] },
    { id: 'os', label: 'Operating System', options: ['Windows 11', 'macOS', 'ChromeOS'] }
  ],
  'Gaming Laptops': [
    { id: 'ram', label: 'RAM (Memory)', options: ['16GB', '32GB', '64GB'] },
    { id: 'cpu', label: 'Processor', options: ['Intel Core i7', 'Intel Core i9', 'AMD Ryzen 7', 'AMD Ryzen 9'] },
    { id: 'gpu', label: 'Graphics Card (GPU)', options: ['NVIDIA RTX 4050', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'NVIDIA RTX 4090', 'AMD Radeon RX 7600S'] },
    { id: 'storage', label: 'Storage', options: ['512GB SSD', '1TB SSD', '2TB SSD'] },
    { id: 'refreshRate', label: 'Screen Refresh Rate', options: ['120Hz', '144Hz', '165Hz', '240Hz'] }
  ],
  'Smartphones': [
    { id: 'os', label: 'Operating System', options: ['iOS', 'Android'] },
    { id: 'storage', label: 'Internal Storage', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { id: 'ram', label: 'RAM', options: ['4GB', '6GB', '8GB', '12GB', '16GB'] },
    { id: 'network', label: 'Network', options: ['4G LTE', '5G'] }
  ],
  'Televisions': [
    { id: 'displaySize', label: 'Screen Size', options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'] },
    { id: 'resolution', label: 'Resolution', options: ['1080p Full HD', '4K UHD', '8K'] },
    { id: 'panel', label: 'Panel Technology', options: ['LED', 'OLED', 'QLED', 'Neo QLED'] },
    { id: 'smartOs', label: 'Smart OS', options: ['webOS', 'Tizen', 'Android TV', 'Google TV'] }
  ],
  'Audio': [
    { id: 'formFactor', label: 'Form Factor', options: ['In-Ear', 'Over-Ear', 'On-Ear'] },
    { id: 'connectivity', label: 'Connectivity', options: ['Wireless (Bluetooth)', 'Wired'] },
    { id: 'anc', label: 'Active Noise Cancelling', options: ['Yes', 'No'] }
  ],
  'Cameras': [
    { id: 'sensorType', label: 'Sensor Type', options: ['Full Frame', 'APS-C', 'Micro Four Thirds'] },
    { id: 'megapixels', label: 'Megapixels', options: ['12MP - 20MP', '20MP - 30MP', '30MP - 45MP', '45MP+'] },
    { id: 'videoRes', label: 'Max Video Resolution', options: ['1080p', '4K', '8K'] }
  ]
};

// Fallback filters for categories without deeply defined attributes
export const defaultAttributes = [
  { id: 'condition', label: 'Condition', options: ['Brand New', 'Refurbished', 'Used'] },
  { id: 'warranty', label: 'Warranty', options: ['None', '6 Months', '1 Year', '2 Years'] }
];
