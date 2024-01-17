import mongoose from 'mongoose';
import 'dotenv/config';

const url = process.env.URL;

const connectToMongo = async () => {
    await mongoose.connect(url);
};

export default connectToMongo;
