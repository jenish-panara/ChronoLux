const mongoose = require("mongoose");

const MONGO_URI = "mongodb://jenishpanara1492005_db_user:Zzct8t2tPJaMiqGj@ac-svnckzs-shard-00-00.mq9zwlm.mongodb.net:27017,ac-svnckzs-shard-00-01.mq9zwlm.mongodb.net:27017,ac-svnckzs-shard-00-02.mq9zwlm.mongodb.net:27017/chronolux?ssl=true&replicaSet=atlas-12kkfs-shard-0&authSource=admin&appName=Cluster0";

async function checkMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
    console.log("Database:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);

    await mongoose.disconnect();
  } catch (error) {
    console.log("❌ MongoDB Connection Failed");
    console.log("Error:", error.message);
  }
}

checkMongoDB();