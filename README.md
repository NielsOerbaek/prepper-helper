# Prepper Helper / Prepperhjælper

A Progressive Web App (PWA) for tracking emergency food supplies and inventory with AI-powered item recognition.

## Features

- **AI-Powered Scanning**: Take photos of items and let AI automatically extract name, category, and expiration date
- **Two-Step Capture**: Snap the front of the item and the expiration date separately for better accuracy
- **Inventory Management**: Track quantities, categories, and expiration dates
- **Expiration Tracking**: Visual indicators for items expiring soon or already expired
- **Emergency Checklist**: Pre-built checklist to ensure you have essential supplies
- **Multi-language Support**: Available in English and Danish
- **PWA**: Install on mobile devices for offline access
- **Neo-Brutalist Design**: Bold, modern UI with sharp edges and strong contrasts

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Neo-Brutalism theme
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: MinIO (S3-compatible object storage)
- **AI**: Anthropic Claude API for image analysis
- **Auth**: NextAuth.js with Promise provider

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Anthropic API key

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/foodtracker

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false

# Anthropic AI
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/prepper-helper.git
cd prepper-helper
```

2. Install dependencies:
```bash
npm install
```

3. Start the database and MinIO:
```bash
docker-compose up -d db minio
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Adding Items

1. Click "Tilføj vare" (Add item) to open the camera
2. Take a photo of the front of the item
3. Take a photo of the expiration date (optional)
4. Review and adjust the AI-detected information
5. Adjust quantity and save

### Managing Inventory

- View all items in the Inventory page
- Edit items by clicking the edit button
- Delete items with the delete button
- Filter by category or search by name

### Expiration Tracking

The "Udløber snart" (Expiring Soon) page shows:
- Expired items (gray)
- Items expiring within 3 days (red)
- Items expiring within 7 days (yellow)
- Items with more time (green)

### Emergency Checklist

Track your emergency preparedness with the built-in checklist organized by category.

## Development

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard layout pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── items/            # Item-related components
│   ├── layout/           # Layout components
│   ├── photos/           # Camera and photo components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── minio.ts          # MinIO client
│   ├── prisma.ts         # Prisma client
│   └── translations.ts   # i18n translations
└── types/                 # TypeScript types
```

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
npm start
```

## Deployment

The app can be deployed using Docker:

```bash
docker-compose up -d
```

Or deploy to any platform that supports Next.js (Vercel, Railway, etc.).

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
