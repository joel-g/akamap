# 🗺️ Akamap

Interactive Global Map of Akamai Linode Cloud Regions

## Features

- **Interactive World Map** using Leaflet and OpenStreetMap
- **Real-time Region Data** from Linode API with local fallbacks
- **Dynamic Geocoding** for new regions using Nominatim
- **Region Details Sidebar** with comprehensive information
- **Availability Checker** for different Linode plans
- **Responsive Design** optimized for desktop and mobile
- **Smart Caching** to minimize API calls

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd akamap
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🛠️ How It Works

### Data Sources
- **Primary**: Live Linode API (`https://api.linode.com/v4/regions`)
- **Fallback**: Local JSON files for offline development
- **Geocoding**: Nominatim (OpenStreetMap) for coordinates

### Smart Geocoding
1. **Bundled coordinates** - Pre-geocoded locations in `coordinates.json`
2. **Runtime geocoding** - New regions geocoded automatically via Nominatim
3. **Local caching** - Geocoded locations cached in localStorage
4. **Visual indicators** - New regions marked with "NEW" badges

### Architecture
```
src/
├── components/          # React components
│   ├── RegionMarker.js  # Map markers
│   ├── Sidebar.js       # Region details panel  
│   ├── LoadingSpinner.js
│   └── GeocodingSummary.js
├── hooks/               # Custom React hooks
│   └── useRegionGeocoding.js
├── services/            # API services
│   └── linodeApi.js     # Linode API calls
├── utils/               # Utilities
│   └── geocoding.js     # Geocoding logic
└── data/                # Local data files
    ├── coordinates.json # Pre-geocoded coordinates
    ├── list-regions.json # Sample regions data
    └── get-availability.json # Sample availability data
```

## 🎯 Usage

1. **Explore the Map**: Pan and zoom to see different regions
2. **Hover for Quick Info**: See basic region details on hover
3. **Click for Details**: Open full sidebar with region information
4. **Check Availability**: Click "Get Availability" to see plan availability
5. **New Regions**: Automatically detected and marked with "NEW" badges

## 🔧 Configuration

### Adding New Coordinates
Run the geocoding script to update coordinates for new regions:
```bash
./geocode-regions.sh
```

### API Endpoints
- Regions: `GET https://api.linode.com/v4/regions`
- Availability: `GET https://api.linode.com/v4/regions/{regionId}/availability`
- Geocoding: `GET https://nominatim.openstreetmap.org/search`

## 📱 Responsive Design
- **Desktop**: Full sidebar and map view
- **Tablet**: Collapsible sidebar
- **Mobile**: Full-screen sidebar overlay

## 🎨 Customization

### Map Styling
Modify `App.css` to change map themes, colors, and animations.

### Marker Styling
Update `.custom-marker` classes for different marker appearances.

### Region Categories
Modify `getCategoryForCapability()` in `Sidebar.js` to customize capability groupings.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The build creates a static site that can be deployed to:
- Netlify
- Vercel  
- GitHub Pages
- AWS S3
- Any static file server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Leaflet** - Interactive maps
- **OpenStreetMap** - Map tiles and geocoding
- **Linode** - API data
- **React** - UI framework
