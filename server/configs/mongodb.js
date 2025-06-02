import mongoose from "mongoose";

//connect to db
const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database connected"));

  await mongoose.connect(`${process.env.MONGODB_URI}/coursehub`);
};

export default connectDB;
