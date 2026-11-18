import chalk from "chalk"
import mongoose from "mongoose"

export const DBcounnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    console.log(chalk.green("Connected to MongoDB"))
  } catch (error) {
    console.log(chalk.red("Error connecting failed"), error)
  }
}
