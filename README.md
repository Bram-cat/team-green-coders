# Solar Panel Advisor

A Next.js web application that helps homeowners assess their roof's solar panel installation potential. Upload a photo of your roof and enter your address to receive personalized solar recommendations.

## Features

- **Image Upload**: Drag-and-drop or click to upload roof photos (JPEG/PNG)
- **Address Input**: Enter your property address for location-based analysis
- **Suitability Score**: Get a 0-100 score indicating solar installation potential
- **System Sizing**: Recommended system size (kW) and panel count
- **Production Estimates**: Estimated annual energy production (kWh)
- **Personalized Recommendations**: Actionable suggestions for optimizing your solar installation

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **File Upload**: react-dropzone

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Bram-cat/team-green-coders.git
   cd team-green-coders
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys (optional for MVP - mock data is used by default)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/analyze/      # API route for roof analysis
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   └── results/          # Results display components
├── lib/
│   ├── analysis/         # Analysis stub functions
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## API Integration (Future)

The app currently uses mock data for demonstration. To integrate real APIs:

1. **Geocoding**: Update `src/lib/analysis/solarPotential.ts` with your preferred geocoding API
2. **Solar Data**: Integrate NREL PVWatts or similar solar irradiance API
3. **Image Analysis**: Connect to ML model for actual roof analysis

See the TODO comments in the analysis files for integration points.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is for demonstration purposes.

## Team

Team Green Coders
