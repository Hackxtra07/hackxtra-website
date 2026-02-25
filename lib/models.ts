import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Admin User Model
export interface IAdmin extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (this: IAdmin) {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

adminSchema.methods.comparePassword = async function (this: IAdmin, candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Course Model
export interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  youtubeLink: string;
  duration: string;
  instructor: string;
  coverImage?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    youtubeLink: {
      type: String,
      required: false,
    },
    duration: {
      type: String,
      required: false,
    },
    instructor: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Lab Model
export interface ILab extends Document {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  objectives: string[];
  tools: string[];
  timeToComplete: number;
  url?: string;
  coverImage?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const labSchema = new Schema<ILab>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    category: {
      type: String,
      required: true,
    },
    objectives: [String],
    tools: [String],
    timeToComplete: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Resource Model
export interface IResource extends Document {
  title: string;
  description: string;
  type: 'PDF' | 'Video' | 'Link' | 'Document';
  url: string;
  category: string;
  tags: string[];
  coverImage?: string;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['PDF', 'Video', 'Link', 'Document'],
      default: 'Link',
    },
    url: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    coverImage: {
      type: String,
      required: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Team Member Model
export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  image: string;
  email: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
    },
  },
  { timestamps: true }
);

// Channel Model
export interface IChannel extends Document {
  name: string;
  description: string;
  icon: string;
  link: string;
  category: string;
  followers: number;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: false,
    },
    link: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    followers: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Documentary Model
export interface IDocumentary extends Document {
  title: string;
  description: string;
  videoLink: string;
  duration: string;
  releaseDate: Date;
  category: string;
  tags: string[];
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentarySchema = new Schema<IDocumentary>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoLink: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: false,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    thumbnail: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Position Model (Open Positions)
export interface IPosition extends Document {
  title: string;
  type: string;
  description: string;
  skills: string[];
  requirements: string[];
  isOpen: boolean;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const positionSchema = new Schema<IPosition>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    skills: [String],
    requirements: [String],
    isOpen: { type: Boolean, default: true },
    icon: { type: String, default: 'Code' },
  },
  { timestamps: true }
);

// Settings Model (for Global Config)
export interface ISettings extends Document {
  contactEmail: string;
}

const settingsSchema = new Schema<ISettings>(
  {
    contactEmail: { type: String, required: true, default: 'admin@example.com' },
  },
  { timestamps: true }
);

// Create models with proper typing
// Special check to force re-registration if coverImage field is missing (fixes stale models in Next.js dev)
if (mongoose.models.Course && !mongoose.models.Course.schema.paths.coverImage) {
  delete mongoose.models.Course;
}
if (mongoose.models.Lab && !mongoose.models.Lab.schema.paths.coverImage) {
  delete mongoose.models.Lab;
}
if (mongoose.models.Resource && (!mongoose.models.Resource.schema.paths.coverImage || !mongoose.models.Resource.schema.paths.isPremium)) {
  delete mongoose.models.Resource;
}
if (mongoose.models.Course && !mongoose.models.Course.schema.paths.isPremium) {
  delete mongoose.models.Course;
}
if (mongoose.models.Lab && !mongoose.models.Lab.schema.paths.isPremium) {
  delete mongoose.models.Lab;
}

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);
export const Lab = mongoose.models.Lab || mongoose.model<ILab>('Lab', labSchema);
export const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);
export const TeamMember = mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
export const Channel = mongoose.models.Channel || mongoose.model<IChannel>('Channel', channelSchema);
export const Documentary = mongoose.models.Documentary || mongoose.model<IDocumentary>('Documentary', documentarySchema);
export const Position = mongoose.models.Position || mongoose.model<IPosition>('Position', positionSchema);
export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);

// Challenge Model (CTF & Quiz)
export interface IChallenge extends Document {
  title: string;
  description: string;
  flag: string; // Used as Correct Answer for Quizzes
  points: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'quiz' | 'ctf';
  options?: string[]; // For Quiz type
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    flag: { type: String, required: true, select: false }, // Hide flag by default
    points: { type: Number, required: true },
    category: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Easy',
    },
    type: {
      type: String,
      enum: ['quiz', 'ctf'],
      default: 'quiz',
    },
    options: [String],
  },
  { timestamps: true }
);

export const Challenge = mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', challengeSchema);

// User Model (Leaderboard & Auth)
export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  points: number;
  badges: string[];
  solvedChallenges: string[];
  country: string;
  avatarColor: string;
  bio?: string;
  role: 'user' | 'admin';
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  change: 'up' | 'down' | 'same';
  isPro?: boolean;
  subscriptionExpiresAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    points: {
      type: Number,
      required: true,
      default: 0,
    },
    badges: [String],
    solvedChallenges: [{ type: Schema.Types.ObjectId, ref: 'Challenge' }],
    country: {
      type: String,
      default: 'US',
    },
    avatarColor: {
      type: String,
      default: 'bg-blue-500/20 text-blue-500',
    },
    bio: String,
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String,
    },
    change: {
      type: String,
      enum: ['up', 'down', 'same'],
      default: 'same',
    },
    isPro: {
      type: Boolean,
      default: false,
    },
    subscriptionExpiresAt: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Hash password before saving
// Hash password before saving
userSchema.pre('save', async function (this: IUser) {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.methods.comparePassword = async function (this: IUser, candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

// Message Model for Chat System
export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  senderModel: 'User' | 'Admin';
  recipient?: mongoose.Types.ObjectId; // Optional for Broadcasts (though broadcasts might create individual messages)
  recipientModel: 'User' | 'Admin';
  content: string;
  isRead: boolean;
  isSaved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel',
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['User', 'Admin'],
    },
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel',
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['User', 'Admin'],
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isSaved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

// Store Item Model
export interface IStoreItem extends Document {
  title: string;
  description: string;
  cost: number;
  type: 'deal' | 'resource';
  value: string; // The secret code or link
  image?: string;
  stock: number; // -1 for infinite
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeItemSchema = new Schema<IStoreItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['deal', 'resource'], required: true },
    value: { type: String, required: true }, // Not hidden by default for admins, but should be handled carefully in API
    image: { type: String },
    stock: { type: Number, default: -1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreItem = mongoose.models.StoreItem || mongoose.model<IStoreItem>('StoreItem', storeItemSchema);

// Transaction Model
export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemTitle: string; // Snapshot of item title
  itemType: string; // Snapshot of item type
  cost: number;
  value: string; // Snapshot of value in case item changes
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'StoreItem', required: true },
    itemTitle: { type: String, required: true },
    itemType: { type: String, required: true },
    cost: { type: Number, required: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);

// News Model
export interface INews extends Document {
  title: string;
  content: string; // Rich text or HTML
  image?: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    author: { type: String, required: true },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const News = mongoose.models.News || mongoose.model<INews>('News', newsSchema);


// Tool Model (Kali Linux Tools)
export interface ITool extends Document {
  name: string;
  description: string;
  category: string;
  usage: string; // Markdown
  installCommand: string;
  sourceUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const toolSchema = new Schema<ITool>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    usage: { type: String, default: '' },
    installCommand: { type: String, default: 'sudo apt install toolname' },
    sourceUrl: { type: String },
  },
  { timestamps: true }
);

export const Tool = mongoose.models.Tool || mongoose.model<ITool>('Tool', toolSchema);




// Community Configs Model
export interface ICommunityStats {
  icon: string;
  value: string;
  label: string;
}

export interface IContributor {
  name: string;
  role: string;
  points: number;
  avatar: string;
}

export interface IEvent {
  title: string;
  date: string;
  time: string;
  participants: number;
  type: string;
}

export interface ICommunityChannel {
  icon: string;
  name: string;
  description: string;
  members: number;
}

export interface ICommunityConfigs extends Document {
  stats: ICommunityStats[];
  topContributors: IContributor[];
  upcomingEvents: IEvent[];
  popularChannels: ICommunityChannel[];
  updatedAt: Date;
}

const communityConfigsSchema = new Schema<ICommunityConfigs>(
  {
    stats: [{
      icon: String,
      value: String,
      label: String
    }],
    topContributors: [{
      name: String,
      role: String,
      points: Number,
      avatar: String
    }],
    upcomingEvents: [{
      title: String,
      date: String,
      time: String,
      participants: Number,
      type: String
    }],
    popularChannels: [{
      icon: String,
      name: String,
      description: String,
      members: Number
    }]
  },
  { timestamps: true }
);

export const CommunityConfigs = mongoose.models.CommunityConfigs || mongoose.model<ICommunityConfigs>('CommunityConfigs', communityConfigsSchema);
