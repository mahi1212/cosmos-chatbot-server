import { connect, disconnect } from "mongoose";


// main().catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/test');

//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

export const connectDatabase = async () => {
    try {
        await connect(process.env.MONGO_DB_URL as string);
    } catch (error) { 
        console.error(error)
        console.log('Check network connection')
    }
}

// export const disconnectFromDatabase = async () => {
//     try {
//         await disconnect();
//     } catch (error) {
//         console.error(error)
//         throw new Error("Cannot connect to MongoDB")
//     }
// }
