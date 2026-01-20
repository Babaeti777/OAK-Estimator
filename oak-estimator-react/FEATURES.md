# OAK Estimator - Features & Usage Guide

## 🎉 What's Been Built

### ✅ Completed Features

#### 1. **Authentication System**
- Beautiful login screen with Google Sign-In
- Loading states with animations
- User profile dropdown in header
- Secure Firebase authentication
- Real-time auth state management

#### 2. **Project Management**
- Create multiple projects
- Switch between projects
- Project metadata (name, number, location, etc.)
- Company information settings
- Auto-save to Firestore

#### 3. **Company Settings Form**
- Company name
- Address
- Phone number
- Email
- Real-time validation
- Auto-save on blur

#### 4. **Project Settings Form**
- Project name (required)
- Project number
- Location
- Architect
- Estimator name
- Date picker
- Form validation

#### 5. **Line Items Table**
- Add/delete line items
- Inline editing (all fields)
- Division selection (CSI MasterFormat)
- Item type selection:
  - 📦 Material
  - 👷 Labor
  - 🚜 Equipment
  - 🤝 Subcontractor
  - 📋 Miscellaneous
- Quantity & Unit Cost inputs
- **Automatic total calculation** (Qty × Unit Cost)
- Search/filter functionality
- Animated row additions/deletions
- Delete confirmation
- Responsive table design

#### 6. **Cost Summary Card**
- **Real-time calculations** that update as you edit
- Cost breakdown by type:
  - Materials total
  - Labor total
  - Equipment total
  - Subcontractor total
  - Miscellaneous total
- Subtotal
- Markup (15% by default)
- Tax (7% by default)
- **Grand Total**
- Average cost per item
- Total item count
- Sticky sidebar on desktop
- Beautiful card design with icons

#### 7. **Material Browser**
- Modal dialog interface
- Search materials by name/category
- Filter by CSI division
- View unit costs
- One-click add to project
- Sample materials included
- Ready for full database integration

#### 8. **Modern UI**
- Dark theme
- Smooth animations (Framer Motion)
- Responsive design
- Toast notifications
- Loading states
- Error handling
- Accessibility features

---

## 🚀 How to Run

```bash
cd oak-estimator-react
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📖 User Guide

### Getting Started

1. **Sign In**
   - Click "Sign in with Google"
   - Authorize the application
   - You'll be redirected to the main app

2. **Create Your First Project**
   - Click "Create Your First Project"
   - The app will create a default project
   - You'll see the main estimator interface

### Setting Up Your Project

3. **Enter Company Information**
   - Fill in your company name
   - Add address, phone, email
   - Changes save automatically

4. **Enter Project Details**
   - Set project name (required)
   - Add project number
   - Fill in location, architect, estimator
   - Set project date

### Working with Line Items

5. **Add Line Items Manually**
   - Click "Add Item" button
   - Edit the description
   - Select division (e.g., "03 - Concrete")
   - Choose type (Material, Labor, etc.)
   - Enter quantity
   - Set unit (EA, SF, CY, etc.)
   - Enter unit cost
   - **Total calculates automatically!**

6. **Browse Materials Database**
   - Click "Browse Materials"
   - Search for materials
   - Filter by division
   - Click "Add" to add to project
   - Quantity defaults to 1 (edit as needed)

7. **Edit Line Items**
   - Click directly in any field to edit
   - Changes save automatically
   - Totals recalculate in real-time
   - Delete unwanted items with trash icon

### Viewing Costs

8. **Cost Summary**
   - Right sidebar shows live totals
   - Breakdown by cost type
   - Markup and tax calculations
   - Grand total prominently displayed

---

## 🎨 UI Highlights

### Design Features
- **Dark Theme** - Professional, easy on the eyes
- **Smooth Animations** - Framer Motion for delightful UX
- **Glass Morphism** - Modern frosted glass effects
- **Responsive** - Works on desktop, tablet, mobile
- **Accessibility** - Keyboard navigation, ARIA labels

### Color Scheme
- Background: Deep blue-gray (#0a0e27)
- Primary: Light blue-white (#f1f5f9)
- Accent: Slate blue (#2d3748)
- Success: Green (#22c55e)
- Destructive: Red (#991b1b)

### Typography
- Clean, modern sans-serif fonts
- Clear hierarchy
- Readable at all sizes

---

## 🔧 Technical Stack

```
React 18          - Modern UI library
TypeScript        - Type safety
Vite             - Fast build tool
Tailwind CSS     - Utility-first styling
Framer Motion    - Smooth animations
Firebase         - Auth & database
Radix UI         - Accessible components
React Hook Form  - Form validation
Lucide React     - Beautiful icons
```

---

## 📊 Database Schema

### Project Structure
```typescript
Project {
  id: string
  userId: string
  companySettings: {
    companyName: string
    address: string
    phone: string
    email: string
  }
  projectSettings: {
    projectName: string
    projectNumber: string
    location: string
    architect: string
    estimator: string
    date: string
  }
  lineItems: LineItem[]
  createdAt: number
  updatedAt: number
}
```

### Line Item Structure
```typescript
LineItem {
  id: string
  division: string          // "01" to "10"
  description: string       // Item description
  type: string             // material | labor | equipment | subcontractor | misc
  quantity: number         // How many
  unit: string            // EA, SF, CY, etc.
  unitCost: number        // Cost per unit
  totalCost: number       // quantity × unitCost
  notes?: string
  materialId?: string
  order: number
  createdAt: number
  updatedAt: number
}
```

---

## 🎯 What's Next?

### Coming Soon
- ⏳ Calculator component (basic & engineering modes)
- ⏳ PDF export functionality
- ⏳ Drag & drop line item reordering
- ⏳ Full materials database (2,953 items)
- ⏳ Virtual scrolling for large datasets
- ⏳ AI Gap Analysis
- ⏳ Multi-user collaboration
- ⏳ Project templates
- ⏳ Excel import/export

---

## 💡 Tips & Tricks

1. **Quick Add**: Use "Browse Materials" for pre-priced items
2. **Bulk Edit**: Edit quantities after adding materials
3. **Real-time**: All changes save automatically to Firebase
4. **Search**: Use the search bar to filter line items quickly
5. **Mobile**: Works great on tablets for field estimates

---

## 🐛 Known Limitations

1. **Material Database**: Currently shows mock data (4 items)
   - Full database integration coming soon
   - Easy to connect to existing materials-database.js

2. **Offline Mode**: Requires internet connection
   - Firebase offline persistence enabled
   - Some features may not work offline

3. **Export**: PDF export not yet implemented
   - Coming in next update

---

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify Firebase credentials are correct
- Ensure you're signed in with Google
- Clear browser cache if experiencing issues

---

## 🎓 For Developers

### Project Structure
```
src/
├── components/
│   ├── auth/              Login, Loading
│   ├── layout/            Header, Sidebar
│   ├── projects/          Forms, Summary
│   ├── line-items/        Table
│   ├── materials/         Browser
│   └── ui/                Reusable components
├── contexts/              State management
├── hooks/                 Custom hooks
├── services/              Firebase integration
├── types/                 TypeScript types
└── lib/                   Utilities
```

### Key Files
- `App.tsx` - Main app component
- `EstimatorApp.tsx` - Main estimator interface
- `ProjectContext.tsx` - Project state management
- `AuthContext.tsx` - Authentication state
- `firestore.service.ts` - Database operations

### Building
```bash
npm run build      # Production build
npm run preview    # Preview production build
npm run dev        # Development server
```

---

Built with ❤️ using modern React best practices
