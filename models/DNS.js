import mongoose from "mongoose";

const { Schema } = mongoose;

const dnsSchema = new Schema({
    domain: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    },
});

export default mongoose.model("dns", dnsSchema);
