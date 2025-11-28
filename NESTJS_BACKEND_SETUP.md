# NestJS Backend Architecture Guide

## 🏗️ Architecture Overview

**Frontend:** React + Vite (Vercel)  
**Backend:** NestJS (DigitalOcean App Platform)  
**Database:** Neon PostgreSQL (Serverless)  
**Authentication:** Firebase Auth (frontend) + JWT validation (backend)  
**Storage:** Cloudinary (images)  
**Email:** Resend  
**Deployment:** DigitalOcean App Platform ($5/month starter)

---

## 📦 Backend Project Structure

```
fittrack-backend/
├── src/
│   ├── main.ts                      # App entry point
│   ├── app.module.ts                # Root module
│   ├── config/
│   │   ├── database.config.ts       # Neon PostgreSQL config
│   │   ├── firebase.config.ts       # Firebase Admin SDK
│   │   └── cloudinary.config.ts     # Cloudinary config
│   ├── common/
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts  # @CurrentUser()
│   │   ├── guards/
│   │   │   └── firebase-auth.guard.ts     # JWT verification
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts   # Response formatting
│   │   └── filters/
│   │       └── http-exception.filter.ts   # Error handling
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-profile.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── meals/
│   │   ├── meals.module.ts
│   │   ├── meals.controller.ts
│   │   ├── meals.service.ts
│   │   └── dto/
│   │       ├── create-meal.dto.ts
│   │       └── query-meals.dto.ts
│   ├── streaks/
│   │   ├── streaks.module.ts
│   │   ├── streaks.controller.ts
│   │   ├── streaks.service.ts
│   │   └── dto/
│   ├── journal/
│   │   ├── journal.module.ts
│   │   ├── journal.controller.ts
│   │   └── journal.service.ts
│   ├── water/
│   │   ├── water.module.ts
│   │   ├── water.controller.ts
│   │   └── water.service.ts
│   ├── buddies/
│   │   ├── buddies.module.ts
│   │   ├── buddies.controller.ts
│   │   ├── buddies.service.ts
│   │   └── dto/
│   ├── achievements/
│   │   ├── achievements.module.ts
│   │   ├── achievements.controller.ts
│   │   └── achievements.service.ts
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   └── reports.scheduler.ts      # Cron jobs
│   ├── photos/
│   │   ├── photos.module.ts
│   │   ├── photos.controller.ts
│   │   └── photos.service.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   └── notifications.scheduler.ts
│   └── database/
│       ├── database.module.ts
│       ├── drizzle.service.ts
│       └── schema/
│           ├── users.schema.ts
│           ├── meals.schema.ts
│           ├── streaks.schema.ts
│           └── ... (all tables)
├── drizzle/
│   ├── migrations/
│   └── meta/
├── test/
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── drizzle.config.ts
```

---

## 🚀 Step-by-Step Setup

### 1. Create NestJS Project

```bash
# Install NestJS CLI globally
npm i -g @nestjs/cli

# Create new project
nest new fittrack-backend

# Choose pnpm as package manager

# Navigate to project
cd fittrack-backend
```

### 2. Install Dependencies

```bash
# Core dependencies
pnpm add @nestjs/config @nestjs/schedule
pnpm add drizzle-orm @neondatabase/serverless
pnpm add firebase-admin
pnpm add cloudinary
pnpm add resend
pnpm add class-validator class-transformer
pnpm add bcrypt
pnpm add date-fns

# Dev dependencies
pnpm add -D drizzle-kit
pnpm add -D @types/node
```

### 3. Environment Configuration

Create `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/fittrack?sslmode=require

# Firebase Admin SDK
FIREBASE_PROJECT_ID=napps-3db69
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@napps-3db69.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxx

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://fittrack.vercel.app
```

### 4. Database Schema (Drizzle ORM)

**`src/database/schema/users.schema.ts`:**

```typescript
import { pgTable, text, timestamp, numeric, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: text('email').notNull().unique(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userProfiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  startingWeight: numeric('starting_weight', { precision: 5, scale: 2 }),
  currentWeight: numeric('current_weight', { precision: 5, scale: 2 }),
  goalWeight: numeric('goal_weight', { precision: 5, scale: 2 }),
  height: numeric('height', { precision: 5, scale: 2 }),
  dailyCalorieGoal: numeric('daily_calorie_goal', { precision: 6, scale: 2 }),
  dailyWaterGoal: numeric('daily_water_goal', { precision: 3, scale: 1 }).default('8'),
  setupCompleted: boolean('setup_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

**`src/database/schema/meals.schema.ts`:**

```typescript
import { pgTable, serial, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const meals = pgTable('meals', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  calories: numeric('calories', { precision: 6, scale: 2 }).notNull(),
  protein: numeric('protein', { precision: 5, scale: 2 }),
  carbs: numeric('carbs', { precision: 5, scale: 2 }),
  fats: numeric('fats', { precision: 5, scale: 2 }),
  imageUrl: text('image_url'),
  cloudinaryPublicId: text('cloudinary_public_id'),
  mealType: text('meal_type').notNull(), // 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**`src/database/schema/index.ts`:**

```typescript
export * from './users.schema';
export * from './meals.schema';
export * from './streaks.schema';
export * from './journal.schema';
export * from './water.schema';
export * from './buddies.schema';
export * from './achievements.schema';
export * from './photos.schema';
```

### 5. Drizzle Service

**`src/database/drizzle.service.ts`:**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit {
  public db: ReturnType<typeof drizzle>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('NEON_DATABASE_URL');
    const sql = neon(connectionString);
    this.db = drizzle(sql, { schema });
  }
}
```

**`src/database/database.module.ts`:**

```typescript
import { Module, Global } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';

@Global()
@Module({
  providers: [DrizzleService],
  exports: [DrizzleService],
})
export class DatabaseModule {}
```

### 6. Firebase Auth Guard

**`src/common/guards/firebase-auth.guard.ts`:**

```typescript
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get('FIREBASE_PROJECT_ID'),
          privateKey: this.configService
            .get('FIREBASE_PRIVATE_KEY')
            .replace(/\\n/g, '\n'),
          clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = decodedToken; // Attach user to request
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

**`src/common/decorators/current-user.decorator.ts`:**

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Firebase decoded token
  },
);
```

### 7. Users Module Example

**`src/users/dto/create-user.dto.ts`:**

```typescript
import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  id: string; // Firebase UID

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  photoURL?: string;
}

export class UpdateProfileDto {
  @IsNumber()
  @IsOptional()
  startingWeight?: number;

  @IsNumber()
  @IsOptional()
  currentWeight?: number;

  @IsNumber()
  @IsOptional()
  goalWeight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  dailyCalorieGoal?: number;

  @IsNumber()
  @IsOptional()
  dailyWaterGoal?: number;
}
```

**`src/users/users.service.ts`:**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '../database/drizzle.service';
import { users, userProfiles } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto, UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private drizzle: DrizzleService) {}

  async createUser(dto: CreateUserDto) {
    const [user] = await this.drizzle.db
      .insert(users)
      .values({
        id: dto.id,
        email: dto.email,
        displayName: dto.displayName,
        photoURL: dto.photoURL,
      })
      .returning();

    // Create empty profile
    await this.drizzle.db.insert(userProfiles).values({
      userId: user.id,
    });

    return user;
  }

  async findById(userId: string) {
    const [user] = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserProfile(userId: string) {
    const [profile] = await this.drizzle.db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const [profile] = await this.drizzle.db
      .update(userProfiles)
      .set({
        ...dto,
        setupCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    return profile;
  }

  async deleteUser(userId: string) {
    await this.drizzle.db.delete(users).where(eq(users.id, userId));
    return { success: true };
  }
}
```

**`src/users/users.controller.ts`:**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserDto, UpdateProfileDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.findById(user.uid);
  }

  @Get('me/profile')
  @UseGuards(FirebaseAuthGuard)
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.getUserProfile(user.uid);
  }

  @Put('me/profile')
  @UseGuards(FirebaseAuthGuard)
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.uid, dto);
  }

  @Delete('me')
  @UseGuards(FirebaseAuthGuard)
  async deleteMyAccount(@CurrentUser() user: any) {
    return this.usersService.deleteUser(user.uid);
  }
}
```

### 8. Meals Module Example

**`src/meals/meals.controller.ts`:**

```typescript
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { MealsService } from './meals.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMealDto, QueryMealsDto } from './dto';

@Controller('meals')
@UseGuards(FirebaseAuthGuard)
export class MealsController {
  constructor(private mealsService: MealsService) {}

  @Post()
  async createMeal(@CurrentUser() user: any, @Body() dto: CreateMealDto) {
    return this.mealsService.createMeal(user.uid, dto);
  }

  @Get()
  async getMeals(@CurrentUser() user: any, @Query() query: QueryMealsDto) {
    return this.mealsService.getMealsByDate(user.uid, query);
  }

  @Get(':id')
  async getMealById(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealsService.getMealById(user.uid, id);
  }

  @Delete(':id')
  async deleteMeal(
    @CurrentUser() user: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.mealsService.deleteMeal(user.uid, id);
  }

  @Get('stats/daily')
  async getDailyStats(@CurrentUser() user: any, @Query('date') date: string) {
    return this.mealsService.getDailyStats(user.uid, date);
  }
}
```

### 9. Scheduled Jobs (Cron)

**`src/reports/reports.scheduler.ts`:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportsScheduler {
  private readonly logger = new Logger(ReportsScheduler.name);

  constructor(private reportsService: ReportsService) {}

  // Run every Monday at 6 AM
  @Cron('0 6 * * 1', {
    name: 'weeklyReports',
    timeZone: 'America/New_York',
  })
  async handleWeeklyReports() {
    this.logger.log('Generating weekly reports...');
    await this.reportsService.generateWeeklyReportsForAllUsers();
    this.logger.log('Weekly reports completed');
  }
}
```

**`src/notifications/notifications.scheduler.ts`:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(private notificationsService: NotificationsService) {}

  // Run daily at 8 PM
  @Cron('0 20 * * *', {
    name: 'dailyCheckInReminders',
    timeZone: 'America/New_York',
  })
  async handleDailyReminders() {
    this.logger.log('Sending check-in reminders...');
    await this.notificationsService.sendCheckInReminders();
    this.logger.log('Reminders sent');
  }
}
```

### 10. App Module

**`src/app.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { MealsModule } from './meals/meals.module';
import { StreaksModule } from './streaks/streaks.module';
import { JournalModule } from './journal/journal.module';
import { WaterModule } from './water/water.module';
import { BuddiesModule } from './buddies/buddies.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ReportsModule } from './reports/reports.module';
import { PhotosModule } from './photos/photos.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    MealsModule,
    StreaksModule,
    JournalModule,
    WaterModule,
    BuddiesModule,
    AchievementsModule,
    ReportsModule,
    PhotosModule,
    NotificationsModule,
  ],
})
export class AppModule {}
```

**`src/main.ts`:**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS').split(','),
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
```

---

## 🌊 DigitalOcean App Platform Deployment

### 1. Prepare for Deployment

**Create `.dockerignore`:**

```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
.DS_Store
dist
```

**Create `Dockerfile` (optional, DO can auto-detect):**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

**Update `package.json` scripts:**

```json
{
  "scripts": {
    "start": "node dist/main",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "migrate": "drizzle-kit push:pg"
  }
}
```

### 2. Deploy to DigitalOcean

**Option A: GitHub Integration (Recommended)**

1. Push backend to separate repo:
   ```bash
   cd fittrack-backend
   git init
   git add .
   git commit -m "Initial NestJS backend"
   git remote add origin https://github.com/Onahi7/fittrack-backend.git
   git push -u origin main
   ```

2. Go to DigitalOcean App Platform: https://cloud.digitalocean.com/apps

3. Click **"Create App"** → **"GitHub"**

4. Select `fittrack-backend` repository

5. Configure build settings:
   - **Build Command:** `npm run build`
   - **Run Command:** `npm run start`
   - **HTTP Port:** `3000`

6. Add environment variables (from `.env`)

7. Choose plan: **$5/month Basic** (512MB RAM, 1 vCPU)

8. Deploy! 🚀

**Option B: CLI Deployment**

```bash
# Install doctl
brew install doctl  # macOS
# or download from: https://docs.digitalocean.com/reference/doctl/

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml
```

**`.do/app.yaml`:**

```yaml
name: fittrack-backend
region: nyc
services:
  - name: api
    github:
      repo: Onahi7/fittrack-backend
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm run start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs  # $5/month
    http_port: 3000
    envs:
      - key: NODE_ENV
        value: production
      - key: NEON_DATABASE_URL
        value: ${NEON_DATABASE_URL}
        type: SECRET
      - key: FIREBASE_PROJECT_ID
        value: ${FIREBASE_PROJECT_ID}
        type: SECRET
      # ... add all env vars
```

### 3. Database Migration

Before first deployment, run migrations:

```bash
# Install Neon CLI
npm i -g neonctl

# Or use Drizzle Kit directly
npx drizzle-kit push:pg

# This will create all tables in Neon
```

---

## 🔗 Frontend Integration

### Update Frontend API Client

**`src/lib/api.ts`:**

```typescript
import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to all requests
apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const api = {
  // Users
  users: {
    getProfile: () => apiClient.get('/users/me/profile'),
    updateProfile: (data: any) => apiClient.put('/users/me/profile', data),
    deleteAccount: () => apiClient.delete('/users/me'),
  },

  // Meals
  meals: {
    create: (data: any) => apiClient.post('/meals', data),
    getByDate: (date: string) => apiClient.get('/meals', { params: { date } }),
    delete: (id: number) => apiClient.delete(`/meals/${id}`),
    getDailyStats: (date: string) => apiClient.get('/meals/stats/daily', { params: { date } }),
  },

  // Streaks
  streaks: {
    getAll: () => apiClient.get('/streaks'),
    checkIn: (type: string) => apiClient.post('/streaks/checkin', { type }),
  },

  // Journal
  journal: {
    create: (data: any) => apiClient.post('/journal', data),
    getByDate: (date: string) => apiClient.get('/journal', { params: { date } }),
  },

  // Water
  water: {
    log: (glasses: number, date: string) => apiClient.post('/water', { glasses, date }),
    getByDate: (date: string) => apiClient.get('/water', { params: { date } }),
  },

  // Buddies
  buddies: {
    findUsers: (query: string) => apiClient.get('/buddies/search', { params: { query } }),
    sendRequest: (userId: string) => apiClient.post('/buddies/request', { userId }),
    acceptRequest: (pairId: number) => apiClient.put(`/buddies/${pairId}/accept`),
    getMyBuddies: () => apiClient.get('/buddies/mine'),
  },

  // Achievements
  achievements: {
    getAll: () => apiClient.get('/achievements'),
    getMine: () => apiClient.get('/achievements/mine'),
  },

  // Reports
  reports: {
    getWeekly: (weekStart: string) => apiClient.get('/reports/weekly', { params: { weekStart } }),
    getMonthly: (month: string) => apiClient.get('/reports/monthly', { params: { month } }),
  },

  // Photos
  photos: {
    upload: (formData: FormData) => apiClient.post('/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getMine: () => apiClient.get('/photos/mine'),
    delete: (id: number) => apiClient.delete(`/photos/${id}`),
  },
};
```

**Update `.env` in frontend:**

```env
VITE_API_URL=https://fittrack-backend-xxxxx.ondigitalocean.app/api
```

---

## 💰 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **DigitalOcean App Platform** | Basic (512MB) | **$5/month** |
| **Neon PostgreSQL** | Free tier | **$0** (512MB storage) |
| **Firebase Auth** | Free tier | **$0** (50K MAU) |
| **Cloudinary** | Free tier | **$0** (25GB) |
| **Resend** | Free tier | **$0** (3K emails/month) |
| **Vercel** (Frontend) | Hobby | **$0** |
| **Total** | | **$5/month** 🎉 |

**Scaling:**
- 1K users: $5/month (stays on free tiers)
- 5K users: $12/month (DO Pro + Neon Scale)
- 10K users: $29/month (DO Pro + paid services)

---

## 🧪 Testing the Backend

```bash
# Start development server
pnpm run start:dev

# Test endpoints
curl http://localhost:3000/api/health

# Test with auth (get token from Firebase)
curl -H "Authorization: Bearer <firebase-token>" \
  http://localhost:3000/api/users/me
```

---

## 📋 Migration Checklist

- [ ] Create NestJS project
- [ ] Set up Neon PostgreSQL database
- [ ] Configure Firebase Admin SDK
- [ ] Create database schema with Drizzle
- [ ] Run migrations
- [ ] Implement all modules (users, meals, streaks, etc.)
- [ ] Set up cron jobs
- [ ] Test locally
- [ ] Push to GitHub
- [ ] Deploy to DigitalOcean App Platform
- [ ] Update frontend API_URL
- [ ] Test production endpoints
- [ ] Set up monitoring (optional: Sentry)

---

## 🚦 Next Steps

1. **Create the backend repo:**
   ```bash
   nest new fittrack-backend
   cd fittrack-backend
   pnpm add @nestjs/config @nestjs/schedule drizzle-orm @neondatabase/serverless firebase-admin
   ```

2. **Copy schema files** from roadmap into `src/database/schema/`

3. **Implement modules** one by one (users → meals → streaks → etc.)

4. **Test locally** with frontend

5. **Deploy to DigitalOcean**

6. **Update frontend** to use production API URL

---

**Last Updated:** November 24, 2025  
**Tech Stack:** NestJS + Neon PostgreSQL + DigitalOcean  
**Monthly Cost:** $5 (up to 1K users)
