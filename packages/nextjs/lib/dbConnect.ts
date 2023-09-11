import _mongoose, { connect } from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    promise: ReturnType<typeof connect> | null;
    conn: typeof _mongoose | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE_NAME = process.env.MONGODB_DATABASE_NAME;
if (!MONGODB_URI || !MONGODB_DATABASE_NAME) {
  throw new Error("Please define the MONGODB_URI and MONGODB_DATABASE_NAME environment variables inside .env.local");
}
const MONGODB_URI_STRING = (MONGODB_URI + MONGODB_DATABASE_NAME) as string;
/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  console.log("Connecting...");
  // set to `true` if you want projects data seeded to database
  //await seedDatabase(MONGODB_URI_STRING, false);
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = connect(MONGODB_URI_STRING, opts).then(mongoose => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
