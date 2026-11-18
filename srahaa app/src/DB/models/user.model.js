import mongoose, { Schema } from "mongoose"
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../modules/user/user.types.js"
import { decryption, encryption } from "../../utils/security/encryption.js"

const otpSchema = new Schema(
  {
    otp: { type: String, required: true },
    expireIn: {
      type: Date,
      default: Date.now() + 5 * 60 * 1000,
    },
  },
  {
    _id: false,
  },
)

otpSchema.index("expireIn", { expireAfterSeconds: 0 })

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM
      },
    },
    phone: {
      type: String,
      set: (value) => encryption(value),
      get: (value) => decryption(value),
    },
    age: Number,
    profileImage: {
      type: String,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    bio: String,
    username: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.SYSTEM
      },
      unique: true,
    },
    confirmedat: {
      type: Date,
    },
    blockedat: Date,
    otp: otpSchema,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret.password
        delete ret.otp
        delete ret.id
        return ret
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: (doc, ret) => {
        delete ret.id
        return ret
      },
    },
    virtuals: {
      // fullName: {
      //   get() {
      //     return this.firstName + " " + this.lastName
      //   },
      //   set(value) {
      //     const [firstName, lastName] = value.split(" ")
      //     if (!firstName || !lastName) {
      //       throw new Error("Invalid full name format")
      //     }
      //     this.set("firstName", firstName)
      //     this.set("lastName", lastName)
      //   },
      // },
    },
  },
)

export const userModel = mongoose.model("User", userSchema)
