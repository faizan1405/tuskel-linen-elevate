import mongoose, { Schema, Document, Model } from "mongoose";

let _connection: typeof mongoose | null = null;

export async function connectDb(): Promise<typeof mongoose> {
  if (_connection && _connection.connection.readyState >= 1) return _connection;
  const env = process.env as Record<string, string | undefined>;
  const uri = env["MONGODB_URI"];
  if (!uri) throw new Error("MONGODB_URI not set");
  _connection = await mongoose.connect(uri);
  mongoose.connection.on("error", (err: unknown) => console.error("[db] Connection error:", err));
  mongoose.connection.on("disconnected", () => console.warn("[db] Disconnected"));
  return _connection;
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface IProduct extends Document {
  slug: string; name: string; fabric: "pure-linen" | "linen-blend"; fabricLabel: string;
  colorName: string; colorSlug: string; swatch: string; mrp: number; price: number;
  images: string[]; sizes: string[]; summary: string; details: string[]; care: string[];
  fit: string; modelNote: string; newArrival: boolean; bestSeller: boolean;
  popularity: number; addedOn: string; _stock: number; _status: "active" | "draft" | "archived";
}

const productSchema = new Schema<IProduct>({
  slug:{type:String,required:true,unique:true,index:true}, name:{type:String,required:true},
  fabric:{type:String,enum:["pure-linen","linen-blend"],required:true}, fabricLabel:{type:String,required:true},
  colorName:{type:String,required:true}, colorSlug:{type:String,required:true}, swatch:{type:String,required:true},
  mrp:{type:Number,required:true}, price:{type:Number,required:true}, images:{type:[String],default:[]},
  sizes:{type:[String],default:[]}, summary:{type:String,default:""}, details:{type:[String],default:[]},
  care:{type:[String],default:[]}, fit:{type:String,default:""}, modelNote:{type:String,default:""},
  newArrival:{type:Boolean,default:false}, bestSeller:{type:Boolean,default:false},
  popularity:{type:Number,default:0}, addedOn:{type:String,default:""},
  _stock:{type:Number,default:0}, _status:{type:String,enum:["active","draft","archived"],default:"draft",index:true},
}, {collection:"products",timestamps:true});

export const ProductModel: Model<IProduct> =
  (mongoose.models as Record<string, Model<IProduct>>)["Product"] ??
  mongoose.model<IProduct>("Product", productSchema);

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface IOrder extends Document {
  orderNo:string; customer:string; email:string; phone:string;
  items:Array<{slug:string;name:string;size:string;qty:number;price:number}>;
  subtotal:number; discount:number; total:number;
  status:"pending"|"confirmed"|"processing"|"shipped"|"delivered"|"cancelled"|"returned";
  paymentMethod:string; shippingAddress:string; placedOn:string; updatedOn:string; notes?:string;
}

const orderSchema = new Schema<IOrder>({
  orderNo:{type:String,required:true,unique:true,index:true}, customer:{type:String,required:true,index:true},
  email:{type:String,required:true}, phone:{type:String,required:true},
  items:{ type: [], default: [] } as any, subtotal:{type:Number,required:true}, discount:{type:Number,default:0},
  total:{type:Number,required:true}, status:{type:String,enum:["pending","confirmed","processing","shipped","delivered","cancelled","returned"],default:"pending",index:true},
  paymentMethod:{type:String,default:""}, shippingAddress:{type:String,default:""},
  placedOn:{type:String,required:true,index:true}, updatedOn:{type:String,required:true}, notes:{type:String},
}, {collection:"orders",timestamps:true});

export const OrderModel: Model<IOrder> =
  (mongoose.models as Record<string, Model<IOrder>>)["Order"] ??
  mongoose.model<IOrder>("Order", orderSchema);

// ─── Customers ───────────────────────────────────────────────────────────────

export interface ICustomer extends Document {
  name:string; email:string; phone:string; orders:number; spent:number; firstOrder:string; lastOrder:string;
  status:"active"|"inactive";
}

const customerSchema = new Schema<ICustomer>({
  name:{type:String,required:true,index:true}, email:{type:String,required:true}, phone:{type:String,required:true},
  orders:{type:Number,default:0}, spent:{type:Number,default:0}, firstOrder:{type:String,default:""},
  lastOrder:{type:String,default:""}, status:{type:String,enum:["active","inactive"],default:"inactive",index:true},
}, {collection:"customers",timestamps:true});

export const CustomerModel: Model<ICustomer> =
  (mongoose.models as Record<string, Model<ICustomer>>)["Customer"] ??
  mongoose.model<ICustomer>("Customer", customerSchema);

// ─── Site Config ─────────────────────────────────────────────────────────────

export interface ISiteConfig extends Document {
  key: string; value: Record<string, unknown>;
}

const siteConfigSchema = new Schema<ISiteConfig>({
  key:{type:String,required:true,unique:true,index:true}, value:{type:Schema.Types.Mixed,required:true},
}, {collection:"site_config",timestamps:true});

export const SiteConfigModel: Model<ISiteConfig> =
  (mongoose.models as Record<string, Model<ISiteConfig>>)["SiteConfig"] ??
  mongoose.model<ISiteConfig>("SiteConfig", siteConfigSchema);

// ─── Inquiries / Contact ───────────────────────────────────────────────────────

export interface IInquiry extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  repliedAt?: string;
  createdAt: string;
}

const inquirySchema = new Schema<IInquiry>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: "" },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ["new", "read", "replied", "closed"], default: "new", index: true },
  repliedAt: { type: String },
  createdAt: { type: String, required: true, default: () => new Date().toISOString(), index: true },
}, { collection: "inquiries", timestamps: false });

export const InquiryModel: Model<IInquiry> =
  (mongoose.models as Record<string, Model<IInquiry>>)["Inquiry"] ??
  mongoose.model<IInquiry>("Inquiry", inquirySchema);

// ─── Categories ────────────────────────────────────────────────────────────────

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  image: string;
  active: boolean;
  productCount: number;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: "" },
  parent: { type: String, default: null },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true, index: true },
  productCount: { type: Number, default: 0 },
}, { collection: "categories", timestamps: true });

export const CategoryModel: Model<ICategory> =
  (mongoose.models as Record<string, Model<ICategory>>)["Category"] ??
  mongoose.model<ICategory>("Category", categorySchema);
