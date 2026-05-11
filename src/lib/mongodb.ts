import { MongoClient, type Db } from "mongodb";

function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Missing environment variable: "MONGODB_URI"');
  }
  return uri;
}

declare global {
  var __pickaxeMongoClientPromise: Promise<MongoClient> | undefined;
}

let prodClientPromise: Promise<MongoClient> | undefined;

function getClientPromise(): Promise<MongoClient> {
  const uri = requireMongoUri();
  if (process.env.NODE_ENV === "development") {
    if (!global.__pickaxeMongoClientPromise) {
      global.__pickaxeMongoClientPromise = new MongoClient(uri).connect();
    }
    return global.__pickaxeMongoClientPromise;
  }
  if (!prodClientPromise) {
    prodClientPromise = new MongoClient(uri).connect();
  }
  return prodClientPromise;
}

let indexesEnsured = false;

/** MongoDB database from connection string path (e.g. .../pickaxe?...). */
export async function getMongoDb(): Promise<Db> {
  const client = await getClientPromise();
  const db = client.db();

  if (!indexesEnsured) {
    indexesEnsured = true;
    void Promise.all([
      db.collection("agents").createIndex({ id: 1 }, { unique: true }),
      db
        .collection("conversations")
        .createIndex({ agentId: 1 }, { unique: true }),
    ]).catch(() => undefined);
  }

  return db;
}
