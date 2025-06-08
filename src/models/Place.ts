import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IPlace extends Document {
  name: string
  description: string
  category: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  images: string[]
  submittedBy: string
  createdAt: Date
  updatedAt: Date
}

const coordinatesSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false })

const locationSchema = new Schema({
  address: { type: String, required: true },
  coordinates: { type: coordinatesSchema, required: true }
}, { _id: false })

const placeSchema = new Schema<IPlace>({
  name: { type: String, required: false },
  description: { type: String, required: false },
  category: { type: String, required: false },
  location: { type: locationSchema, required: false },
  images: { type: [String], default: [] },
  submittedBy: { type: String, default: 'Anonymous' },
  createdAt: { type: Schema.Types.Mixed },
  updatedAt: { type: Schema.Types.Mixed }
}, {
  timestamps: false,
  collection: 'places',
  strict: false
})

const Place: Model<IPlace> = mongoose.models.Place || mongoose.model<IPlace>('Place', placeSchema)

export default Place