# HackXtras Admin Backend - Setup Guide

## 🚀 Quick Start

### 1. **Database Setup**

You need MongoDB running locally or a MongoDB Atlas connection string.

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS with Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
- Go to https://www.mongodb.com/cloud/atlas
- Create a free account and cluster
- Get your connection string

### 2. **Environment Variables**

The `.env.local` file has been created with default values:

```env
MONGODB_URI=mongodb://localhost:27017/hackxtras
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=admin@hackxtras.com
ADMIN_PASSWORD=Admin@123456
```

**Important:** Change `JWT_SECRET` to a strong random value in production!

### 3. **Initialize Admin User**

The admin user is created with default credentials. You can change them by:

1. Login at `http://localhost:3003/admin/login`
2. Use default credentials:
   - Email: `admin@hackxtras.com`
   - Password: `Admin@123456`

## 📁 Project Structure

```
app/
├── api/                           # Backend API routes
│   ├── auth/
│   │   └── login/                # Admin authentication
│   ├── courses/                  # Course CRUD endpoints
│   ├── labs/                     # Lab CRUD endpoints
│   ├── resources/                # Resource CRUD endpoints
│   ├── team/                     # Team member CRUD endpoints
│   ├── channels/                 # Channel CRUD endpoints
│   └── documentaries/            # Documentary CRUD endpoints
│
├── admin/                         # Admin dashboard pages
│   ├── layout.tsx                # Admin layout with sidebar
│   ├── login/                    # Login page
│   ├── dashboard/                # Dashboard home
│   ├── courses/                  # Course management
│   ├── labs/                     # Lab management
│   ├── resources/                # Resource management
│   ├── team/                     # Team management
│   ├── channels/                 # Channel management
│   └── documentaries/            # Documentary management
│
lib/
├── mongodb.ts                     # MongoDB connection
├── models.ts                      # Mongoose schemas
├── auth.ts                        # Authentication utilities
└── utils.ts                       # Utility functions

hooks/
└── use-api.ts                     # API hook for frontend
```

## 🔐 Authentication Flow

1. Admin logs in with email/password
2. `/api/auth/login` validates credentials
3. JWT token is generated and stored in localStorage
4. All API requests include `Authorization: Bearer <token>` header
5. Backend validates token before allowing modifications

## 📊 Database Collections

### Admin
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  createdAt: Date
  updatedAt: Date
}
```

### Course
```typescript
{
  title: string
  description: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  youtubeLink?: string
  duration?: string
  instructor?: string
  createdAt: Date
  updatedAt: Date
}
```

### Lab
```typescript
{
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  objectives: string[]
  tools: string[]
  timeToComplete: number (minutes)
  createdAt: Date
  updatedAt: Date
}
```

### Resource
```typescript
{
  title: string
  description: string
  type: 'PDF' | 'Video' | 'Link' | 'Document'
  url: string
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

### TeamMember
```typescript
{
  name: string
  role: string
  bio: string
  image?: string
  email: string
  socialLinks?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  createdAt: Date
  updatedAt: Date
}
```

### Channel
```typescript
{
  name: string
  description: string
  icon?: string
  link: string
  category: string
  followers: number
  createdAt: Date
  updatedAt: Date
}
```

### Documentary
```typescript
{
  title: string
  description: string
  videoLink: string
  duration?: string
  releaseDate: Date
  category: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (auth required)
- `GET /api/courses/:id` - Get specific course
- `PUT /api/courses/:id` - Update course (auth required)
- `DELETE /api/courses/:id` - Delete course (auth required)

### Labs
- `GET /api/labs` - Get all labs
- `POST /api/labs` - Create lab (auth required)
- `GET /api/labs/:id` - Get specific lab
- `PUT /api/labs/:id` - Update lab (auth required)
- `DELETE /api/labs/:id` - Delete lab (auth required)

### Resources
- `GET /api/resources` - Get all resources
- `POST /api/resources` - Create resource (auth required)
- `GET /api/resources/:id` - Get specific resource
- `PUT /api/resources/:id` - Update resource (auth required)
- `DELETE /api/resources/:id` - Delete resource (auth required)

### Team
- `GET /api/team` - Get all team members
- `POST /api/team` - Create team member (auth required)
- `GET /api/team/:id` - Get specific team member
- `PUT /api/team/:id` - Update team member (auth required)
- `DELETE /api/team/:id` - Delete team member (auth required)

### Channels
- `GET /api/channels` - Get all channels
- `POST /api/channels` - Create channel (auth required)
- `GET /api/channels/:id` - Get specific channel
- `PUT /api/channels/:id` - Update channel (auth required)
- `DELETE /api/channels/:id` - Delete channel (auth required)

### Documentaries
- `GET /api/documentaries` - Get all documentaries
- `POST /api/documentaries` - Create documentary (auth required)
- `GET /api/documentaries/:id` - Get specific documentary
- `PUT /api/documentaries/:id` - Update documentary (auth required)
- `DELETE /api/documentaries/:id` - Delete documentary (auth required)

## 🎯 Admin Dashboard Features

### Dashboard
- View statistics for all content types
- Quick overview of total items in database
- Navigation to management pages

### Content Management
- **Courses**: Add, edit, delete courses with YouTube links
- **Labs**: Create labs with difficulty levels and objectives
- **Resources**: Manage learning resources and links
- **Team**: Add team members with social profiles
- **Channels**: Manage social media channels
- **Documentaries**: Upload and organize documentaries

## 🛠️ Development

### Starting the Server
```bash
pnpm dev
```

Visit admin panel: `http://localhost:3003/admin/login`

### Making API Requests from Frontend

```typescript
const { request, loading, error } = useApi();

// Get all courses
const courses = await request('/api/courses');

// Create new course
await request('/api/courses', {
  method: 'POST',
  body: {
    title: 'Web Security 101',
    description: 'Learn web security basics',
    category: 'Web Security',
    level: 'Beginner',
  }
});

// Update course
await request('/api/courses/:id', {
  method: 'PUT',
  body: { title: 'Updated Title' }
});

// Delete course
await request('/api/courses/:id', {
  method: 'DELETE'
});
```

## 🔒 Security Considerations

1. **JWT Secret**: Change `JWT_SECRET` in production
2. **MongoDB URI**: Use strong credentials for MongoDB
3. **Password Hashing**: Passwords are automatically hashed with bcrypt
4. **Authentication**: All modify operations require valid JWT token
5. **CORS**: Configure as needed for production
6. **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### MongoDB Connection Errors
- Ensure MongoDB is running: `brew services list`
- Check connection string in `.env.local`
- Verify network access if using MongoDB Atlas

### Authentication Issues
- Clear localStorage and re-login
- Check JWT_SECRET is set correctly
- Verify admin user exists in database

### API Errors
- Check browser DevTools Network tab
- Look at Next.js terminal for error logs
- Verify request format matches schema

## 📝 Notes

- All timestamps are in UTC
- MongoDB ObjectIds are used for document IDs
- Passwords are hashed with bcrypt salt of 10
- JWT tokens expire after 7 days
- Default admin credentials should be changed immediately

## 🚀 Next Steps

1. Start dev server: `pnpm dev`
2. Visit: `http://localhost:3003/admin/login`
3. Login with default credentials
4. Start adding content!
5. Connect frontend pages to fetch from API instead of hardcoded data

---

For issues or questions, check the API endpoints documentation above.
