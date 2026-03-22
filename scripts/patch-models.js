const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\manan\\OneDrive\\Documents\\hack-xtras-website-design\\lib\\models.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Update labSchema
const labSchemaSearch = /isPremium: \{\s+type: Boolean,\s+default: false,\s+\},/;
const labSchemaReplacement = `isPremium: {
      type: Boolean,
      default: false,
    },
    flag: {
      type: String,
      required: false,
      select: false, // Hidden by default
    },`;

if (content.match(labSchemaSearch)) {
    content = content.replace(labSchemaSearch, labSchemaReplacement);
    console.log('Updated labSchema');
} else {
    console.error('Failed to find labSchema pattern');
}

// Update User interface
const userInterfaceSearch = /updatedAt: Date;\s+comparePassword\(candidatePassword: string\): Promise<boolean>;\s+\}/;
const userInterfaceReplacement = `updatedAt: Date;
  // Verification & Progress
  completedLabs: string[];
  completedCourses: string[];
  courseProgress: {
    courseId: string;
    completedModules: number[];
  }[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}`;

if (content.match(userInterfaceSearch)) {
    content = content.replace(userInterfaceSearch, userInterfaceReplacement);
    console.log('Updated IUser interface');
} else {
    console.error('Failed to find IUser interface pattern');
}

// Update userSchema
const userSchemaSearch = /replacedBy: \{ type: String \},\s+\},\s+\],/;
const userSchemaReplacement = `replacedBy: { type: String },
      },
    ],
    completedLabs: [{ type: Schema.Types.ObjectId, ref: 'Lab' }],
    completedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    courseProgress: [
      {
        courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
        completedModules: [Number],
      },
    ],`;

if (content.match(userSchemaSearch)) {
    content = content.replace(userSchemaSearch, userSchemaReplacement);
    console.log('Updated userSchema');
} else {
    console.error('Failed to find userSchema pattern');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully wrote updates to lib/models.ts');
