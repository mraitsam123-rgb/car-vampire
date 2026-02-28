// Select database
db = db.getSiblingDB('garage');

// Create collections
db.createCollection('users');
db.createCollection('listings');
db.createCollection('favorites');
db.createCollection('chats');
db.createCollection('messages');

// Indexes for performance
db.listings.createIndex({ title: 'text', description: 'text' });
db.listings.createIndex({ price: 1, createdAt: -1 });
db.listings.createIndex({ make: 1, model: 1, city: 1, year: 1 });
db.favorites.createIndex({ userId: 1, listingId: 1 }, { unique: true });
db.chats.createIndex({ listingId: 1, buyerId: 1, sellerId: 1 }, { unique: true });

// Seed a minimal user document (password hash is placeholder; app sets real hashes)
db.users.insertOne({
  name: 'Atlas Ready',
  email: 'atlas@example.com',
  passwordHash: 'placeholder',
  createdAt: new Date()
});
