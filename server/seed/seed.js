import dotenv from "dotenv"
import { faker } from "@faker-js/faker"
import { connectDB } from "../src/utils/db.js"
import { User } from "../src/models/User.js"
import { Listing } from "../src/models/Listing.js"

dotenv.config()

const run = async () => {
  await connectDB()
  const user = await User.findOne() || (await User.create({ name: "Demo User", email: "demo@example.com", passwordHash: "$2a$10$8vI4Q1F0MOGkbyP3z9G5Be0nqC6V3o1p8q7z6l1y3pJ8sBz9tqQ3C" }))
  const makes = ["Toyota", "Honda", "Suzuki", "Hyundai", "Kia"]
  const cities = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"]
  const items = Array.from({ length: 30 }).map(() => ({
    sellerId: user._id,
    title: `${faker.vehicle.manufacturer()} ${faker.vehicle.model()} ${faker.number.int({ min: 2005, max: 2024 })}`,
    price: faker.number.int({ min: 300000, max: 10000000 }),
    make: faker.helpers.arrayElement(makes),
    model: faker.vehicle.model(),
    year: faker.number.int({ min: 2005, max: 2024 }),
    mileage: faker.number.int({ min: 1000, max: 200000 }),
    city: faker.helpers.arrayElement(cities),
    engine: `${faker.number.int({ min: 800, max: 3500 })}cc`,
    transmission: faker.helpers.arrayElement(["Manual", "Automatic"]),
    fuelType: faker.helpers.arrayElement(["Petrol", "Diesel", "Hybrid", "Electric"]),
    condition: faker.helpers.arrayElement(["Used", "New"]),
    registeredCity: faker.helpers.arrayElement(cities),
    description: faker.lorem.paragraph(),
    images: []
  }))
  await Listing.deleteMany({})
  await Listing.insertMany(items)
  process.exit(0)
}

run()
