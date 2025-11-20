# TinyLink - URL Shortener

A modern, feature-rich URL shortener built with Next.js, similar to bit.ly. Shorten URLs, generate QR codes, track analytics, and manage your links with an intuitive interface.

## Features

### Core Features
- **URL Shortening** - Convert long URLs into short, shareable links
- **Custom Short Codes** - Create personalized short codes (6-8 alphanumeric characters)
- **Click Tracking** - Monitor total clicks and last clicked timestamp for each link
- **HTTP 302 Redirects** - Fast, standard redirects to original URLs
- **Link Management** - Create, edit, and delete links with ease

### Bonus Features
- **QR Code Generation** - Automatic QR code creation for all short links
- **Advanced Analytics** - Detailed statistics and engagement tracking
- **Search & Filter** - Find links by URL, code, or creation date
- **Pagination** - Navigate through links efficiently (3 items per page)
- **Real-time Updates** - Live preview when editing links/QR codes
- **Copy to Clipboard** - One-click copying of short URLs
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Neon)
- **ORM**: Prisma
- **UI Components**: Lucide Icons, React Hot Toast
- **QR Codes**: qrcode library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend [Neon](https://neon.tech) for free hosting)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aganitha_test_tinyLink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your actual values:
   ```env
   NEON_DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Set up the database**

   Run Prisma migrations to create database tables:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
aganitha_test_tinyLink/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── links/            # Link endpoints
│   │   │   └── qr-codes/         # QR code endpoints
│   │   ├── [code]/               # Dynamic redirect route
│   │   ├── analytics/            # Analytics dashboard
│   │   │   └── [code]/           # Stats page for individual links
│   │   ├── links/                # Links management page
│   │   ├── qr-codes/             # QR codes page
│   │   ├── healthz/              # Health check endpoint
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Dashboard (home page)
│   │
│   ├── components/               # React components
│   │   ├── link-form.tsx         # Form for creating links/QR codes
│   │   ├── links-table.tsx       # Table displaying links
│   │   ├── qr-codes-table.tsx    # Table displaying QR codes
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   └── header.tsx            # Top header
│   │
│   ├── services/                 # Business logic
│   │   ├── linkService.ts        # Link CRUD operations
│   │   ├── qrCodeService.ts      # QR code operations
│   │   └── codeGenerator.ts      # Random code generation
│   │
│   ├── validators/               # Input validation
│   │   ├── urlValidator.ts       # URL validation
│   │   └── codeValidator.ts      # Short code validation
│   │
│   └── lib/                      # Utilities
│       └── prisma.ts             # Prisma client singleton
│
├── prisma/
│   └── schema.prisma             # Database schema
│
└── public/                       # Static assets
```

## API Endpoints

### Links

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/api/links` | Create a new short link | 201, 409 (duplicate), 400 (invalid) |
| `GET` | `/api/links` | List all links | 200 |
| `GET` | `/api/links/:code` | Get stats for a specific link | 200, 404 |
| `PUT` | `/api/links/:code` | Update a link | 200, 404 |
| `DELETE` | `/api/links/:code` | Delete a link | 200, 404 |

### QR Codes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/qr-codes` | Create a QR code |
| `GET` | `/api/qr-codes` | List all QR codes |
| `GET` | `/api/qr-codes/:code` | Get a specific QR code |
| `PUT` | `/api/qr-codes/:code` | Update a QR code |
| `DELETE` | `/api/qr-codes/:code` | Delete a QR code |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthz` | Health check endpoint |
| `GET` | `/:code` | Redirect to original URL (HTTP 302) |

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard - Create and manage links |
| `/links` | Links management page |
| `/qr-codes` | QR codes page |
| `/analytics` | Analytics overview |
| `/analytics/:code` | Stats page for individual link/QR code |

## Database Schema

### Link Model
```prisma
model Link {
  id          String       @id @default(cuid())
  code        String       @unique @db.VarChar(8)
  url         String
  clicks      Int          @default(0)
  lastClicked DateTime?
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  clickEvents LinkClick[]

  @@index([code])
}
```

### QRCode Model
```prisma
model QRCode {
  id          String      @id @default(cuid())
  code        String      @unique @db.VarChar(8)
  url         String
  scans       Int         @default(0)
  lastScanned DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  scanEvents  QRScan[]

  @@index([code])
}
```

### LinkClick Model (Advanced Analytics)
```prisma
model LinkClick {
  id          String   @id @default(cuid())
  linkCode    String
  link        Link     @relation(fields: [linkCode], references: [code], onDelete: Cascade)
  ipAddress   String?
  userAgent   String?
  referer     String?
  country     String?
  city        String?
  clickedAt   DateTime @default(now())

  @@index([linkCode])
  @@index([clickedAt])
}
```

### QRScan Model (Advanced Analytics)
```prisma
model QRScan {
  id          String   @id @default(cuid())
  qrCode      String
  qr          QRCode   @relation(fields: [qrCode], references: [code], onDelete: Cascade)
  ipAddress   String?
  userAgent   String?
  referer     String?
  country     String?
  city        String?
  scannedAt   DateTime @default(now())

  @@index([qrCode])
  @@index([scannedAt])
}
```

## Validation Rules

### URL Validation
- Must be a valid URL format
- Must include protocol (http/https)
- Validated before saving to database

### Short Code Validation
- **Format**: `[A-Za-z0-9]{6,8}` (regex pattern)
- **Length**: 6-8 characters
- **Characters**: Only letters (a-z, A-Z) and digits (0-9)
- **Uniqueness**: Globally unique across all users
- **Auto-generation**: If not provided, generates random code

## Deployment

### Deploy to Vercel

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEON_DATABASE_URL`
     - `NEXT_PUBLIC_BASE_URL`
   - Deploy!

3. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Database Setup (Neon)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to `.env` as `NEON_DATABASE_URL`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database URL from Neon or your PostgreSQL provider
NEON_DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"

# Base URL of your application
# Local: http://localhost:3000
# Production: https://your-app.vercel.app
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Scripts

```bash
# Development
npm run dev          # Start development server

# Build
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (database GUI)

# Linting
npm run lint         # Run ESLint
```

## Features in Detail

### Link Creation
- Enter any long URL
- Optionally provide a custom short code (6-8 alphanumeric)
- System auto-generates code if not provided
- Validates URL format and code uniqueness
- Shows success/error notifications

### QR Code Generation
- Automatically generates QR code for every link
- Download QR code as PNG image
- Live preview when editing
- Track scans separately from clicks

### Analytics
- Total engagements (clicks + scans)
- Top performing links and QR codes
- Engagement distribution charts
- Per-link/QR detailed statistics
- Date filtering and search

### Click Tracking
- Increments on every redirect
- Updates "last clicked" timestamp
- Stores individual click events for advanced analytics
- Real-time updates

## Requirements Met

This project meets all requirements from the Take-Home Assignment:

✅ Next.js framework with Tailwind CSS
✅ URL shortening with optional custom codes
✅ HTTP 302 redirects
✅ Click tracking and analytics
✅ Delete functionality (returns 404 after deletion)
✅ Dashboard with table of all links
✅ Stats page for individual links
✅ Health check endpoint (`/healthz`)
✅ Clean, responsive UI with proper states
✅ Form validation and error handling
✅ Search/filter functionality
✅ Code format: `[A-Za-z0-9]{6,8}`
✅ Proper HTTP status codes (201, 409, 404, etc.)

**Bonus Features:**
- QR code generation and management
- Advanced analytics dashboard
- Edit functionality for links and QR codes
- Pagination and date filtering
- Enhanced UI/UX with loading states

## API Response Examples

### Create Link
**Request:**
```json
POST /api/links
{
  "url": "https://example.com/very-long-url",
  "code": "abc123"  // optional
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "code": "abc123",
  "url": "https://example.com/very-long-url",
  "clicks": 0,
  "lastClicked": null,
  "createdAt": "2025-01-19T10:00:00Z"
}
```

### Health Check
**Request:**
```
GET /healthz
```

**Response (200):**
```json
{
  "ok": true,
  "version": "1.0"
}
```

## License

This project was created as a take-home assignment.


---

**Live Demo**: https://tiny-link-kappa.vercel.app/
**GitHub**: https://github.com/sasidhar2459/tinyLink.git
