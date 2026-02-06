
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/hackxtras";

const toolSchema = new mongoose.Schema({
    name: String,
    sourceUrl: String
});

const Tool = mongoose.models.Tool || mongoose.model('Tool', toolSchema);

async function clearTools() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(MONGODB_URI);

        console.log("Deleting all tools...");
        const res = await Tool.deleteMany({});
        console.log(`Deleted ${res.deletedCount} tools.`);

        await mongoose.disconnect();
    } catch (e) {
        console.error("Error:", e);
    }
}

clearTools();
