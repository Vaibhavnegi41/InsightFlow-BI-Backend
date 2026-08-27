// Generates realistic multi-month business retail / e-commerce datasets
export function generateSampleBusinessData() {
  const categories = [
    { name: 'Electronics', baseMargin: 0.18, priceRange: [150, 1200] },
    { name: 'Fashion & Apparel', baseMargin: 0.45, priceRange: [30, 250] },
    { name: 'Home & Living', baseMargin: 0.32, priceRange: [45, 450] },
    { name: 'Office & Supplies', baseMargin: 0.28, priceRange: [20, 180] }
  ];

  const productsByCategory = {
    'Electronics': ['UltraBook Pro 15', 'Noise-Cancel Headphones', '4K Smart Monitor 27"', 'Wireless Mech Keyboard', 'Smart Fitness Watch', 'USB-C Dock Station'],
    'Fashion & Apparel': ['Classic Oxford Shirt', 'Waterproof Trail Jacket', 'Merino Wool Sweater', 'Athletic Tech Joggers', 'Leather Urban Backpack', 'Designer Sunglasses'],
    'Home & Living': ['Ergonomic Mesh Chair', 'Aromatherapy Diffuser', 'Minimalist Floor Lamp', 'Ceramic Tableware Set', 'Organic Cotton Bedding', 'Bamboo Desk Organizer'],
    'Office & Supplies': ['Smart Notebook Planner', 'Wireless Laser Pointer', 'Executive Ballpoint Pen', 'Monitor Arm Mount', 'Document Shredder Pro', 'Noise-Dampening Panel']
  };

  const regions = ['North America (US-East)', 'North America (US-West)', 'Europe (EU-Central)', 'Asia Pacific (APAC-South)'];
  const customerSegments = ['Enterprise', 'Mid-Market', 'SMB', 'Direct Consumer'];
  const paymentMethods = ['Credit Card', 'Corporate Invoice', 'PayPal', 'Wire Transfer'];

  const rows = [];
  let orderCounter = 10001;

  // Generate 800 transaction records spanning across the past 12 months
  const startDate = new Date('2025-09-01');
  const endDate = new Date('2026-08-25');
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < 750; i++) {
    const dayOffset = Math.floor(Math.random() * totalDays);
    const orderDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = orderDate.toISOString().split('T')[0];

    const categoryObj = categories[Math.floor(Math.random() * categories.length)];
    const productList = productsByCategory[categoryObj.name];
    const product = productList[Math.floor(Math.random() * productList.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const segment = customerSegments[Math.floor(Math.random() * customerSegments.length)];
    const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const unitPrice = Math.round((Math.random() * (categoryObj.priceRange[1] - categoryObj.priceRange[0]) + categoryObj.priceRange[0]) * 100) / 100;
    const quantity = Math.floor(Math.random() * 4) + 1;
    const discountRate = Math.random() < 0.35 ? (Math.floor(Math.random() * 4) * 5) / 100 : 0; // 0%, 5%, 10%, 15%
    
    // Seasonal multiplier (Nov/Dec holiday boost)
    const month = orderDate.getMonth(); // 0-indexed (10=Nov, 11=Dec)
    const seasonalBoost = (month === 10 || month === 11) ? 1.35 : (month === 0 ? 0.85 : 1.0);

    const grossSales = unitPrice * quantity * seasonalBoost;
    const discountAmount = grossSales * discountRate;
    const netRevenue = Math.round((grossSales - discountAmount) * 100) / 100;

    // Cost calculation based on profit margin
    const marginVariation = (Math.random() * 0.1) - 0.05;
    const effectiveMargin = Math.max(0.08, categoryObj.baseMargin + marginVariation);
    const cogs = Math.round((netRevenue * (1 - effectiveMargin)) * 100) / 100;
    const profit = Math.round((netRevenue - cogs) * 100) / 100;

    const customerId = `CUST-${100 + Math.floor(Math.random() * 120)}`;

    rows.push({
      order_id: `ORD-${orderCounter++}`,
      order_date: dateStr,
      customer_id: customerId,
      customer_segment: segment,
      region: region,
      category: categoryObj.name,
      product_name: product,
      unit_price: unitPrice,
      quantity: quantity,
      discount_rate: discountRate,
      revenue: netRevenue,
      cost_of_goods: cogs,
      profit: profit,
      payment_method: payment,
      order_status: Math.random() < 0.94 ? 'Completed' : (Math.random() < 0.5 ? 'Shipped' : 'Refunded')
    });
  }

  // Sort rows chronologically
  rows.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));

  return rows;
}
