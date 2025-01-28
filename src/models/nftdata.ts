import mongoose, { Schema, Document, Model } from "mongoose";

export interface INFT extends Document {
  tokenId: string;
  metadata: Record<string, any>;
  image: string;
  name: string;
  point: number;
}

const nftdata: Schema = new Schema({
  tokenId: { type: String, required: true, unique: true },
  image: { type: String, required: false },
  name: { type: String, required: false },
  point: { type: Number, default: 0 },
});

console.log(mongoose.models); // This will help you debug model registration


export const NftModel =  mongoose?.models?.nftdata ||  mongoose.model("nftdata", nftdata);



