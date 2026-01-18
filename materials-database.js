// RS Means-Style Material Database
// Comprehensive construction materials, labor, and equipment database
// Organized by CSI MasterFormat divisions

const MaterialsDatabase = {
  version: "2.0.0",
  lastUpdated: "2026-01-18",
  currency: "USD",

  // Division 01 - General Requirements
  "01": {
    name: "General Requirements",
    items: [
      {
        id: "01-001",
        code: "01-11-13.50",
        description: "Project Manager - Senior",
        unit: "hr",
        material: 0,
        labor: 125.00,
        equipment: 0,
        category: "Project Staff",
        subcategory: "Management",
        notes: "Experienced PM with 10+ years"
      },
      {
        id: "01-002",
        code: "01-11-13.51",
        description: "Project Manager - Junior",
        unit: "hr",
        material: 0,
        labor: 85.00,
        equipment: 0,
        category: "Project Staff",
        subcategory: "Management"
      },
      {
        id: "01-003",
        code: "01-11-13.52",
        description: "Project Engineer",
        unit: "hr",
        material: 0,
        labor: 95.00,
        equipment: 0,
        category: "Project Staff",
        subcategory: "Engineering"
      },
      {
        id: "01-004",
        code: "01-11-13.53",
        description: "Superintendent",
        unit: "hr",
        material: 0,
        labor: 105.00,
        equipment: 0,
        category: "Project Staff",
        subcategory: "Management"
      },
      {
        id: "01-005",
        code: "01-21-16.13",
        description: "Construction Surveying",
        unit: "day",
        material: 150,
        labor: 850,
        equipment: 200,
        category: "Survey",
        subcategory: "Layout"
      },
      {
        id: "01-006",
        code: "01-31-13.20",
        description: "Project Schedule - CPM",
        unit: "ls",
        material: 0,
        labor: 2500,
        equipment: 0,
        category: "Scheduling",
        subcategory: "Planning"
      },
      {
        id: "01-007",
        code: "01-41-26.13",
        description: "Temporary Power Distribution",
        unit: "month",
        material: 450,
        labor: 350,
        equipment: 0,
        category: "Temporary Facilities",
        subcategory: "Utilities"
      },
      {
        id: "01-008",
        code: "01-41-26.14",
        description: "Temporary Water Service",
        unit: "month",
        material: 275,
        labor: 225,
        equipment: 0,
        category: "Temporary Facilities",
        subcategory: "Utilities"
      },
      {
        id: "01-009",
        code: "01-52-13.10",
        description: "Construction Fence - 6' Chain Link",
        unit: "lf",
        material: 12.50,
        labor: 8.75,
        equipment: 1.25,
        category: "Temporary Barriers",
        subcategory: "Fencing"
      },
      {
        id: "01-010",
        code: "01-54-23.10",
        description: "Portable Toilet Unit",
        unit: "month",
        material: 185,
        labor: 0,
        equipment: 0,
        category: "Temporary Facilities",
        subcategory: "Sanitary"
      },
      {
        id: "01-011",
        code: "01-41-26.16",
        description: "Temporary Lighting - String Lights",
        unit: "month",
        material: 125,
        labor: 85,
        equipment: 0,
        category: "Temporary Facilities",
        subcategory: "Lighting"
      },
      {
        id: "01-012",
        code: "01-52-13.20",
        description: "Construction Fence - 8' Wood Privacy",
        unit: "lf",
        material: 18.50,
        labor: 12.25,
        equipment: 1.50,
        category: "Temporary Barriers",
        subcategory: "Fencing"
      },
      {
        id: "01-013",
        code: "01-56-13.10",
        description: "Temporary Stairs - Metal",
        unit: "flight",
        material: 450,
        labor: 285,
        equipment: 45,
        category: "Temporary Facilities",
        subcategory: "Access"
      },
      {
        id: "01-014",
        code: "01-56-26.10",
        description: "Temporary Scaffolding - Frame Type",
        unit: "csf",
        material: 185,
        labor: 125,
        equipment: 25,
        category: "Temporary Facilities",
        subcategory: "Scaffolding"
      },
      {
        id: "01-015",
        code: "01-74-19.10",
        description: "Waste Disposal - Dumpster 30 CY",
        unit: "month",
        material: 425,
        labor: 0,
        equipment: 0,
        category: "Waste Management",
        subcategory: "Disposal"
      }
    ]
  },

  // Division 02 - Existing Conditions
  "02": {
    name: "Existing Conditions",
    items: [
      {
        id: "02-001",
        code: "02-21-13.15",
        description: "Building Demolition - Wood Frame",
        unit: "sqft",
        material: 0,
        labor: 3.85,
        equipment: 2.15,
        category: "Demolition",
        subcategory: "Structures"
      },
      {
        id: "02-002",
        code: "02-21-13.16",
        description: "Building Demolition - Concrete",
        unit: "sqft",
        material: 0,
        labor: 5.25,
        equipment: 3.75,
        category: "Demolition",
        subcategory: "Structures"
      },
      {
        id: "02-003",
        code: "02-41-13.15",
        description: "Tree Removal - 12\" Diameter",
        unit: "ea",
        material: 0,
        labor: 285,
        equipment: 165,
        category: "Site Clearing",
        subcategory: "Trees"
      },
      {
        id: "02-004",
        code: "02-41-13.16",
        description: "Tree Removal - 24\" Diameter",
        unit: "ea",
        material: 0,
        labor: 625,
        equipment: 425,
        category: "Site Clearing",
        subcategory: "Trees"
      },
      {
        id: "02-005",
        code: "02-41-13.23",
        description: "Brush Clearing - Light",
        unit: "acre",
        material: 0,
        labor: 1250,
        equipment: 850,
        category: "Site Clearing",
        subcategory: "Vegetation"
      },
      {
        id: "02-006",
        code: "02-41-13.24",
        description: "Brush Clearing - Heavy",
        unit: "acre",
        material: 0,
        labor: 2850,
        equipment: 1950,
        category: "Site Clearing",
        subcategory: "Vegetation"
      },
      {
        id: "02-007",
        code: "02-41-16.13",
        description: "Topsoil Stripping - 6\" Deep",
        unit: "cy",
        material: 0,
        labor: 2.85,
        equipment: 4.25,
        category: "Site Clearing",
        subcategory: "Earthwork"
      },
      {
        id: "02-008",
        code: "02-32-13.10",
        description: "Asphalt Pavement Removal",
        unit: "sqft",
        material: 0,
        labor: 1.25,
        equipment: 1.85,
        category: "Demolition",
        subcategory: "Paving"
      },
      {
        id: "02-009",
        code: "02-32-13.20",
        description: "Concrete Pavement Removal - 4\"",
        unit: "sqft",
        material: 0,
        labor: 2.15,
        equipment: 2.95,
        category: "Demolition",
        subcategory: "Paving"
      },
      {
        id: "02-010",
        code: "02-41-19.19",
        description: "Selective Grubbing",
        unit: "acre",
        material: 0,
        labor: 1850,
        equipment: 1250,
        category: "Site Clearing",
        subcategory: "Vegetation"
      },
      {
        id: "02-011",
        code: "02-41-13.17",
        description: "Tree Removal - 36\" Diameter",
        unit: "ea",
        material: 0,
        labor: 1250,
        equipment: 850,
        category: "Site Clearing",
        subcategory: "Trees"
      },
      {
        id: "02-012",
        code: "02-41-13.27",
        description: "Stump Removal - 24\" Diameter",
        unit: "ea",
        material: 0,
        labor: 325,
        equipment: 275,
        category: "Site Clearing",
        subcategory: "Trees"
      },
      {
        id: "02-013",
        code: "02-32-13.30",
        description: "Concrete Pavement Removal - 6\"",
        unit: "sqft",
        material: 0,
        labor: 2.85,
        equipment: 3.75,
        category: "Demolition",
        subcategory: "Paving"
      },
      {
        id: "02-014",
        code: "02-41-13.33",
        description: "Hydroseeding",
        unit: "acre",
        material: 1850,
        labor: 425,
        equipment: 325,
        category: "Site Clearing",
        subcategory: "Erosion Control"
      },
      {
        id: "02-015",
        code: "02-21-13.25",
        description: "Interior Demolition - Selective",
        unit: "sqft",
        material: 0,
        labor: 2.25,
        equipment: 0.85,
        category: "Demolition",
        subcategory: "Interior"
      }
    ]
  },

  // Division 03 - Concrete
  "03": {
    name: "Concrete",
    items: [
      {
        id: "03-001",
        code: "03-11-13.25",
        description: "Formwork - Wall, Job-Built Plywood",
        unit: "sqft",
        material: 3.85,
        labor: 8.25,
        equipment: 0.45,
        category: "Formwork",
        subcategory: "Walls"
      },
      {
        id: "03-002",
        code: "03-11-13.26",
        description: "Formwork - Slab on Grade Edge",
        unit: "lf",
        material: 2.15,
        labor: 4.75,
        equipment: 0.25,
        category: "Formwork",
        subcategory: "Slabs"
      },
      {
        id: "03-003",
        code: "03-11-13.65",
        description: "Formwork - Column, Square",
        unit: "sqft",
        material: 4.25,
        labor: 9.50,
        equipment: 0.50,
        category: "Formwork",
        subcategory: "Columns"
      },
      {
        id: "03-004",
        code: "03-11-13.85",
        description: "Formwork - Beam, Rectangular",
        unit: "sqft",
        material: 3.95,
        labor: 8.85,
        equipment: 0.45,
        category: "Formwork",
        subcategory: "Beams"
      },
      {
        id: "03-005",
        code: "03-15-05.10",
        description: "Rebar - #3 Bar (3/8\")",
        unit: "lb",
        material: 0.75,
        labor: 0.95,
        equipment: 0.05,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-006",
        code: "03-15-05.20",
        description: "Rebar - #4 Bar (1/2\")",
        unit: "lb",
        material: 0.72,
        labor: 0.88,
        equipment: 0.05,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-007",
        code: "03-15-05.30",
        description: "Rebar - #5 Bar (5/8\")",
        unit: "lb",
        material: 0.70,
        labor: 0.82,
        equipment: 0.05,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-008",
        code: "03-15-05.40",
        description: "Rebar - #6 Bar (3/4\")",
        unit: "lb",
        material: 0.68,
        labor: 0.78,
        equipment: 0.05,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-009",
        code: "03-15-05.70",
        description: "Rebar - #8 Bar (1\")",
        unit: "lb",
        material: 0.72,
        labor: 0.75,
        equipment: 0.06,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-010",
        code: "03-15-16.10",
        description: "Welded Wire Fabric - 6x6 W1.4xW1.4",
        unit: "sqft",
        material: 0.45,
        labor: 0.35,
        equipment: 0.02,
        category: "Reinforcing",
        subcategory: "WWF"
      },
      {
        id: "03-011",
        code: "03-30-53.40",
        description: "Concrete - 3000 PSI, Ready Mix",
        unit: "cy",
        material: 125,
        labor: 0,
        equipment: 0,
        category: "Concrete",
        subcategory: "Ready Mix"
      },
      {
        id: "03-012",
        code: "03-30-53.50",
        description: "Concrete - 4000 PSI, Ready Mix",
        unit: "cy",
        material: 135,
        labor: 0,
        equipment: 0,
        category: "Concrete",
        subcategory: "Ready Mix"
      },
      {
        id: "03-013",
        code: "03-30-53.60",
        description: "Concrete - 5000 PSI, Ready Mix",
        unit: "cy",
        material: 150,
        labor: 0,
        equipment: 0,
        category: "Concrete",
        subcategory: "Ready Mix"
      },
      {
        id: "03-014",
        code: "03-31-13.25",
        description: "Concrete Placement - Slab on Grade",
        unit: "cy",
        material: 0,
        labor: 45,
        equipment: 15,
        category: "Placement",
        subcategory: "Slabs"
      },
      {
        id: "03-015",
        code: "03-31-13.30",
        description: "Concrete Placement - Elevated Slab",
        unit: "cy",
        material: 0,
        labor: 65,
        equipment: 25,
        category: "Placement",
        subcategory: "Slabs"
      },
      {
        id: "03-016",
        code: "03-31-13.35",
        description: "Concrete Placement - Walls",
        unit: "cy",
        material: 0,
        labor: 75,
        equipment: 30,
        category: "Placement",
        subcategory: "Walls"
      },
      {
        id: "03-017",
        code: "03-31-13.45",
        description: "Concrete Placement - Columns",
        unit: "cy",
        material: 0,
        labor: 95,
        equipment: 35,
        category: "Placement",
        subcategory: "Columns"
      },
      {
        id: "03-018",
        code: "03-31-13.70",
        description: "Concrete Placement - Footings",
        unit: "cy",
        material: 0,
        labor: 55,
        equipment: 20,
        category: "Placement",
        subcategory: "Footings"
      },
      {
        id: "03-019",
        code: "03-35-13.10",
        description: "Concrete Finishing - Trowel Finish",
        unit: "sqft",
        material: 0,
        labor: 0.85,
        equipment: 0.15,
        category: "Finishing",
        subcategory: "Floors"
      },
      {
        id: "03-020",
        code: "03-35-13.30",
        description: "Concrete Finishing - Broom Finish",
        unit: "sqft",
        material: 0,
        labor: 0.65,
        equipment: 0.10,
        category: "Finishing",
        subcategory: "Floors"
      },
      {
        id: "03-021",
        code: "03-15-05.80",
        description: "Rebar - #10 Bar (1-1/4\")",
        unit: "lb",
        material: 0.74,
        labor: 0.72,
        equipment: 0.06,
        category: "Reinforcing",
        subcategory: "Rebar"
      },
      {
        id: "03-022",
        code: "03-30-53.70",
        description: "Concrete - 6000 PSI, Ready Mix",
        unit: "cy",
        material: 175,
        labor: 0,
        equipment: 0,
        category: "Concrete",
        subcategory: "Ready Mix"
      },
      {
        id: "03-023",
        code: "03-31-13.85",
        description: "Concrete Placement - Beams",
        unit: "cy",
        material: 0,
        labor: 85,
        equipment: 32,
        category: "Placement",
        subcategory: "Beams"
      },
      {
        id: "03-024",
        code: "03-15-19.10",
        description: "Post-Tensioning Tendons",
        unit: "lb",
        material: 2.85,
        labor: 1.95,
        equipment: 0.45,
        category: "Reinforcing",
        subcategory: "Post-Tension"
      },
      {
        id: "03-025",
        code: "03-39-13.10",
        description: "Concrete Curing Compound",
        unit: "sqft",
        material: 0.15,
        labor: 0.12,
        equipment: 0.02,
        category: "Finishing",
        subcategory: "Curing"
      },
      {
        id: "03-026",
        code: "03-41-13.10",
        description: "Precast Concrete Plank - 8\"",
        unit: "sqft",
        material: 12.50,
        labor: 4.85,
        equipment: 2.25,
        category: "Precast",
        subcategory: "Planks"
      },
      {
        id: "03-027",
        code: "03-47-13.10",
        description: "Tilt-Up Concrete Panel - 7\"",
        unit: "sqft",
        material: 8.95,
        labor: 6.50,
        equipment: 3.25,
        category: "Precast",
        subcategory: "Tilt-Up"
      }
    ]
  },

  // Division 04 - Masonry
  "04": {
    name: "Masonry",
    items: [
      {
        id: "04-001",
        code: "04-21-13.13",
        description: "Brick - Standard Red, Running Bond",
        unit: "sqft",
        material: 8.50,
        labor: 12.75,
        equipment: 0.85,
        category: "Unit Masonry",
        subcategory: "Brick"
      },
      {
        id: "04-002",
        code: "04-21-13.15",
        description: "Brick - Face Brick, Running Bond",
        unit: "sqft",
        material: 12.25,
        labor: 14.50,
        equipment: 0.95,
        category: "Unit Masonry",
        subcategory: "Brick"
      },
      {
        id: "04-003",
        code: "04-22-10.16",
        description: "CMU Block - 8\" Standard, Hollow",
        unit: "sqft",
        material: 4.25,
        labor: 7.85,
        equipment: 0.65,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-004",
        code: "04-22-10.19",
        description: "CMU Block - 8\" Reinforced, Grouted",
        unit: "sqft",
        material: 6.75,
        labor: 10.50,
        equipment: 1.25,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-005",
        code: "04-22-10.23",
        description: "CMU Block - 12\" Standard, Hollow",
        unit: "sqft",
        material: 5.85,
        labor: 8.95,
        equipment: 0.75,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-006",
        code: "04-05-19.16",
        description: "Masonry Mortar - Type N",
        unit: "cf",
        material: 12.50,
        labor: 0,
        equipment: 0,
        category: "Materials",
        subcategory: "Mortar"
      },
      {
        id: "04-007",
        code: "04-05-19.26",
        description: "Masonry Mortar - Type S",
        unit: "cf",
        material: 13.75,
        labor: 0,
        equipment: 0,
        category: "Materials",
        subcategory: "Mortar"
      },
      {
        id: "04-008",
        code: "04-05-23.13",
        description: "Grout - Fine, Pumped",
        unit: "cf",
        material: 15.25,
        labor: 8.50,
        equipment: 2.75,
        category: "Materials",
        subcategory: "Grout"
      },
      {
        id: "04-009",
        code: "04-22-10.45",
        description: "CMU Block - 8\" Decorative Split Face",
        unit: "sqft",
        material: 7.85,
        labor: 9.25,
        equipment: 0.75,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-010",
        code: "04-43-13.10",
        description: "Stone Veneer - Natural, Thin Set",
        unit: "sqft",
        material: 18.50,
        labor: 16.75,
        equipment: 1.25,
        category: "Stone",
        subcategory: "Veneer"
      },
      {
        id: "04-011",
        code: "04-21-13.17",
        description: "Brick - Glazed, Running Bond",
        unit: "sqft",
        material: 15.75,
        labor: 16.25,
        equipment: 1.05,
        category: "Unit Masonry",
        subcategory: "Brick"
      },
      {
        id: "04-012",
        code: "04-22-10.27",
        description: "CMU Block - 6\" Standard, Hollow",
        unit: "sqft",
        material: 3.75,
        labor: 7.25,
        equipment: 0.55,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-013",
        code: "04-22-10.33",
        description: "CMU Block - 10\" Standard, Hollow",
        unit: "sqft",
        material: 5.25,
        labor: 8.50,
        equipment: 0.70,
        category: "Unit Masonry",
        subcategory: "CMU"
      },
      {
        id: "04-014",
        code: "04-43-13.20",
        description: "Stone Veneer - Manufactured",
        unit: "sqft",
        material: 12.85,
        labor: 14.50,
        equipment: 1.05,
        category: "Stone",
        subcategory: "Veneer"
      },
      {
        id: "04-015",
        code: "04-21-29.10",
        description: "Glass Block - 8\"x8\"x4\"",
        unit: "sqft",
        material: 24.50,
        labor: 18.75,
        equipment: 1.45,
        category: "Glass Masonry",
        subcategory: "Block"
      }
    ]
  },

  // Division 05 - Metals
  "05": {
    name: "Metals",
    items: [
      {
        id: "05-001",
        code: "05-12-23.10",
        description: "Structural Steel - W8x31 Beam",
        unit: "lb",
        material: 1.85,
        labor: 1.25,
        equipment: 0.45,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-002",
        code: "05-12-23.15",
        description: "Structural Steel - W10x49 Beam",
        unit: "lb",
        material: 1.75,
        labor: 1.15,
        equipment: 0.42,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-003",
        code: "05-12-23.20",
        description: "Structural Steel - W12x65 Beam",
        unit: "lb",
        material: 1.70,
        labor: 1.10,
        equipment: 0.40,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-004",
        code: "05-12-23.30",
        description: "Structural Steel - W14x90 Beam",
        unit: "lb",
        material: 1.68,
        labor: 1.05,
        equipment: 0.38,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-005",
        code: "05-12-23.77",
        description: "Structural Steel - W24x162 Beam",
        unit: "lb",
        material: 1.62,
        labor: 0.95,
        equipment: 0.35,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-006",
        code: "05-21-13.10",
        description: "Steel Joist - 18K4, 40 PSF",
        unit: "lb",
        material: 1.45,
        labor: 0.85,
        equipment: 0.32,
        category: "Steel Joists",
        subcategory: "K-Series"
      },
      {
        id: "05-007",
        code: "05-21-13.25",
        description: "Steel Joist - 24K9, 40 PSF",
        unit: "lb",
        material: 1.42,
        labor: 0.82,
        equipment: 0.30,
        category: "Steel Joists",
        subcategory: "K-Series"
      },
      {
        id: "05-008",
        code: "05-31-13.10",
        description: "Metal Deck - 20 Gauge, Galvanized",
        unit: "sqft",
        material: 3.25,
        labor: 2.15,
        equipment: 0.35,
        category: "Metal Decking",
        subcategory: "Roof Deck"
      },
      {
        id: "05-009",
        code: "05-31-13.25",
        description: "Metal Deck - 18 Gauge, Galvanized",
        unit: "sqft",
        material: 3.85,
        labor: 2.25,
        equipment: 0.40,
        category: "Metal Decking",
        subcategory: "Roof Deck"
      },
      {
        id: "05-010",
        code: "05-50-13.10",
        description: "Miscellaneous Steel - Angle, 3\"x3\"x1/4\"",
        unit: "lb",
        material: 1.95,
        labor: 1.45,
        equipment: 0.25,
        category: "Miscellaneous Metals",
        subcategory: "Angles"
      },
      {
        id: "05-011",
        code: "05-52-13.10",
        description: "Steel Pipe Railing - 1-1/2\" Diameter",
        unit: "lf",
        material: 28.50,
        labor: 18.75,
        equipment: 1.25,
        category: "Railings",
        subcategory: "Pipe"
      },
      {
        id: "05-012",
        code: "05-52-13.50",
        description: "Aluminum Railing - Decorative",
        unit: "lf",
        material: 45.50,
        labor: 22.50,
        equipment: 1.50,
        category: "Railings",
        subcategory: "Aluminum"
      },
      {
        id: "05-013",
        code: "05-12-23.85",
        description: "Structural Steel - W18x76 Beam",
        unit: "lb",
        material: 1.65,
        labor: 1.00,
        equipment: 0.37,
        category: "Structural Steel",
        subcategory: "Wide Flange"
      },
      {
        id: "05-014",
        code: "05-44-13.10",
        description: "Steel Stair - Prefabricated",
        unit: "flight",
        material: 3850,
        labor: 1250,
        equipment: 285,
        category: "Metal Stairs",
        subcategory: "Prefab"
      },
      {
        id: "05-015",
        code: "05-50-13.25",
        description: "Steel Plate - 1/4\" Thick",
        unit: "lb",
        material: 2.25,
        labor: 1.75,
        equipment: 0.35,
        category: "Miscellaneous Metals",
        subcategory: "Plates"
      },
      {
        id: "05-016",
        code: "05-51-13.10",
        description: "Metal Grating - Galvanized",
        unit: "sqft",
        material: 18.50,
        labor: 12.25,
        equipment: 1.25,
        category: "Miscellaneous Metals",
        subcategory: "Grating"
      },
      {
        id: "05-017",
        code: "05-21-13.35",
        description: "Steel Joist - 30K10, 50 PSF",
        unit: "lb",
        material: 1.38,
        labor: 0.78,
        equipment: 0.28,
        category: "Steel Joists",
        subcategory: "K-Series"
      }
    ]
  },

  // Division 06 - Wood, Plastics, and Composites
  "06": {
    name: "Wood, Plastics, and Composites",
    items: [
      {
        id: "06-001",
        code: "06-11-10.10",
        description: "Wood Framing - 2x4 Studs, 16\" OC",
        unit: "lf",
        material: 1.85,
        labor: 2.25,
        equipment: 0.15,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-002",
        code: "06-11-10.20",
        description: "Wood Framing - 2x6 Studs, 16\" OC",
        unit: "lf",
        material: 2.75,
        labor: 2.45,
        equipment: 0.18,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-003",
        code: "06-11-10.30",
        description: "Wood Framing - 2x8 Joists, 16\" OC",
        unit: "lf",
        material: 4.25,
        labor: 2.85,
        equipment: 0.22,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-004",
        code: "06-11-10.40",
        description: "Wood Framing - 2x10 Joists, 16\" OC",
        unit: "lf",
        material: 6.50,
        labor: 3.15,
        equipment: 0.25,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-005",
        code: "06-11-10.50",
        description: "Wood Framing - 2x12 Joists, 16\" OC",
        unit: "lf",
        material: 8.75,
        labor: 3.45,
        equipment: 0.28,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-006",
        code: "06-16-23.10",
        description: "Sheathing - 1/2\" Plywood",
        unit: "sqft",
        material: 1.45,
        labor: 0.95,
        equipment: 0.08,
        category: "Sheathing",
        subcategory: "Plywood"
      },
      {
        id: "06-007",
        code: "06-16-23.20",
        description: "Sheathing - 5/8\" Plywood",
        unit: "sqft",
        material: 1.75,
        labor: 1.05,
        equipment: 0.10,
        category: "Sheathing",
        subcategory: "Plywood"
      },
      {
        id: "06-008",
        code: "06-16-23.30",
        description: "Sheathing - 3/4\" Plywood",
        unit: "sqft",
        material: 2.15,
        labor: 1.15,
        equipment: 0.12,
        category: "Sheathing",
        subcategory: "Plywood"
      },
      {
        id: "06-009",
        code: "06-16-23.50",
        description: "Sheathing - 7/16\" OSB",
        unit: "sqft",
        material: 0.95,
        labor: 0.85,
        equipment: 0.08,
        category: "Sheathing",
        subcategory: "OSB"
      },
      {
        id: "06-010",
        code: "06-22-10.10",
        description: "Finish Carpentry - Baseboard, 3-1/4\"",
        unit: "lf",
        material: 2.85,
        labor: 3.25,
        equipment: 0.15,
        category: "Finish Carpentry",
        subcategory: "Trim"
      },
      {
        id: "06-011",
        code: "06-22-10.20",
        description: "Finish Carpentry - Crown Molding, 3-1/2\"",
        unit: "lf",
        material: 3.50,
        labor: 4.75,
        equipment: 0.18,
        category: "Finish Carpentry",
        subcategory: "Trim"
      },
      {
        id: "06-012",
        code: "06-22-10.30",
        description: "Finish Carpentry - Door Casing, 2-1/4\"",
        unit: "lf",
        material: 2.25,
        labor: 2.85,
        equipment: 0.12,
        category: "Finish Carpentry",
        subcategory: "Trim"
      },
      {
        id: "06-013",
        code: "06-11-10.60",
        description: "Wood Framing - LVL Beam, 1-3/4\"x11-7/8\"",
        unit: "lf",
        material: 12.85,
        labor: 4.25,
        equipment: 0.35,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-014",
        code: "06-11-10.70",
        description: "Wood Framing - Glulam Beam, 5-1/8\"x12\"",
        unit: "lf",
        material: 24.50,
        labor: 6.85,
        equipment: 0.95,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-015",
        code: "06-16-23.60",
        description: "Sheathing - 5/8\" OSB",
        unit: "sqft",
        material: 1.15,
        labor: 0.95,
        equipment: 0.10,
        category: "Sheathing",
        subcategory: "OSB"
      },
      {
        id: "06-016",
        code: "06-16-23.70",
        description: "Sheathing - 3/4\" OSB",
        unit: "sqft",
        material: 1.45,
        labor: 1.05,
        equipment: 0.12,
        category: "Sheathing",
        subcategory: "OSB"
      },
      {
        id: "06-017",
        code: "06-42-13.10",
        description: "Wood Paneling - Hardwood, 3/4\"",
        unit: "sqft",
        material: 8.95,
        labor: 5.25,
        equipment: 0.45,
        category: "Interior Wood",
        subcategory: "Paneling"
      },
      {
        id: "06-018",
        code: "06-64-23.10",
        description: "Plastic Laminate Countertop",
        unit: "lf",
        material: 28.50,
        labor: 18.75,
        equipment: 1.25,
        category: "Plastics",
        subcategory: "Countertops"
      },
      {
        id: "06-019",
        code: "06-11-10.11",
        description: "Wood Framing - 2x4 Studs, 12\" OC",
        unit: "lf",
        material: 2.15,
        labor: 2.55,
        equipment: 0.18,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-020",
        code: "06-11-10.12",
        description: "Wood Framing - 2x4 Studs, 24\" OC",
        unit: "lf",
        material: 1.45,
        labor: 1.95,
        equipment: 0.12,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-021",
        code: "06-11-10.21",
        description: "Wood Framing - 2x6 Studs, 12\" OC",
        unit: "lf",
        material: 3.25,
        labor: 2.75,
        equipment: 0.22,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-022",
        code: "06-11-10.22",
        description: "Wood Framing - 2x6 Studs, 24\" OC",
        unit: "lf",
        material: 2.25,
        labor: 2.15,
        equipment: 0.15,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-023",
        code: "06-11-10.80",
        description: "Metal Stud Framing - 3-5/8\", 20 Ga, 16\" OC",
        unit: "lf",
        material: 1.95,
        labor: 2.45,
        equipment: 0.12,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-024",
        code: "06-11-10.81",
        description: "Metal Stud Framing - 3-5/8\", 20 Ga, 24\" OC",
        unit: "lf",
        material: 1.55,
        labor: 2.15,
        equipment: 0.10,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-025",
        code: "06-11-10.82",
        description: "Metal Stud Framing - 6\", 20 Ga, 16\" OC",
        unit: "lf",
        material: 2.85,
        labor: 2.75,
        equipment: 0.15,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-026",
        code: "06-11-10.83",
        description: "Metal Stud Framing - 6\", 20 Ga, 24\" OC",
        unit: "lf",
        material: 2.25,
        labor: 2.45,
        equipment: 0.12,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-027",
        code: "06-11-10.84",
        description: "Metal Stud Framing - 3-5/8\", 25 Ga, 16\" OC",
        unit: "lf",
        material: 1.65,
        labor: 2.35,
        equipment: 0.10,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-028",
        code: "06-11-10.85",
        description: "Metal Stud Framing - 3-5/8\", 25 Ga, 24\" OC",
        unit: "lf",
        material: 1.35,
        labor: 2.05,
        equipment: 0.08,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-029",
        code: "06-11-10.86",
        description: "Metal Track - 3-5/8\", 20 Ga",
        unit: "lf",
        material: 1.45,
        labor: 1.25,
        equipment: 0.08,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-030",
        code: "06-11-10.87",
        description: "Metal Track - 6\", 20 Ga",
        unit: "lf",
        material: 2.15,
        labor: 1.45,
        equipment: 0.10,
        category: "Rough Carpentry",
        subcategory: "Metal Framing"
      },
      {
        id: "06-031",
        code: "06-11-10.31",
        description: "Wood Framing - 2x8 Joists, 12\" OC",
        unit: "lf",
        material: 5.25,
        labor: 3.25,
        equipment: 0.25,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-032",
        code: "06-11-10.32",
        description: "Wood Framing - 2x8 Joists, 24\" OC",
        unit: "lf",
        material: 3.45,
        labor: 2.45,
        equipment: 0.18,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-033",
        code: "06-11-10.41",
        description: "Wood Framing - 2x10 Joists, 12\" OC",
        unit: "lf",
        material: 7.85,
        labor: 3.65,
        equipment: 0.30,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-034",
        code: "06-11-10.42",
        description: "Wood Framing - 2x10 Joists, 24\" OC",
        unit: "lf",
        material: 5.25,
        labor: 2.75,
        equipment: 0.22,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-035",
        code: "06-11-10.51",
        description: "Wood Framing - 2x12 Joists, 12\" OC",
        unit: "lf",
        material: 10.50,
        labor: 4.15,
        equipment: 0.35,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-036",
        code: "06-11-10.52",
        description: "Wood Framing - 2x12 Joists, 24\" OC",
        unit: "lf",
        material: 7.15,
        labor: 3.05,
        equipment: 0.25,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-037",
        code: "06-11-10.90",
        description: "Wall Assembly - 2x4 Wood Stud, 16\" OC, Complete",
        unit: "sqft",
        material: 3.85,
        labor: 4.25,
        equipment: 0.35,
        category: "Rough Carpentry",
        subcategory: "Wall Assemblies"
      },
      {
        id: "06-038",
        code: "06-11-10.91",
        description: "Wall Assembly - 2x6 Wood Stud, 16\" OC, Complete",
        unit: "sqft",
        material: 4.85,
        labor: 4.65,
        equipment: 0.42,
        category: "Rough Carpentry",
        subcategory: "Wall Assemblies"
      },
      {
        id: "06-039",
        code: "06-11-10.92",
        description: "Wall Assembly - Metal Stud 3-5/8\", 16\" OC, Complete",
        unit: "sqft",
        material: 3.45,
        labor: 4.15,
        equipment: 0.28,
        category: "Rough Carpentry",
        subcategory: "Wall Assemblies"
      },
      {
        id: "06-040",
        code: "06-11-10.93",
        description: "Wall Assembly - Metal Stud 6\", 16\" OC, Complete",
        unit: "sqft",
        material: 4.25,
        labor: 4.45,
        equipment: 0.32,
        category: "Rough Carpentry",
        subcategory: "Wall Assemblies"
      },
      {
        id: "06-041",
        code: "06-11-10.15",
        description: "Wood Framing - 2x4 Plates (Top/Bottom)",
        unit: "lf",
        material: 1.65,
        labor: 1.25,
        equipment: 0.10,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-042",
        code: "06-11-10.25",
        description: "Wood Framing - 2x6 Plates (Top/Bottom)",
        unit: "lf",
        material: 2.45,
        labor: 1.45,
        equipment: 0.12,
        category: "Rough Carpentry",
        subcategory: "Framing"
      },
      {
        id: "06-043",
        code: "06-11-10.61",
        description: "Wood Framing - LVL Beam, 1-3/4\"x14\"",
        unit: "lf",
        material: 15.85,
        labor: 4.85,
        equipment: 0.42,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-044",
        code: "06-11-10.62",
        description: "Wood Framing - LVL Beam, 1-3/4\"x16\"",
        unit: "lf",
        material: 18.50,
        labor: 5.25,
        equipment: 0.48,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-045",
        code: "06-11-10.71",
        description: "Wood Framing - Glulam Beam, 3-1/8\"x12\"",
        unit: "lf",
        material: 18.25,
        labor: 5.85,
        equipment: 0.75,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-046",
        code: "06-11-10.72",
        description: "Wood Framing - Glulam Beam, 5-1/8\"x18\"",
        unit: "lf",
        material: 35.50,
        labor: 8.25,
        equipment: 1.25,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-047",
        code: "06-16-13.10",
        description: "I-Joist - 11-7/8\" Deep, 16\" OC",
        unit: "lf",
        material: 5.85,
        labor: 2.95,
        equipment: 0.25,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-048",
        code: "06-16-13.20",
        description: "I-Joist - 14\" Deep, 16\" OC",
        unit: "lf",
        material: 6.85,
        labor: 3.15,
        equipment: 0.28,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-049",
        code: "06-16-13.30",
        description: "I-Joist - 16\" Deep, 16\" OC",
        unit: "lf",
        material: 7.95,
        labor: 3.35,
        equipment: 0.30,
        category: "Rough Carpentry",
        subcategory: "Engineered Lumber"
      },
      {
        id: "06-050",
        code: "06-22-10.40",
        description: "Finish Carpentry - Window Trim, Colonial",
        unit: "lf",
        material: 2.95,
        labor: 3.25,
        equipment: 0.15,
        category: "Finish Carpentry",
        subcategory: "Trim"
      },
      {
        id: "06-051",
        code: "06-22-10.50",
        description: "Finish Carpentry - Chair Rail",
        unit: "lf",
        material: 3.25,
        labor: 2.95,
        equipment: 0.12,
        category: "Finish Carpentry",
        subcategory: "Trim"
      },
      {
        id: "06-052",
        code: "06-22-10.60",
        description: "Finish Carpentry - Wainscoting, MDF",
        unit: "sqft",
        material: 4.85,
        labor: 5.25,
        equipment: 0.35,
        category: "Finish Carpentry",
        subcategory: "Trim"
      }
    ]
  },

  // Division 07 - Thermal and Moisture Protection
  "07": {
    name: "Thermal and Moisture Protection",
    items: [
      {
        id: "07-001",
        code: "07-11-13.10",
        description: "Bituminous Dampproofing - 1 Coat",
        unit: "sqft",
        material: 0.45,
        labor: 0.65,
        equipment: 0.05,
        category: "Dampproofing",
        subcategory: "Bituminous"
      },
      {
        id: "07-002",
        code: "07-13-26.10",
        description: "Sheet Waterproofing - 60 mil HDPE",
        unit: "sqft",
        material: 1.85,
        labor: 2.25,
        equipment: 0.15,
        category: "Waterproofing",
        subcategory: "Sheet"
      },
      {
        id: "07-003",
        code: "07-21-13.10",
        description: "Batt Insulation - R-11, 3-1/2\"",
        unit: "sqft",
        material: 0.55,
        labor: 0.45,
        equipment: 0.03,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-004",
        code: "07-21-13.20",
        description: "Batt Insulation - R-19, 6-1/4\"",
        unit: "sqft",
        material: 0.75,
        labor: 0.52,
        equipment: 0.04,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-005",
        code: "07-21-13.30",
        description: "Batt Insulation - R-30, 9-1/2\"",
        unit: "sqft",
        material: 1.15,
        labor: 0.62,
        equipment: 0.05,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-006",
        code: "07-21-16.10",
        description: "Rigid Insulation - 1\" Polyiso, R-6",
        unit: "sqft",
        material: 0.95,
        labor: 0.75,
        equipment: 0.06,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-007",
        code: "07-21-16.20",
        description: "Rigid Insulation - 2\" Polyiso, R-12",
        unit: "sqft",
        material: 1.65,
        labor: 0.85,
        equipment: 0.08,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-008",
        code: "07-42-13.10",
        description: "Metal Wall Panels - 26 Gauge",
        unit: "sqft",
        material: 4.25,
        labor: 3.85,
        equipment: 0.45,
        category: "Siding",
        subcategory: "Metal"
      },
      {
        id: "07-009",
        code: "07-46-23.10",
        description: "Vinyl Siding - Horizontal",
        unit: "sqft",
        material: 2.85,
        labor: 3.25,
        equipment: 0.25,
        category: "Siding",
        subcategory: "Vinyl"
      },
      {
        id: "07-010",
        code: "07-52-13.10",
        description: "EPDM Roofing - 60 mil, Fully Adhered",
        unit: "sqft",
        material: 2.95,
        labor: 3.75,
        equipment: 0.45,
        category: "Roofing",
        subcategory: "Single Ply"
      },
      {
        id: "07-011",
        code: "07-53-23.10",
        description: "TPO Roofing - 60 mil, Mechanically Attached",
        unit: "sqft",
        material: 2.75,
        labor: 3.50,
        equipment: 0.40,
        category: "Roofing",
        subcategory: "Single Ply"
      },
      {
        id: "07-012",
        code: "07-31-13.10",
        description: "Asphalt Shingles - 3-Tab, 25 Year",
        unit: "sqft",
        material: 1.15,
        labor: 2.25,
        equipment: 0.20,
        category: "Roofing",
        subcategory: "Shingles"
      },
      {
        id: "07-013",
        code: "07-31-13.20",
        description: "Asphalt Shingles - Architectural, 30 Year",
        unit: "sqft",
        material: 1.65,
        labor: 2.45,
        equipment: 0.22,
        category: "Roofing",
        subcategory: "Shingles"
      },
      {
        id: "07-014",
        code: "07-61-13.10",
        description: "Sheet Metal Flashing - Aluminum, .032\"",
        unit: "sqft",
        material: 3.25,
        labor: 4.50,
        equipment: 0.35,
        category: "Flashing",
        subcategory: "Sheet Metal"
      },
      {
        id: "07-015",
        code: "07-92-13.10",
        description: "Joint Sealant - Silicone, 1/2\" x 1/2\"",
        unit: "lf",
        material: 0.85,
        labor: 1.25,
        equipment: 0.08,
        category: "Sealants",
        subcategory: "Silicone"
      },
      {
        id: "07-016",
        code: "07-21-13.11",
        description: "Batt Insulation - Fiberglass, R-13, 3-1/2\"",
        unit: "sqft",
        material: 0.65,
        labor: 0.85,
        equipment: 0.05,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-017",
        code: "07-21-13.12",
        description: "Batt Insulation - Fiberglass, R-19, 6-1/4\"",
        unit: "sqft",
        material: 0.95,
        labor: 1.05,
        equipment: 0.08,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-018",
        code: "07-21-13.13",
        description: "Batt Insulation - Fiberglass, R-21, 5-1/2\"",
        unit: "sqft",
        material: 1.15,
        labor: 1.15,
        equipment: 0.08,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-019",
        code: "07-21-13.14",
        description: "Batt Insulation - Fiberglass, R-30, 9-1/2\"",
        unit: "sqft",
        material: 1.45,
        labor: 1.35,
        equipment: 0.10,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-020",
        code: "07-21-13.15",
        description: "Batt Insulation - Fiberglass, R-38, 12\"",
        unit: "sqft",
        material: 1.85,
        labor: 1.55,
        equipment: 0.12,
        category: "Insulation",
        subcategory: "Batt"
      },
      {
        id: "07-021",
        code: "07-21-16.11",
        description: "Blown Insulation - Fiberglass, R-30",
        unit: "sqft",
        material: 0.95,
        labor: 0.75,
        equipment: 0.35,
        category: "Insulation",
        subcategory: "Blown"
      },
      {
        id: "07-022",
        code: "07-21-16.12",
        description: "Blown Insulation - Cellulose, R-38",
        unit: "sqft",
        material: 1.25,
        labor: 0.85,
        equipment: 0.42,
        category: "Insulation",
        subcategory: "Blown"
      },
      {
        id: "07-023",
        code: "07-21-19.11",
        description: "Spray Foam Insulation - Open Cell, R-3.5/in",
        unit: "sqft",
        material: 1.85,
        labor: 1.45,
        equipment: 0.65,
        category: "Insulation",
        subcategory: "Spray Foam"
      },
      {
        id: "07-024",
        code: "07-21-19.12",
        description: "Spray Foam Insulation - Closed Cell, R-6.0/in",
        unit: "sqft",
        material: 2.95,
        labor: 1.85,
        equipment: 0.85,
        category: "Insulation",
        subcategory: "Spray Foam"
      },
      {
        id: "07-025",
        code: "07-22-16.11",
        description: "Rigid Insulation - XPS, 1\", R-5",
        unit: "sqft",
        material: 1.25,
        labor: 0.95,
        equipment: 0.08,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-026",
        code: "07-22-16.12",
        description: "Rigid Insulation - XPS, 2\", R-10",
        unit: "sqft",
        material: 2.15,
        labor: 1.15,
        equipment: 0.10,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-027",
        code: "07-22-16.13",
        description: "Rigid Insulation - Polyiso, 1\", R-6",
        unit: "sqft",
        material: 1.45,
        labor: 0.95,
        equipment: 0.08,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-028",
        code: "07-22-16.14",
        description: "Rigid Insulation - Polyiso, 2\", R-12",
        unit: "sqft",
        material: 2.65,
        labor: 1.15,
        equipment: 0.10,
        category: "Insulation",
        subcategory: "Rigid"
      },
      {
        id: "07-029",
        code: "07-13-13.11",
        description: "Waterproofing - Liquid Applied, 2 Coat",
        unit: "sqft",
        material: 2.45,
        labor: 3.25,
        equipment: 0.25,
        category: "Waterproofing",
        subcategory: "Liquid Applied"
      },
      {
        id: "07-030",
        code: "07-13-13.12",
        description: "Waterproofing - Sheet Membrane, Self-Adhered",
        unit: "sqft",
        material: 3.85,
        labor: 2.95,
        equipment: 0.18,
        category: "Waterproofing",
        subcategory: "Sheet"
      },
      {
        id: "07-031",
        code: "07-13-13.13",
        description: "Waterproofing - Bentonite Panels",
        unit: "sqft",
        material: 4.25,
        labor: 3.45,
        equipment: 0.22,
        category: "Waterproofing",
        subcategory: "Bentonite"
      },
      {
        id: "07-032",
        code: "07-31-13.11",
        description: "Asphalt Shingles - Architectural, 30 Year",
        unit: "sqft",
        material: 1.85,
        labor: 2.45,
        equipment: 0.18,
        category: "Roofing",
        subcategory: "Shingles"
      },
      {
        id: "07-033",
        code: "07-31-13.12",
        description: "Asphalt Shingles - 3-Tab, 25 Year",
        unit: "sqft",
        material: 1.25,
        labor: 2.15,
        equipment: 0.15,
        category: "Roofing",
        subcategory: "Shingles"
      },
      {
        id: "07-034",
        code: "07-53-23.11",
        description: "TPO Roofing Membrane - 60 mil, Mechanically Attached",
        unit: "sqft",
        material: 2.85,
        labor: 3.45,
        equipment: 0.35,
        category: "Roofing",
        subcategory: "Membrane"
      },
      {
        id: "07-035",
        code: "07-53-23.12",
        description: "EPDM Roofing Membrane - 60 mil, Fully Adhered",
        unit: "sqft",
        material: 3.25,
        labor: 3.85,
        equipment: 0.42,
        category: "Roofing",
        subcategory: "Membrane"
      },
      {
        id: "07-036",
        code: "07-33-13.11",
        description: "Metal Roofing - Standing Seam, 24 Ga",
        unit: "sqft",
        material: 6.85,
        labor: 5.25,
        equipment: 0.65,
        category: "Roofing",
        subcategory: "Metal"
      },
      {
        id: "07-037",
        code: "07-33-13.12",
        description: "Metal Roofing - Corrugated, 26 Ga",
        unit: "sqft",
        material: 4.25,
        labor: 3.85,
        equipment: 0.42,
        category: "Roofing",
        subcategory: "Metal"
      },
      {
        id: "07-038",
        code: "07-42-13.11",
        description: "Vinyl Siding - Horizontal, .044\" Thick",
        unit: "sqft",
        material: 2.45,
        labor: 3.25,
        equipment: 0.22,
        category: "Siding",
        subcategory: "Vinyl"
      },
      {
        id: "07-039",
        code: "07-42-13.12",
        description: "Vinyl Siding - Vertical, .046\" Thick",
        unit: "sqft",
        material: 2.85,
        labor: 3.45,
        equipment: 0.25,
        category: "Siding",
        subcategory: "Vinyl"
      },
      {
        id: "07-040",
        code: "07-46-29.11",
        description: "Fiber Cement Siding - 5/16\", Smooth",
        unit: "sqft",
        material: 3.85,
        labor: 4.25,
        equipment: 0.35,
        category: "Siding",
        subcategory: "Fiber Cement"
      },
      {
        id: "07-041",
        code: "07-46-29.12",
        description: "Fiber Cement Siding - 5/16\", Cedar Texture",
        unit: "sqft",
        material: 4.15,
        labor: 4.45,
        equipment: 0.38,
        category: "Siding",
        subcategory: "Fiber Cement"
      },
      {
        id: "07-042",
        code: "07-46-33.11",
        description: "Wood Siding - Cedar Bevel, 1/2\"x6\"",
        unit: "sqft",
        material: 5.85,
        labor: 4.85,
        equipment: 0.42,
        category: "Siding",
        subcategory: "Wood"
      },
      {
        id: "07-043",
        code: "07-42-43.11",
        description: "Metal Siding - Aluminum, .024\"",
        unit: "sqft",
        material: 4.25,
        labor: 3.85,
        equipment: 0.32,
        category: "Siding",
        subcategory: "Metal"
      },
      {
        id: "07-044",
        code: "07-42-43.12",
        description: "Metal Siding - Steel, 26 Ga",
        unit: "sqft",
        material: 5.15,
        labor: 4.15,
        equipment: 0.38,
        category: "Siding",
        subcategory: "Metal"
      },
      {
        id: "07-045",
        code: "07-92-13.11",
        description: "Joint Sealant - Polyurethane, 1/2\" x 1/2\"",
        unit: "lf",
        material: 0.95,
        labor: 1.35,
        equipment: 0.08,
        category: "Sealants",
        subcategory: "Polyurethane"
      }
    ]
  },

  // Division 08 - Openings
  "08": {
    name: "Openings",
    items: [
      {
        id: "08-001",
        code: "08-11-13.10",
        description: "Hollow Metal Door - 3'x7', 18 Gauge",
        unit: "ea",
        material: 425,
        labor: 185,
        equipment: 15,
        category: "Doors",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-002",
        code: "08-11-13.20",
        description: "Hollow Metal Frame - 3'x7', 16 Gauge",
        unit: "ea",
        material: 285,
        labor: 165,
        equipment: 12,
        category: "Frames",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-003",
        code: "08-14-16.10",
        description: "Wood Door - Solid Core, Paint Grade, 3'x7'",
        unit: "ea",
        material: 325,
        labor: 145,
        equipment: 10,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-004",
        code: "08-14-16.20",
        description: "Wood Door - Hollow Core, 2'6\"x6'8\"",
        unit: "ea",
        material: 125,
        labor: 125,
        equipment: 8,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-005",
        code: "08-16-13.10",
        description: "Overhead Coiling Door - 10'x10'",
        unit: "ea",
        material: 2850,
        labor: 825,
        equipment: 125,
        category: "Doors",
        subcategory: "Overhead"
      },
      {
        id: "08-006",
        code: "08-33-23.10",
        description: "Overhead Sectional Door - 16'x14', Insulated",
        unit: "ea",
        material: 1950,
        labor: 625,
        equipment: 95,
        category: "Doors",
        subcategory: "Overhead"
      },
      {
        id: "08-007",
        code: "08-51-13.10",
        description: "Aluminum Window - Fixed, 3'x5'",
        unit: "ea",
        material: 385,
        labor: 175,
        equipment: 15,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-008",
        code: "08-52-16.10",
        description: "Vinyl Window - Double Hung, 3'x5'",
        unit: "ea",
        material: 425,
        labor: 185,
        equipment: 15,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-009",
        code: "08-71-13.10",
        description: "Door Hardware - Lockset, Commercial Grade",
        unit: "ea",
        material: 285,
        labor: 95,
        equipment: 5,
        category: "Hardware",
        subcategory: "Locksets"
      },
      {
        id: "08-010",
        code: "08-71-13.20",
        description: "Door Hardware - Closer, Heavy Duty",
        unit: "ea",
        material: 325,
        labor: 125,
        equipment: 8,
        category: "Hardware",
        subcategory: "Closers"
      },
      {
        id: "08-011",
        code: "08-71-13.30",
        description: "Door Hardware - Exit Device, Panic Bar",
        unit: "ea",
        material: 625,
        labor: 175,
        equipment: 12,
        category: "Hardware",
        subcategory: "Exit Devices"
      },
      {
        id: "08-012",
        code: "08-80-13.10",
        description: "Glazing - 1/4\" Clear Tempered Glass",
        unit: "sqft",
        material: 12.50,
        labor: 8.75,
        equipment: 0.85,
        category: "Glazing",
        subcategory: "Glass"
      },
      {
        id: "08-013",
        code: "08-11-13.11",
        description: "Hollow Metal Door - 2'6\"x6'8\", 18 Gauge",
        unit: "ea",
        material: 375,
        labor: 165,
        equipment: 12,
        category: "Doors",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-014",
        code: "08-11-13.12",
        description: "Hollow Metal Door - 3'6\"x7', 18 Gauge",
        unit: "ea",
        material: 485,
        labor: 205,
        equipment: 18,
        category: "Doors",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-015",
        code: "08-11-13.13",
        description: "Hollow Metal Door - 4'x7', 18 Gauge, Pair",
        unit: "ea",
        material: 1250,
        labor: 385,
        equipment: 35,
        category: "Doors",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-016",
        code: "08-11-13.21",
        description: "Hollow Metal Frame - 2'6\"x6'8\", 16 Gauge",
        unit: "ea",
        material: 245,
        labor: 145,
        equipment: 10,
        category: "Frames",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-017",
        code: "08-11-13.22",
        description: "Hollow Metal Frame - 3'6\"x7', 16 Gauge",
        unit: "ea",
        material: 325,
        labor: 185,
        equipment: 15,
        category: "Frames",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-018",
        code: "08-11-13.23",
        description: "Hollow Metal Frame - 4'x7', 16 Gauge, Pair",
        unit: "ea",
        material: 785,
        labor: 325,
        equipment: 28,
        category: "Frames",
        subcategory: "Hollow Metal"
      },
      {
        id: "08-019",
        code: "08-14-16.11",
        description: "Wood Door - Solid Core, Stain Grade, 2'6\"x6'8\"",
        unit: "ea",
        material: 285,
        labor: 125,
        equipment: 8,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-020",
        code: "08-14-16.12",
        description: "Wood Door - Solid Core, Stain Grade, 3'x7'",
        unit: "ea",
        material: 385,
        labor: 155,
        equipment: 12,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-021",
        code: "08-14-16.13",
        description: "Wood Door - Solid Core, Paint Grade, 2'6\"x6'8\"",
        unit: "ea",
        material: 245,
        labor: 125,
        equipment: 8,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-022",
        code: "08-14-16.21",
        description: "Wood Door - Hollow Core, 2'0\"x6'8\"",
        unit: "ea",
        material: 95,
        labor: 105,
        equipment: 6,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-023",
        code: "08-14-16.22",
        description: "Wood Door - Hollow Core, 2'4\"x6'8\"",
        unit: "ea",
        material: 105,
        labor: 115,
        equipment: 7,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-024",
        code: "08-14-16.23",
        description: "Wood Door - Hollow Core, 3'0\"x6'8\"",
        unit: "ea",
        material: 135,
        labor: 125,
        equipment: 8,
        category: "Doors",
        subcategory: "Wood"
      },
      {
        id: "08-025",
        code: "08-44-13.11",
        description: "Aluminum Storefront Door - 3'x7', Narrow Stile",
        unit: "ea",
        material: 1250,
        labor: 385,
        equipment: 45,
        category: "Doors",
        subcategory: "Aluminum"
      },
      {
        id: "08-026",
        code: "08-44-13.12",
        description: "Aluminum Storefront Door - 6'x7', Pair",
        unit: "ea",
        material: 2850,
        labor: 725,
        equipment: 85,
        category: "Doors",
        subcategory: "Aluminum"
      },
      {
        id: "08-027",
        code: "08-44-13.21",
        description: "Aluminum Storefront Frame - 3'x7'",
        unit: "ea",
        material: 625,
        labor: 245,
        equipment: 25,
        category: "Frames",
        subcategory: "Aluminum"
      },
      {
        id: "08-028",
        code: "08-83-13.11",
        description: "Glass Door - All Glass, 3'x7', Tempered",
        unit: "ea",
        material: 1850,
        labor: 485,
        equipment: 55,
        category: "Doors",
        subcategory: "Glass"
      },
      {
        id: "08-029",
        code: "08-51-13.11",
        description: "Aluminum Window - Fixed, 2'x3'",
        unit: "ea",
        material: 245,
        labor: 125,
        equipment: 10,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-030",
        code: "08-51-13.12",
        description: "Aluminum Window - Fixed, 4'x4'",
        unit: "ea",
        material: 425,
        labor: 185,
        equipment: 18,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-031",
        code: "08-51-13.13",
        description: "Aluminum Window - Fixed, 5'x6'",
        unit: "ea",
        material: 625,
        labor: 245,
        equipment: 25,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-032",
        code: "08-51-13.21",
        description: "Aluminum Window - Sliding, 3'x3'",
        unit: "ea",
        material: 385,
        labor: 165,
        equipment: 15,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-033",
        code: "08-51-13.22",
        description: "Aluminum Window - Sliding, 4'x4'",
        unit: "ea",
        material: 525,
        labor: 205,
        equipment: 20,
        category: "Windows",
        subcategory: "Aluminum"
      },
      {
        id: "08-034",
        code: "08-52-16.11",
        description: "Vinyl Window - Double Hung, 2'x3'",
        unit: "ea",
        material: 285,
        labor: 145,
        equipment: 12,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-035",
        code: "08-52-16.12",
        description: "Vinyl Window - Double Hung, 3'x4'",
        unit: "ea",
        material: 385,
        labor: 165,
        equipment: 15,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-036",
        code: "08-52-16.13",
        description: "Vinyl Window - Double Hung, 3'x6'",
        unit: "ea",
        material: 525,
        labor: 205,
        equipment: 20,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-037",
        code: "08-52-16.21",
        description: "Vinyl Window - Casement, 2'x3'",
        unit: "ea",
        material: 325,
        labor: 155,
        equipment: 12,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-038",
        code: "08-52-16.22",
        description: "Vinyl Window - Casement, 3'x4'",
        unit: "ea",
        material: 445,
        labor: 185,
        equipment: 18,
        category: "Windows",
        subcategory: "Vinyl"
      },
      {
        id: "08-039",
        code: "08-53-13.11",
        description: "Wood Window - Double Hung, 2'6\"x4', Clad",
        unit: "ea",
        material: 485,
        labor: 205,
        equipment: 18,
        category: "Windows",
        subcategory: "Wood"
      },
      {
        id: "08-040",
        code: "08-53-13.12",
        description: "Wood Window - Double Hung, 3'x5', Clad",
        unit: "ea",
        material: 625,
        labor: 245,
        equipment: 22,
        category: "Windows",
        subcategory: "Wood"
      },
      {
        id: "08-041",
        code: "08-53-13.21",
        description: "Wood Window - Casement, 2'x3', Clad",
        unit: "ea",
        material: 425,
        labor: 185,
        equipment: 15,
        category: "Windows",
        subcategory: "Wood"
      },
      {
        id: "08-042",
        code: "08-71-13.11",
        description: "Door Hardware - Lockset, Residential Grade",
        unit: "ea",
        material: 125,
        labor: 65,
        equipment: 3,
        category: "Hardware",
        subcategory: "Locksets"
      },
      {
        id: "08-043",
        code: "08-71-13.12",
        description: "Door Hardware - Lockset, High Security",
        unit: "ea",
        material: 485,
        labor: 145,
        equipment: 8,
        category: "Hardware",
        subcategory: "Locksets"
      },
      {
        id: "08-044",
        code: "08-71-13.21",
        description: "Door Hardware - Closer, Standard Duty",
        unit: "ea",
        material: 185,
        labor: 95,
        equipment: 5,
        category: "Hardware",
        subcategory: "Closers"
      },
      {
        id: "08-045",
        code: "08-71-13.31",
        description: "Door Hardware - Hinges, Steel, 4-1/2\" Heavy Weight",
        unit: "set",
        material: 45,
        labor: 35,
        equipment: 2,
        category: "Hardware",
        subcategory: "Hinges"
      },
      {
        id: "08-046",
        code: "08-71-13.32",
        description: "Door Hardware - Hinges, Stainless Steel, 4-1/2\"",
        unit: "set",
        material: 85,
        labor: 38,
        equipment: 2,
        category: "Hardware",
        subcategory: "Hinges"
      },
      {
        id: "08-047",
        code: "08-80-13.11",
        description: "Glazing - 1/2\" Insulated Glass Unit",
        unit: "sqft",
        material: 18.50,
        labor: 11.25,
        equipment: 1.15,
        category: "Glazing",
        subcategory: "Glass"
      },
      {
        id: "08-048",
        code: "08-80-13.12",
        description: "Glazing - 1\" Insulated Glass Unit",
        unit: "sqft",
        material: 24.50,
        labor: 12.85,
        equipment: 1.35,
        category: "Glazing",
        subcategory: "Glass"
      }
    ]
  },

  // Division 09 - Finishes
  "09": {
    name: "Finishes",
    items: [
      {
        id: "09-001",
        code: "09-22-16.13",
        description: "Gypsum Board - 1/2\", Walls",
        unit: "sqft",
        material: 0.55,
        labor: 0.85,
        equipment: 0.06,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-002",
        code: "09-22-16.23",
        description: "Gypsum Board - 5/8\", Fire-Rated",
        unit: "sqft",
        material: 0.75,
        labor: 0.95,
        equipment: 0.07,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-003",
        code: "09-22-16.33",
        description: "Gypsum Board - 1/2\", Ceilings",
        unit: "sqft",
        material: 0.55,
        labor: 1.15,
        equipment: 0.08,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-004",
        code: "09-29-00.10",
        description: "Drywall Finishing - Taping & Finishing",
        unit: "sqft",
        material: 0.15,
        labor: 0.75,
        equipment: 0.05,
        category: "Drywall",
        subcategory: "Finishing"
      },
      {
        id: "09-005",
        code: "09-51-13.10",
        description: "Acoustic Ceiling Tile - 2'x4', Lay-In",
        unit: "sqft",
        material: 2.25,
        labor: 2.85,
        equipment: 0.20,
        category: "Ceilings",
        subcategory: "Acoustic"
      },
      {
        id: "09-006",
        code: "09-51-23.10",
        description: "Ceiling Grid - Exposed, Heavy Duty",
        unit: "sqft",
        material: 1.75,
        labor: 2.15,
        equipment: 0.15,
        category: "Ceilings",
        subcategory: "Grid"
      },
      {
        id: "09-007",
        code: "09-64-29.10",
        description: "Vinyl Composition Tile - 12\"x12\"",
        unit: "sqft",
        material: 2.85,
        labor: 3.25,
        equipment: 0.25,
        category: "Flooring",
        subcategory: "VCT"
      },
      {
        id: "09-008",
        code: "09-65-13.10",
        description: "Carpet - Commercial, 28 oz",
        unit: "sqft",
        material: 3.75,
        labor: 2.25,
        equipment: 0.18,
        category: "Flooring",
        subcategory: "Carpet"
      },
      {
        id: "09-009",
        code: "09-68-13.10",
        description: "Ceramic Tile - Floor, 12\"x12\"",
        unit: "sqft",
        material: 5.25,
        labor: 7.85,
        equipment: 0.65,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-010",
        code: "09-68-13.20",
        description: "Ceramic Tile - Wall, 4\"x4\"",
        unit: "sqft",
        material: 4.50,
        labor: 8.50,
        equipment: 0.70,
        category: "Wall Finishes",
        subcategory: "Tile"
      },
      {
        id: "09-011",
        code: "09-91-13.10",
        description: "Interior Paint - Wall, 2 Coats",
        unit: "sqft",
        material: 0.35,
        labor: 0.65,
        equipment: 0.05,
        category: "Painting",
        subcategory: "Interior"
      },
      {
        id: "09-012",
        code: "09-91-13.20",
        description: "Interior Paint - Ceiling, 2 Coats",
        unit: "sqft",
        material: 0.35,
        labor: 0.75,
        equipment: 0.06,
        category: "Painting",
        subcategory: "Interior"
      },
      {
        id: "09-013",
        code: "09-91-23.10",
        description: "Exterior Paint - Siding, 2 Coats",
        unit: "sqft",
        material: 0.45,
        labor: 0.85,
        equipment: 0.08,
        category: "Painting",
        subcategory: "Exterior"
      },
      {
        id: "09-014",
        code: "09-64-16.10",
        description: "Wood Flooring - Oak Strip, 3/4\"",
        unit: "sqft",
        material: 6.85,
        labor: 4.25,
        equipment: 0.45,
        category: "Flooring",
        subcategory: "Wood"
      },
      {
        id: "09-015",
        code: "09-65-19.10",
        description: "Resilient Sheet Flooring - Commercial",
        unit: "sqft",
        material: 4.25,
        labor: 3.50,
        equipment: 0.35,
        category: "Flooring",
        subcategory: "Resilient"
      },
      {
        id: "09-016",
        code: "09-68-13.30",
        description: "Porcelain Tile - Floor, 12\"x24\"",
        unit: "sqft",
        material: 8.50,
        labor: 9.25,
        equipment: 0.75,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-017",
        code: "09-91-13.30",
        description: "Stain & Varnish - Wood Trim",
        unit: "sqft",
        material: 0.65,
        labor: 1.25,
        equipment: 0.08,
        category: "Painting",
        subcategory: "Interior"
      },
      {
        id: "09-018",
        code: "09-29-00.20",
        description: "Joint Compound - Level 5 Finish",
        unit: "sqft",
        material: 0.25,
        labor: 1.05,
        equipment: 0.08,
        category: "Drywall",
        subcategory: "Finishing"
      },
      {
        id: "09-019",
        code: "09-22-16.21",
        description: "Gypsum Board - 5/8\", Walls",
        unit: "sqft",
        material: 0.75,
        labor: 0.95,
        equipment: 0.08,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-020",
        code: "09-22-16.22",
        description: "Gypsum Board - 5/8\", Type X Fire-Rated",
        unit: "sqft",
        material: 0.95,
        labor: 1.05,
        equipment: 0.08,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-021",
        code: "09-22-16.23",
        description: "Gypsum Board - 1/2\", Moisture Resistant",
        unit: "sqft",
        material: 0.85,
        labor: 0.95,
        equipment: 0.08,
        category: "Drywall",
        subcategory: "Gypsum Board"
      },
      {
        id: "09-022",
        code: "09-22-16.31",
        description: "Drywall Assembly - 1/2\" on Studs, Taped & Finished",
        unit: "sqft",
        material: 0.95,
        labor: 1.85,
        equipment: 0.15,
        category: "Drywall",
        subcategory: "Assemblies"
      },
      {
        id: "09-023",
        code: "09-22-16.32",
        description: "Drywall Assembly - 5/8\" Type X, Taped & Finished",
        unit: "sqft",
        material: 1.15,
        labor: 1.95,
        equipment: 0.18,
        category: "Drywall",
        subcategory: "Assemblies"
      },
      {
        id: "09-024",
        code: "09-91-23.11",
        description: "Paint - Interior Walls, Primer + 2 Coats",
        unit: "sqft",
        material: 0.35,
        labor: 0.95,
        equipment: 0.08,
        category: "Painting",
        subcategory: "Interior"
      },
      {
        id: "09-025",
        code: "09-91-23.12",
        description: "Paint - Interior Ceiling, Primer + 2 Coats",
        unit: "sqft",
        material: 0.38,
        labor: 1.15,
        equipment: 0.10,
        category: "Painting",
        subcategory: "Interior"
      },
      {
        id: "09-026",
        code: "09-91-23.21",
        description: "Paint - Exterior Walls, Primer + 2 Coats",
        unit: "sqft",
        material: 0.45,
        labor: 1.25,
        equipment: 0.12,
        category: "Painting",
        subcategory: "Exterior"
      },
      {
        id: "09-027",
        code: "09-91-23.22",
        description: "Paint - Exterior Trim, Primer + 2 Coats",
        unit: "lf",
        material: 0.55,
        labor: 1.45,
        equipment: 0.10,
        category: "Painting",
        subcategory: "Exterior"
      },
      {
        id: "09-028",
        code: "09-65-13.11",
        description: "Carpet - Commercial Grade, 28 oz, Installed",
        unit: "sqft",
        material: 3.85,
        labor: 2.25,
        equipment: 0.18,
        category: "Flooring",
        subcategory: "Carpet"
      },
      {
        id: "09-029",
        code: "09-65-13.12",
        description: "Carpet - Premium Grade, 36 oz, Installed",
        unit: "sqft",
        material: 5.25,
        labor: 2.45,
        equipment: 0.22,
        category: "Flooring",
        subcategory: "Carpet"
      },
      {
        id: "09-030",
        code: "09-65-13.21",
        description: "Carpet Tile - 24\"x24\", Commercial",
        unit: "sqft",
        material: 4.25,
        labor: 1.85,
        equipment: 0.15,
        category: "Flooring",
        subcategory: "Carpet"
      },
      {
        id: "09-031",
        code: "09-65-16.11",
        description: "VCT - Vinyl Composition Tile, 12\"x12\"",
        unit: "sqft",
        material: 1.85,
        labor: 2.25,
        equipment: 0.18,
        category: "Flooring",
        subcategory: "Resilient"
      },
      {
        id: "09-032",
        code: "09-65-16.21",
        description: "LVT - Luxury Vinyl Tile, Plank, Commercial",
        unit: "sqft",
        material: 4.85,
        labor: 2.85,
        equipment: 0.25,
        category: "Flooring",
        subcategory: "Resilient"
      },
      {
        id: "09-033",
        code: "09-65-16.22",
        description: "LVP - Luxury Vinyl Plank, Click-Lock",
        unit: "sqft",
        material: 3.95,
        labor: 2.45,
        equipment: 0.20,
        category: "Flooring",
        subcategory: "Resilient"
      },
      {
        id: "09-034",
        code: "09-65-19.11",
        description: "Sheet Vinyl - Commercial Grade, 6' Wide",
        unit: "sqft",
        material: 2.85,
        labor: 2.15,
        equipment: 0.18,
        category: "Flooring",
        subcategory: "Resilient"
      },
      {
        id: "09-035",
        code: "09-30-13.11",
        description: "Ceramic Tile - Floor, 12\"x12\", Installed",
        unit: "sqft",
        material: 4.25,
        labor: 5.85,
        equipment: 0.45,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-036",
        code: "09-30-13.12",
        description: "Ceramic Tile - Wall, 4\"x4\", Installed",
        unit: "sqft",
        material: 3.85,
        labor: 6.25,
        equipment: 0.48,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-037",
        code: "09-30-13.21",
        description: "Porcelain Tile - Floor, 12\"x24\", Installed",
        unit: "sqft",
        material: 6.85,
        labor: 6.85,
        equipment: 0.55,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-038",
        code: "09-30-13.22",
        description: "Porcelain Tile - Large Format, 24\"x48\"",
        unit: "sqft",
        material: 9.85,
        labor: 8.25,
        equipment: 0.75,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-039",
        code: "09-64-29.11",
        description: "Hardwood Flooring - Oak, 3/4\"x2-1/4\", Finished",
        unit: "sqft",
        material: 8.85,
        labor: 5.25,
        equipment: 0.55,
        category: "Flooring",
        subcategory: "Wood"
      },
      {
        id: "09-040",
        code: "09-64-29.12",
        description: "Hardwood Flooring - Maple, 3/4\"x3-1/4\", Finished",
        unit: "sqft",
        material: 10.50,
        labor: 5.85,
        equipment: 0.65,
        category: "Flooring",
        subcategory: "Wood"
      },
      {
        id: "09-041",
        code: "09-64-29.21",
        description: "Engineered Wood Flooring - 5\" Wide, Click-Lock",
        unit: "sqft",
        material: 6.85,
        labor: 3.85,
        equipment: 0.35,
        category: "Flooring",
        subcategory: "Wood"
      },
      {
        id: "09-042",
        code: "09-51-13.11",
        description: "Acoustic Ceiling Tile - 2'x2', 5/8\" Tegular",
        unit: "sqft",
        material: 2.25,
        labor: 2.85,
        equipment: 0.25,
        category: "Ceilings",
        subcategory: "ACT"
      },
      {
        id: "09-043",
        code: "09-51-13.12",
        description: "Acoustic Ceiling Tile - 2'x4', 5/8\" Lay-In",
        unit: "sqft",
        material: 1.85,
        labor: 2.45,
        equipment: 0.22,
        category: "Ceilings",
        subcategory: "ACT"
      },
      {
        id: "09-044",
        code: "09-51-13.21",
        description: "Ceiling Grid - Exposed, 15/16\" T-Bar",
        unit: "sqft",
        material: 1.45,
        labor: 1.85,
        equipment: 0.15,
        category: "Ceilings",
        subcategory: "ACT"
      },
      {
        id: "09-045",
        code: "09-51-23.11",
        description: "Gypsum Board Ceiling - 1/2\", Suspended",
        unit: "sqft",
        material: 1.25,
        labor: 2.85,
        equipment: 0.25,
        category: "Ceilings",
        subcategory: "Drywall"
      },
      {
        id: "09-046",
        code: "09-68-13.11",
        description: "Base - Rubber, 4\" High",
        unit: "lf",
        material: 1.85,
        labor: 1.45,
        equipment: 0.10,
        category: "Flooring",
        subcategory: "Base"
      },
      {
        id: "09-047",
        code: "09-68-13.12",
        description: "Base - Vinyl, 4\" High",
        unit: "lf",
        material: 1.25,
        labor: 1.25,
        equipment: 0.08,
        category: "Flooring",
        subcategory: "Base"
      },
      {
        id: "09-048",
        code: "09-30-13.31",
        description: "Tile Setting Mortar - Thin-Set",
        unit: "sqft",
        material: 0.85,
        labor: 0.45,
        equipment: 0.05,
        category: "Flooring",
        subcategory: "Tile"
      },
      {
        id: "09-049",
        code: "09-30-13.32",
        description: "Tile Grout - Epoxy, Stain Resistant",
        unit: "sqft",
        material: 1.25,
        labor: 0.65,
        equipment: 0.08,
        category: "Flooring",
        subcategory: "Tile"
      }
    ]
  },

  // Division 10 - Specialties
  "10": {
    name: "Specialties",
    items: [
      {
        id: "10-001",
        code: "10-14-13.10",
        description: "Toilet Partition - Powder Coated Steel",
        unit: "ea",
        material: 425,
        labor: 185,
        equipment: 15,
        category: "Partitions",
        subcategory: "Toilet"
      },
      {
        id: "10-002",
        code: "10-14-13.20",
        description: "Toilet Partition - Solid Plastic",
        unit: "ea",
        material: 685,
        labor: 215,
        equipment: 18,
        category: "Partitions",
        subcategory: "Toilet"
      },
      {
        id: "10-003",
        code: "10-21-13.10",
        description: "Toilet Accessories - Paper Holder",
        unit: "ea",
        material: 45,
        labor: 35,
        equipment: 0,
        category: "Accessories",
        subcategory: "Toilet"
      },
      {
        id: "10-004",
        code: "10-21-13.20",
        description: "Toilet Accessories - Grab Bar, 36\"",
        unit: "ea",
        material: 85,
        labor: 65,
        equipment: 5,
        category: "Accessories",
        subcategory: "Toilet"
      },
      {
        id: "10-005",
        code: "10-21-13.30",
        description: "Mirror - Wall Mounted, 24\"x36\"",
        unit: "ea",
        material: 125,
        labor: 85,
        equipment: 8,
        category: "Accessories",
        subcategory: "Mirrors"
      },
      {
        id: "10-006",
        code: "10-28-13.10",
        description: "Fire Extinguisher - 5 lb ABC",
        unit: "ea",
        material: 55,
        labor: 35,
        equipment: 3,
        category: "Safety Equipment",
        subcategory: "Fire"
      },
      {
        id: "10-007",
        code: "10-44-13.10",
        description: "Directory Board - Aluminum Frame",
        unit: "sqft",
        material: 48.50,
        labor: 28.75,
        equipment: 2.25,
        category: "Signage",
        subcategory: "Directories"
      },
      {
        id: "10-008",
        code: "10-51-13.10",
        description: "Metal Lockers - Single Tier",
        unit: "ea",
        material: 285,
        labor: 95,
        equipment: 12,
        category: "Storage",
        subcategory: "Lockers"
      },
      {
        id: "10-009",
        code: "10-73-13.10",
        description: "Flagpole - Aluminum, 25'",
        unit: "ea",
        material: 1850,
        labor: 625,
        equipment: 125,
        category: "Exterior Specialties",
        subcategory: "Flagpoles"
      },
      {
        id: "10-010",
        code: "10-22-13.10",
        description: "Folding Partition - Acoustic",
        unit: "sqft",
        material: 38.50,
        labor: 18.75,
        equipment: 2.25,
        category: "Partitions",
        subcategory: "Movable"
      }
    ]
  },

  // Division 11 - Equipment
  "11": {
    name: "Equipment",
    items: [
      {
        id: "11-001",
        code: "11-41-13.10",
        description: "Commercial Range - 6 Burner",
        unit: "ea",
        material: 3850,
        labor: 625,
        equipment: 125,
        category: "Kitchen Equipment",
        subcategory: "Cooking"
      },
      {
        id: "11-002",
        code: "11-41-13.20",
        description: "Commercial Oven - Convection",
        unit: "ea",
        material: 4250,
        labor: 725,
        equipment: 145,
        category: "Kitchen Equipment",
        subcategory: "Cooking"
      },
      {
        id: "11-003",
        code: "11-41-13.30",
        description: "Commercial Refrigerator - Reach-In",
        unit: "ea",
        material: 2850,
        labor: 485,
        equipment: 95,
        category: "Kitchen Equipment",
        subcategory: "Refrigeration"
      },
      {
        id: "11-004",
        code: "11-41-13.40",
        description: "Commercial Dishwasher - Undercounter",
        unit: "ea",
        material: 3250,
        labor: 585,
        equipment: 115,
        category: "Kitchen Equipment",
        subcategory: "Cleaning"
      },
      {
        id: "11-005",
        code: "11-52-13.10",
        description: "Washer/Dryer - Commercial, Stacked",
        unit: "ea",
        material: 2450,
        labor: 425,
        equipment: 85,
        category: "Laundry Equipment",
        subcategory: "Commercial"
      },
      {
        id: "11-006",
        code: "11-61-13.10",
        description: "Laboratory Casework - Base Cabinet",
        unit: "lf",
        material: 285,
        labor: 125,
        equipment: 15,
        category: "Laboratory Equipment",
        subcategory: "Casework"
      },
      {
        id: "11-007",
        code: "11-66-13.10",
        description: "Athletic Equipment - Basketball Hoop",
        unit: "ea",
        material: 1850,
        labor: 425,
        equipment: 85,
        category: "Athletic Equipment",
        subcategory: "Court"
      },
      {
        id: "11-008",
        code: "11-71-13.10",
        description: "Medical Exam Table",
        unit: "ea",
        material: 1450,
        labor: 225,
        equipment: 25,
        category: "Medical Equipment",
        subcategory: "Examination"
      }
    ]
  },

  // Division 12 - Furnishings
  "12": {
    name: "Furnishings",
    items: [
      {
        id: "12-001",
        code: "12-21-13.10",
        description: "Window Blinds - Aluminum, 1\"",
        unit: "sqft",
        material: 4.85,
        labor: 2.25,
        equipment: 0.15,
        category: "Window Treatments",
        subcategory: "Blinds"
      },
      {
        id: "12-002",
        code: "12-21-13.20",
        description: "Window Shades - Roller, Blackout",
        unit: "sqft",
        material: 6.25,
        labor: 2.85,
        equipment: 0.18,
        category: "Window Treatments",
        subcategory: "Shades"
      },
      {
        id: "12-003",
        code: "12-32-13.10",
        description: "Office Desk - Metal, Standard",
        unit: "ea",
        material: 485,
        labor: 85,
        equipment: 12,
        category: "Furniture",
        subcategory: "Office"
      },
      {
        id: "12-004",
        code: "12-32-13.20",
        description: "Office Chair - Ergonomic",
        unit: "ea",
        material: 325,
        labor: 25,
        equipment: 0,
        category: "Furniture",
        subcategory: "Seating"
      },
      {
        id: "12-005",
        code: "12-36-61.10",
        description: "Classroom Seating - Student Desk",
        unit: "ea",
        material: 185,
        labor: 35,
        equipment: 5,
        category: "Furniture",
        subcategory: "Educational"
      },
      {
        id: "12-006",
        code: "12-48-13.10",
        description: "Area Rugs - Commercial Grade",
        unit: "sqft",
        material: 12.50,
        labor: 2.85,
        equipment: 0.25,
        category: "Furnishings",
        subcategory: "Rugs"
      },
      {
        id: "12-007",
        code: "12-51-13.10",
        description: "Auditorium Seating - Fixed",
        unit: "ea",
        material: 425,
        labor: 125,
        equipment: 18,
        category: "Furniture",
        subcategory: "Assembly"
      }
    ]
  },

  // Division 13 - Special Construction
  "13": {
    name: "Special Construction",
    items: [
      {
        id: "13-001",
        code: "13-11-13.10",
        description: "Pre-Engineered Building - 40'x60'",
        unit: "sqft",
        material: 18.50,
        labor: 12.25,
        equipment: 3.75,
        category: "Pre-Engineered",
        subcategory: "Metal Building"
      },
      {
        id: "13-002",
        code: "13-12-13.10",
        description: "Greenhouse - Commercial Grade",
        unit: "sqft",
        material: 28.50,
        labor: 16.75,
        equipment: 2.85,
        category: "Special Structures",
        subcategory: "Greenhouse"
      },
      {
        id: "13-003",
        code: "13-24-13.10",
        description: "Fabric Structure - Tensile",
        unit: "sqft",
        material: 45.00,
        labor: 28.50,
        equipment: 4.25,
        category: "Special Structures",
        subcategory: "Fabric"
      },
      {
        id: "13-004",
        code: "13-34-13.10",
        description: "Storage Tank - Steel, 10,000 Gal",
        unit: "ea",
        material: 12500,
        labor: 3850,
        equipment: 1250,
        category: "Storage",
        subcategory: "Tanks"
      },
      {
        id: "13-005",
        code: "13-49-13.10",
        description: "Radiation Shielding - Lead, 1/8\"",
        unit: "sqft",
        material: 48.50,
        labor: 28.75,
        equipment: 3.25,
        category: "Special Construction",
        subcategory: "Shielding"
      }
    ]
  },

  // Division 14 - Conveying Equipment
  "14": {
    name: "Conveying Equipment",
    items: [
      {
        id: "14-001",
        code: "14-21-13.10",
        description: "Hydraulic Elevator - 2500 lb, 4 Stop",
        unit: "ea",
        material: 65000,
        labor: 22500,
        equipment: 4850,
        category: "Elevators",
        subcategory: "Hydraulic"
      },
      {
        id: "14-002",
        code: "14-21-23.10",
        description: "Traction Elevator - 3500 lb, 6 Stop",
        unit: "ea",
        material: 95000,
        labor: 32500,
        equipment: 6850,
        category: "Elevators",
        subcategory: "Traction"
      },
      {
        id: "14-003",
        code: "14-31-13.10",
        description: "Escalator - 32\" Wide, 12' Rise",
        unit: "ea",
        material: 125000,
        labor: 38500,
        equipment: 8250,
        category: "Escalators",
        subcategory: "Moving Walkways"
      },
      {
        id: "14-004",
        code: "14-42-13.10",
        description: "Wheelchair Lift - Vertical",
        unit: "ea",
        material: 18500,
        labor: 4250,
        equipment: 850,
        category: "Lifts",
        subcategory: "Accessibility"
      },
      {
        id: "14-005",
        code: "14-91-13.10",
        description: "Material Lift - Construction Hoist",
        unit: "month",
        material: 4850,
        labor: 1250,
        equipment: 625,
        category: "Lifts",
        subcategory: "Material"
      }
    ]
  },

  // Division 21 - Fire Suppression
  "21": {
    name: "Fire Suppression",
    items: [
      {
        id: "21-001",
        code: "21-13-13.10",
        description: "Wet Pipe Sprinkler System - Light Hazard",
        unit: "sqft",
        material: 3.25,
        labor: 4.75,
        equipment: 0.45,
        category: "Sprinkler Systems",
        subcategory: "Wet Pipe"
      },
      {
        id: "21-002",
        code: "21-13-13.20",
        description: "Wet Pipe Sprinkler System - Ordinary Hazard",
        unit: "sqft",
        material: 4.15,
        labor: 5.85,
        equipment: 0.55,
        category: "Sprinkler Systems",
        subcategory: "Wet Pipe"
      },
      {
        id: "21-003",
        code: "21-13-16.10",
        description: "Dry Pipe Sprinkler System",
        unit: "sqft",
        material: 5.25,
        labor: 7.50,
        equipment: 0.75,
        category: "Sprinkler Systems",
        subcategory: "Dry Pipe"
      },
      {
        id: "21-004",
        code: "21-12-19.10",
        description: "Fire Extinguisher - 10 lb ABC",
        unit: "ea",
        material: 85,
        labor: 45,
        equipment: 5,
        category: "Fire Extinguishers",
        subcategory: "Portable"
      },
      {
        id: "21-005",
        code: "21-12-19.20",
        description: "Fire Extinguisher Cabinet - Surface Mount",
        unit: "ea",
        material: 125,
        labor: 95,
        equipment: 8,
        category: "Fire Extinguishers",
        subcategory: "Cabinets"
      }
    ]
  },

  // Division 22 - Plumbing
  "22": {
    name: "Plumbing",
    items: [
      {
        id: "22-001",
        code: "22-11-16.13",
        description: "Copper Pipe - Type L, 1/2\"",
        unit: "lf",
        material: 4.25,
        labor: 6.85,
        equipment: 0.55,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-002",
        code: "22-11-16.23",
        description: "Copper Pipe - Type L, 3/4\"",
        unit: "lf",
        material: 6.50,
        labor: 7.50,
        equipment: 0.65,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-003",
        code: "22-11-16.33",
        description: "Copper Pipe - Type L, 1\"",
        unit: "lf",
        material: 9.25,
        labor: 8.75,
        equipment: 0.75,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-004",
        code: "22-11-19.13",
        description: "PVC Pipe - Schedule 40, 2\"",
        unit: "lf",
        material: 2.85,
        labor: 5.25,
        equipment: 0.45,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-005",
        code: "22-11-19.23",
        description: "PVC Pipe - Schedule 40, 4\"",
        unit: "lf",
        material: 4.75,
        labor: 6.50,
        equipment: 0.55,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-006",
        code: "22-42-13.10",
        description: "Water Closet - Vitreous China, Floor Mount",
        unit: "ea",
        material: 385,
        labor: 285,
        equipment: 25,
        category: "Fixtures",
        subcategory: "Toilets"
      },
      {
        id: "22-007",
        code: "22-42-13.20",
        description: "Lavatory - Vitreous China, Wall Hung",
        unit: "ea",
        material: 285,
        labor: 225,
        equipment: 20,
        category: "Fixtures",
        subcategory: "Lavatories"
      },
      {
        id: "22-008",
        code: "22-42-13.30",
        description: "Kitchen Sink - Stainless Steel, Double Bowl",
        unit: "ea",
        material: 425,
        labor: 275,
        equipment: 22,
        category: "Fixtures",
        subcategory: "Sinks"
      },
      {
        id: "22-009",
        code: "22-33-30.13",
        description: "Water Heater - Electric, 50 Gallon",
        unit: "ea",
        material: 825,
        labor: 485,
        equipment: 45,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-010",
        code: "22-33-30.23",
        description: "Water Heater - Gas, 75 Gallon",
        unit: "ea",
        material: 1250,
        labor: 625,
        equipment: 65,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-011",
        code: "22-11-16.43",
        description: "Copper Pipe - Type L, 2\"",
        unit: "lf",
        material: 16.50,
        labor: 12.25,
        equipment: 1.05,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-012",
        code: "22-11-19.33",
        description: "PVC Pipe - Schedule 40, 6\"",
        unit: "lf",
        material: 8.25,
        labor: 9.50,
        equipment: 0.85,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-013",
        code: "22-40-13.10",
        description: "Plumbing Fixture - Urinal, Wall Hung",
        unit: "ea",
        material: 425,
        labor: 325,
        equipment: 28,
        category: "Fixtures",
        subcategory: "Urinals"
      },
      {
        id: "22-014",
        code: "22-41-13.10",
        description: "Drinking Fountain - Wall Mount",
        unit: "ea",
        material: 585,
        labor: 285,
        equipment: 25,
        category: "Fixtures",
        subcategory: "Fountains"
      },
      {
        id: "22-015",
        code: "22-42-39.10",
        description: "Shower - Fiberglass, One Piece",
        unit: "ea",
        material: 685,
        labor: 425,
        equipment: 45,
        category: "Fixtures",
        subcategory: "Showers"
      },
      {
        id: "22-016",
        code: "22-11-13.11",
        description: "Copper Pipe - Type L, 1/2\"",
        unit: "lf",
        material: 3.85,
        labor: 4.25,
        equipment: 0.35,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-017",
        code: "22-11-13.12",
        description: "Copper Pipe - Type L, 3/4\"",
        unit: "lf",
        material: 5.25,
        labor: 4.85,
        equipment: 0.42,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-018",
        code: "22-11-13.13",
        description: "Copper Pipe - Type L, 1\"",
        unit: "lf",
        material: 8.50,
        labor: 5.85,
        equipment: 0.55,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-019",
        code: "22-11-13.14",
        description: "Copper Pipe - Type L, 1-1/2\"",
        unit: "lf",
        material: 14.25,
        labor: 7.25,
        equipment: 0.75,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-020",
        code: "22-11-13.15",
        description: "Copper Pipe - Type L, 2\"",
        unit: "lf",
        material: 18.50,
        labor: 8.85,
        equipment: 0.95,
        category: "Piping",
        subcategory: "Copper"
      },
      {
        id: "22-021",
        code: "22-13-16.11",
        description: "PVC Pipe - Schedule 40, 2\"",
        unit: "lf",
        material: 2.85,
        labor: 3.25,
        equipment: 0.25,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-022",
        code: "22-13-16.12",
        description: "PVC Pipe - Schedule 40, 3\"",
        unit: "lf",
        material: 4.25,
        labor: 3.85,
        equipment: 0.32,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-023",
        code: "22-13-16.13",
        description: "PVC Pipe - Schedule 40, 4\"",
        unit: "lf",
        material: 5.85,
        labor: 4.45,
        equipment: 0.38,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-024",
        code: "22-13-16.14",
        description: "PVC Pipe - Schedule 40, 6\"",
        unit: "lf",
        material: 10.50,
        labor: 6.25,
        equipment: 0.58,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-025",
        code: "22-13-16.15",
        description: "PVC Pipe - Schedule 40, 8\"",
        unit: "lf",
        material: 16.25,
        labor: 8.50,
        equipment: 0.85,
        category: "Piping",
        subcategory: "PVC"
      },
      {
        id: "22-026",
        code: "22-11-19.11",
        description: "PEX Tubing - 1/2\"",
        unit: "lf",
        material: 1.25,
        labor: 2.45,
        equipment: 0.18,
        category: "Piping",
        subcategory: "PEX"
      },
      {
        id: "22-027",
        code: "22-11-19.12",
        description: "PEX Tubing - 3/4\"",
        unit: "lf",
        material: 1.85,
        labor: 2.85,
        equipment: 0.22,
        category: "Piping",
        subcategory: "PEX"
      },
      {
        id: "22-028",
        code: "22-11-19.13",
        description: "PEX Tubing - 1\"",
        unit: "lf",
        material: 2.85,
        labor: 3.45,
        equipment: 0.28,
        category: "Piping",
        subcategory: "PEX"
      },
      {
        id: "22-029",
        code: "22-13-23.11",
        description: "Cast Iron Pipe - No-Hub, 2\"",
        unit: "lf",
        material: 12.50,
        labor: 8.25,
        equipment: 0.75,
        category: "Piping",
        subcategory: "Cast Iron"
      },
      {
        id: "22-030",
        code: "22-13-23.12",
        description: "Cast Iron Pipe - No-Hub, 3\"",
        unit: "lf",
        material: 16.85,
        labor: 10.25,
        equipment: 0.95,
        category: "Piping",
        subcategory: "Cast Iron"
      },
      {
        id: "22-031",
        code: "22-13-23.13",
        description: "Cast Iron Pipe - No-Hub, 4\"",
        unit: "lf",
        material: 21.50,
        labor: 12.50,
        equipment: 1.15,
        category: "Piping",
        subcategory: "Cast Iron"
      },
      {
        id: "22-032",
        code: "22-41-13.11",
        description: "Water Closet - Floor Mount, Standard",
        unit: "ea",
        material: 285,
        labor: 285,
        equipment: 25,
        category: "Fixtures",
        subcategory: "Water Closets"
      },
      {
        id: "22-033",
        code: "22-41-13.12",
        description: "Water Closet - Floor Mount, ADA",
        unit: "ea",
        material: 425,
        labor: 325,
        equipment: 28,
        category: "Fixtures",
        subcategory: "Water Closets"
      },
      {
        id: "22-034",
        code: "22-41-13.13",
        description: "Water Closet - Wall Hung, Commercial",
        unit: "ea",
        material: 625,
        labor: 485,
        equipment: 45,
        category: "Fixtures",
        subcategory: "Water Closets"
      },
      {
        id: "22-035",
        code: "22-42-13.11",
        description: "Lavatory - Wall Hung, 19\"x17\"",
        unit: "ea",
        material: 285,
        labor: 245,
        equipment: 22,
        category: "Fixtures",
        subcategory: "Lavatories"
      },
      {
        id: "22-036",
        code: "22-42-13.12",
        description: "Lavatory - Countertop, Undermount",
        unit: "ea",
        material: 325,
        labor: 285,
        equipment: 25,
        category: "Fixtures",
        subcategory: "Lavatories"
      },
      {
        id: "22-037",
        code: "22-42-13.21",
        description: "Sink - Kitchen, Stainless Steel, Double Bowl",
        unit: "ea",
        material: 485,
        labor: 325,
        equipment: 28,
        category: "Fixtures",
        subcategory: "Sinks"
      },
      {
        id: "22-038",
        code: "22-42-13.22",
        description: "Sink - Service, Mop, Floor Mounted",
        unit: "ea",
        material: 625,
        labor: 485,
        equipment: 45,
        category: "Fixtures",
        subcategory: "Sinks"
      },
      {
        id: "22-039",
        code: "22-41-16.11",
        description: "Urinal - Wall Hung, Vitreous China",
        unit: "ea",
        material: 585,
        labor: 425,
        equipment: 38,
        category: "Fixtures",
        subcategory: "Urinals"
      },
      {
        id: "22-040",
        code: "22-41-16.12",
        description: "Urinal - Floor Mounted, Blowout",
        unit: "ea",
        material: 725,
        labor: 525,
        equipment: 48,
        category: "Fixtures",
        subcategory: "Urinals"
      },
      {
        id: "22-041",
        code: "22-33-30.11",
        description: "Water Heater - Electric, 40 Gal, Residential",
        unit: "ea",
        material: 625,
        labor: 385,
        equipment: 35,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-042",
        code: "22-33-30.12",
        description: "Water Heater - Electric, 80 Gal, Commercial",
        unit: "ea",
        material: 1850,
        labor: 725,
        equipment: 85,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-043",
        code: "22-33-30.21",
        description: "Water Heater - Gas, 50 Gal, Residential",
        unit: "ea",
        material: 725,
        labor: 485,
        equipment: 45,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-044",
        code: "22-33-30.22",
        description: "Water Heater - Gas, 100 Gal, Commercial",
        unit: "ea",
        material: 2850,
        labor: 1250,
        equipment: 145,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-045",
        code: "22-33-30.31",
        description: "Water Heater - Tankless, Gas, Residential",
        unit: "ea",
        material: 1250,
        labor: 625,
        equipment: 55,
        category: "Equipment",
        subcategory: "Water Heaters"
      },
      {
        id: "22-046",
        code: "22-14-26.11",
        description: "Sump Pump - 1/2 HP, Submersible",
        unit: "ea",
        material: 385,
        labor: 285,
        equipment: 25,
        category: "Equipment",
        subcategory: "Pumps"
      },
      {
        id: "22-047",
        code: "22-14-26.12",
        description: "Sump Pump - 3/4 HP, Cast Iron",
        unit: "ea",
        material: 625,
        labor: 385,
        equipment: 35,
        category: "Equipment",
        subcategory: "Pumps"
      },
      {
        id: "22-048",
        code: "22-15-13.11",
        description: "Circulating Pump - Hot Water, 1/12 HP",
        unit: "ea",
        material: 425,
        labor: 325,
        equipment: 28,
        category: "Equipment",
        subcategory: "Pumps"
      }
    ]
  },

  // Division 23 - HVAC
  "23": {
    name: "HVAC",
    items: [
      {
        id: "23-001",
        code: "23-33-13.10",
        description: "Split System AC - 3 Ton",
        unit: "ea",
        material: 2850,
        labor: 1250,
        equipment: 185,
        category: "Air Conditioning",
        subcategory: "Split Systems"
      },
      {
        id: "23-002",
        code: "23-33-13.20",
        description: "Split System AC - 5 Ton",
        unit: "ea",
        material: 4250,
        labor: 1650,
        equipment: 245,
        category: "Air Conditioning",
        subcategory: "Split Systems"
      },
      {
        id: "23-003",
        code: "23-37-13.10",
        description: "Rooftop Unit - 10 Ton, Gas Heat",
        unit: "ea",
        material: 8500,
        labor: 3250,
        equipment: 625,
        category: "Packaged Units",
        subcategory: "Rooftop"
      },
      {
        id: "23-004",
        code: "23-31-13.10",
        description: "Sheet Metal Ductwork - Galvanized, Rectangular",
        unit: "lb",
        material: 3.25,
        labor: 4.85,
        equipment: 0.45,
        category: "Ductwork",
        subcategory: "Sheet Metal"
      },
      {
        id: "23-005",
        code: "23-33-00.13",
        description: "Flexible Duct - 6\" Diameter, Insulated",
        unit: "lf",
        material: 3.85,
        labor: 2.25,
        equipment: 0.20,
        category: "Ductwork",
        subcategory: "Flexible"
      },
      {
        id: "23-006",
        code: "23-37-13.30",
        description: "Diffuser - Ceiling, 24\"x24\"",
        unit: "ea",
        material: 125,
        labor: 85,
        equipment: 8,
        category: "Air Distribution",
        subcategory: "Diffusers"
      },
      {
        id: "23-007",
        code: "23-37-13.40",
        description: "Return Grille - 24\"x24\"",
        unit: "ea",
        material: 95,
        labor: 75,
        equipment: 6,
        category: "Air Distribution",
        subcategory: "Grilles"
      },
      {
        id: "23-008",
        code: "23-21-13.10",
        description: "Boiler - Gas Fired, 1000 MBH",
        unit: "ea",
        material: 18500,
        labor: 6500,
        equipment: 1250,
        category: "Heating Equipment",
        subcategory: "Boilers"
      },
      {
        id: "23-009",
        code: "23-22-13.10",
        description: "Furnace - Gas, 100 MBH",
        unit: "ea",
        material: 1850,
        labor: 825,
        equipment: 95,
        category: "Heating Equipment",
        subcategory: "Furnaces"
      },
      {
        id: "23-010",
        code: "23-33-13.30",
        description: "Heat Pump - 4 Ton, Split System",
        unit: "ea",
        material: 3650,
        labor: 1425,
        equipment: 215,
        category: "Air Conditioning",
        subcategory: "Heat Pumps"
      },
      {
        id: "23-011",
        code: "23-34-23.10",
        description: "Air Handler - 5 Ton",
        unit: "ea",
        material: 2450,
        labor: 825,
        equipment: 125,
        category: "Air Distribution",
        subcategory: "Air Handlers"
      },
      {
        id: "23-012",
        code: "23-31-13.20",
        description: "Ductwork Insulation - Fiberglass, 2\"",
        unit: "sqft",
        material: 1.85,
        labor: 1.25,
        equipment: 0.12,
        category: "Ductwork",
        subcategory: "Insulation"
      },
      {
        id: "23-013",
        code: "23-37-13.50",
        description: "VAV Box - Variable Air Volume",
        unit: "ea",
        material: 1250,
        labor: 425,
        equipment: 65,
        category: "Air Distribution",
        subcategory: "Controls"
      },
      {
        id: "23-014",
        code: "23-23-13.10",
        description: "Refrigeration Unit - Walk-In Cooler",
        unit: "ea",
        material: 8500,
        labor: 2850,
        equipment: 625,
        category: "Refrigeration",
        subcategory: "Walk-In"
      },
      {
        id: "23-015",
        code: "23-74-13.11",
        description: "Rooftop Unit - Gas/Electric, 3 Ton",
        unit: "ea",
        material: 4850,
        labor: 1850,
        equipment: 285,
        category: "Equipment",
        subcategory: "RTU"
      },
      {
        id: "23-016",
        code: "23-74-13.12",
        description: "Rooftop Unit - Gas/Electric, 5 Ton",
        unit: "ea",
        material: 6850,
        labor: 2450,
        equipment: 385,
        category: "Equipment",
        subcategory: "RTU"
      },
      {
        id: "23-017",
        code: "23-74-13.13",
        description: "Rooftop Unit - Gas/Electric, 10 Ton",
        unit: "ea",
        material: 12500,
        labor: 3850,
        equipment: 625,
        category: "Equipment",
        subcategory: "RTU"
      },
      {
        id: "23-018",
        code: "23-74-13.14",
        description: "Rooftop Unit - Gas/Electric, 15 Ton",
        unit: "ea",
        material: 18500,
        labor: 5250,
        equipment: 925,
        category: "Equipment",
        subcategory: "RTU"
      },
      {
        id: "23-019",
        code: "23-81-13.11",
        description: "Split System - AC Condenser, 2 Ton",
        unit: "ea",
        material: 1850,
        labor: 725,
        equipment: 85,
        category: "Equipment",
        subcategory: "Split System"
      },
      {
        id: "23-020",
        code: "23-81-13.12",
        description: "Split System - AC Condenser, 3 Ton",
        unit: "ea",
        material: 2450,
        labor: 925,
        equipment: 125,
        category: "Equipment",
        subcategory: "Split System"
      },
      {
        id: "23-021",
        code: "23-81-13.13",
        description: "Split System - Air Handler, 2 Ton",
        unit: "ea",
        material: 1250,
        labor: 625,
        equipment: 75,
        category: "Equipment",
        subcategory: "Split System"
      },
      {
        id: "23-022",
        code: "23-81-13.14",
        description: "Split System - Air Handler, 3 Ton",
        unit: "ea",
        material: 1650,
        labor: 785,
        equipment: 95,
        category: "Equipment",
        subcategory: "Split System"
      },
      {
        id: "23-023",
        code: "23-52-13.11",
        description: "Gas Furnace - 80% AFUE, 60,000 BTU",
        unit: "ea",
        material: 1250,
        labor: 625,
        equipment: 65,
        category: "Equipment",
        subcategory: "Furnaces"
      },
      {
        id: "23-024",
        code: "23-52-13.12",
        description: "Gas Furnace - 95% AFUE, 100,000 BTU",
        unit: "ea",
        material: 2450,
        labor: 925,
        equipment: 105,
        category: "Equipment",
        subcategory: "Furnaces"
      },
      {
        id: "23-025",
        code: "23-54-13.11",
        description: "Boiler - Gas, 100 MBH, Cast Iron",
        unit: "ea",
        material: 4850,
        labor: 2450,
        equipment: 385,
        category: "Equipment",
        subcategory: "Boilers"
      },
      {
        id: "23-026",
        code: "23-54-13.12",
        description: "Boiler - Gas, 200 MBH, Cast Iron",
        unit: "ea",
        material: 8500,
        labor: 3850,
        equipment: 625,
        category: "Equipment",
        subcategory: "Boilers"
      },
      {
        id: "23-027",
        code: "23-64-13.11",
        description: "Chiller - Air Cooled, 20 Ton",
        unit: "ea",
        material: 18500,
        labor: 6850,
        equipment: 1250,
        category: "Equipment",
        subcategory: "Chillers"
      },
      {
        id: "23-028",
        code: "23-31-13.11",
        description: "Ductwork - Rectangular, 12\"x8\", Galvanized",
        unit: "lbf",
        material: 8.50,
        labor: 12.25,
        equipment: 1.15,
        category: "Ductwork",
        subcategory: "Rectangular"
      },
      {
        id: "23-029",
        code: "23-31-13.12",
        description: "Ductwork - Rectangular, 18\"x12\", Galvanized",
        unit: "lbf",
        material: 9.85,
        labor: 14.50,
        equipment: 1.35,
        category: "Ductwork",
        subcategory: "Rectangular"
      },
      {
        id: "23-030",
        code: "23-31-13.13",
        description: "Ductwork - Rectangular, 24\"x16\", Galvanized",
        unit: "lbf",
        material: 11.50,
        labor: 16.85,
        equipment: 1.55,
        category: "Ductwork",
        subcategory: "Rectangular"
      },
      {
        id: "23-031",
        code: "23-31-13.14",
        description: "Ductwork - Rectangular, 30\"x20\", Galvanized",
        unit: "lbf",
        material: 13.25,
        labor: 18.50,
        equipment: 1.75,
        category: "Ductwork",
        subcategory: "Rectangular"
      },
      {
        id: "23-032",
        code: "23-31-13.21",
        description: "Ductwork - Round, 6\" Diameter, Galvanized",
        unit: "lbf",
        material: 5.85,
        labor: 8.25,
        equipment: 0.75,
        category: "Ductwork",
        subcategory: "Round"
      },
      {
        id: "23-033",
        code: "23-31-13.22",
        description: "Ductwork - Round, 8\" Diameter, Galvanized",
        unit: "lbf",
        material: 6.50,
        labor: 9.25,
        equipment: 0.85,
        category: "Ductwork",
        subcategory: "Round"
      },
      {
        id: "23-034",
        code: "23-31-13.23",
        description: "Ductwork - Round, 10\" Diameter, Galvanized",
        unit: "lbf",
        material: 7.25,
        labor: 10.50,
        equipment: 0.95,
        category: "Ductwork",
        subcategory: "Round"
      },
      {
        id: "23-035",
        code: "23-31-13.24",
        description: "Ductwork - Round, 12\" Diameter, Galvanized",
        unit: "lbf",
        material: 8.50,
        labor: 12.25,
        equipment: 1.15,
        category: "Ductwork",
        subcategory: "Round"
      },
      {
        id: "23-036",
        code: "23-31-13.31",
        description: "Ductwork - Flex, 6\" Diameter, Insulated",
        unit: "lbf",
        material: 3.85,
        labor: 5.25,
        equipment: 0.45,
        category: "Ductwork",
        subcategory: "Flex"
      },
      {
        id: "23-037",
        code: "23-31-13.32",
        description: "Ductwork - Flex, 8\" Diameter, Insulated",
        unit: "lbf",
        material: 4.85,
        labor: 6.25,
        equipment: 0.55,
        category: "Ductwork",
        subcategory: "Flex"
      },
      {
        id: "23-038",
        code: "23-31-13.33",
        description: "Ductwork - Flex, 10\" Diameter, Insulated",
        unit: "lbf",
        material: 5.85,
        labor: 7.25,
        equipment: 0.65,
        category: "Ductwork",
        subcategory: "Flex"
      },
      {
        id: "23-039",
        code: "23-37-13.11",
        description: "Diffuser - Ceiling, 2-Way, 12\"x12\"",
        unit: "ea",
        material: 45,
        labor: 65,
        equipment: 5,
        category: "Air Distribution",
        subcategory: "Diffusers"
      },
      {
        id: "23-040",
        code: "23-37-13.12",
        description: "Diffuser - Ceiling, 4-Way, 24\"x24\"",
        unit: "ea",
        material: 125,
        labor: 95,
        equipment: 8,
        category: "Air Distribution",
        subcategory: "Diffusers"
      },
      {
        id: "23-041",
        code: "23-37-13.21",
        description: "Grille - Return Air, 12\"x12\"",
        unit: "ea",
        material: 35,
        labor: 55,
        equipment: 4,
        category: "Air Distribution",
        subcategory: "Grilles"
      },
      {
        id: "23-042",
        code: "23-37-13.22",
        description: "Grille - Return Air, 24\"x24\"",
        unit: "ea",
        material: 85,
        labor: 75,
        equipment: 6,
        category: "Air Distribution",
        subcategory: "Grilles"
      },
      {
        id: "23-043",
        code: "23-09-13.11",
        description: "Thermostat - Programmable, Single Zone",
        unit: "ea",
        material: 125,
        labor: 185,
        equipment: 12,
        category: "Controls",
        subcategory: "Thermostats"
      },
      {
        id: "23-044",
        code: "23-09-13.12",
        description: "Thermostat - Smart, WiFi Enabled",
        unit: "ea",
        material: 245,
        labor: 225,
        equipment: 15,
        category: "Controls",
        subcategory: "Thermostats"
      },
      {
        id: "23-045",
        code: "23-09-13.13",
        description: "Thermostat - Commercial, DDC Controller",
        unit: "ea",
        material: 625,
        labor: 425,
        equipment: 35,
        category: "Controls",
        subcategory: "Thermostats"
      }
    ]
  },

  // Division 26 - Electrical
  "26": {
    name: "Electrical",
    items: [
      {
        id: "26-001",
        code: "26-05-19.10",
        description: "EMT Conduit - 1/2\"",
        unit: "lf",
        material: 1.85,
        labor: 3.25,
        equipment: 0.25,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-002",
        code: "26-05-19.20",
        description: "EMT Conduit - 3/4\"",
        unit: "lf",
        material: 2.45,
        labor: 3.75,
        equipment: 0.28,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-003",
        code: "26-05-19.30",
        description: "EMT Conduit - 1\"",
        unit: "lf",
        material: 3.25,
        labor: 4.50,
        equipment: 0.35,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-004",
        code: "26-05-33.13",
        description: "Wire - THHN/THWN, #12 AWG",
        unit: "lf",
        material: 0.35,
        labor: 0.25,
        equipment: 0.02,
        category: "Wire",
        subcategory: "Building Wire"
      },
      {
        id: "26-005",
        code: "26-05-33.23",
        description: "Wire - THHN/THWN, #10 AWG",
        unit: "lf",
        material: 0.55,
        labor: 0.28,
        equipment: 0.02,
        category: "Wire",
        subcategory: "Building Wire"
      },
      {
        id: "26-006",
        code: "26-24-13.10",
        description: "Panelboard - 225A, 42 Circuit",
        unit: "ea",
        material: 1850,
        labor: 825,
        equipment: 95,
        category: "Panels",
        subcategory: "Distribution"
      },
      {
        id: "26-007",
        code: "26-27-13.10",
        description: "Receptacle - Duplex, 20A, 120V",
        unit: "ea",
        material: 8.50,
        labor: 28.50,
        equipment: 2.25,
        category: "Devices",
        subcategory: "Receptacles"
      },
      {
        id: "26-008",
        code: "26-27-13.20",
        description: "Switch - Single Pole, 20A",
        unit: "ea",
        material: 6.25,
        labor: 26.50,
        equipment: 2.15,
        category: "Devices",
        subcategory: "Switches"
      },
      {
        id: "26-009",
        code: "26-51-13.10",
        description: "LED Fixture - 2'x4' Recessed Troffer",
        unit: "ea",
        material: 125,
        labor: 95,
        equipment: 8,
        category: "Lighting",
        subcategory: "Interior"
      },
      {
        id: "26-010",
        code: "26-56-13.10",
        description: "Exit Sign - LED, Battery Backup",
        unit: "ea",
        material: 95,
        labor: 75,
        equipment: 6,
        category: "Lighting",
        subcategory: "Emergency"
      },
      {
        id: "26-011",
        code: "26-05-33.33",
        description: "Wire - THHN/THWN, #8 AWG",
        unit: "lf",
        material: 0.75,
        labor: 0.32,
        equipment: 0.03,
        category: "Wire",
        subcategory: "Building Wire"
      },
      {
        id: "26-012",
        code: "26-05-33.43",
        description: "Wire - THHN/THWN, #6 AWG",
        unit: "lf",
        material: 1.15,
        labor: 0.38,
        equipment: 0.04,
        category: "Wire",
        subcategory: "Building Wire"
      },
      {
        id: "26-013",
        code: "26-05-19.40",
        description: "EMT Conduit - 2\"",
        unit: "lf",
        material: 6.50,
        labor: 6.85,
        equipment: 0.55,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-014",
        code: "26-27-13.30",
        description: "GFCI Receptacle - 20A, 120V",
        unit: "ea",
        material: 18.50,
        labor: 32.00,
        equipment: 2.50,
        category: "Devices",
        subcategory: "Receptacles"
      },
      {
        id: "26-015",
        code: "26-27-13.40",
        description: "Dimmer Switch - 600W",
        unit: "ea",
        material: 28.50,
        labor: 35.00,
        equipment: 2.75,
        category: "Devices",
        subcategory: "Switches"
      },
      {
        id: "26-016",
        code: "26-51-13.20",
        description: "LED High Bay - 150W",
        unit: "ea",
        material: 185,
        labor: 125,
        equipment: 12,
        category: "Lighting",
        subcategory: "Industrial"
      },
      {
        id: "26-017",
        code: "26-52-13.10",
        description: "Exterior LED Wall Pack - 60W",
        unit: "ea",
        material: 145,
        labor: 95,
        equipment: 10,
        category: "Lighting",
        subcategory: "Exterior"
      },
      {
        id: "26-018",
        code: "26-41-13.10",
        description: "Generator - Diesel, 100kW",
        unit: "ea",
        material: 28500,
        labor: 8500,
        equipment: 2250,
        category: "Power Generation",
        subcategory: "Generators"
      },
      {
        id: "26-019",
        code: "26-24-13.11",
        description: "Panel Board - 100A, 120/208V, 3-Phase",
        unit: "ea",
        material: 1250,
        labor: 625,
        equipment: 65,
        category: "Panels",
        subcategory: "Panel Boards"
      },
      {
        id: "26-020",
        code: "26-24-13.12",
        description: "Panel Board - 200A, 120/208V, 3-Phase",
        unit: "ea",
        material: 1850,
        labor: 925,
        equipment: 95,
        category: "Panels",
        subcategory: "Panel Boards"
      },
      {
        id: "26-021",
        code: "26-24-13.13",
        description: "Panel Board - 400A, 120/208V, 3-Phase",
        unit: "ea",
        material: 3850,
        labor: 1650,
        equipment: 185,
        category: "Panels",
        subcategory: "Panel Boards"
      },
      {
        id: "26-022",
        code: "26-24-13.14",
        description: "Panel Board - 600A, 120/208V, 3-Phase",
        unit: "ea",
        material: 6850,
        labor: 2850,
        equipment: 325,
        category: "Panels",
        subcategory: "Panel Boards"
      },
      {
        id: "26-023",
        code: "26-24-16.11",
        description: "Main Distribution Panel - 800A",
        unit: "ea",
        material: 12500,
        labor: 4850,
        equipment: 625,
        category: "Panels",
        subcategory: "Distribution"
      },
      {
        id: "26-024",
        code: "26-24-16.12",
        description: "Main Distribution Panel - 1200A",
        unit: "ea",
        material: 18500,
        labor: 6850,
        equipment: 925,
        category: "Panels",
        subcategory: "Distribution"
      },
      {
        id: "26-025",
        code: "26-05-19.11",
        description: "Wire - THHN, #12 AWG, Copper",
        unit: "lf",
        material: 0.45,
        labor: 0.85,
        equipment: 0.08,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-026",
        code: "26-05-19.12",
        description: "Wire - THHN, #10 AWG, Copper",
        unit: "lf",
        material: 0.75,
        labor: 0.95,
        equipment: 0.10,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-027",
        code: "26-05-19.13",
        description: "Wire - THHN, #8 AWG, Copper",
        unit: "lf",
        material: 1.25,
        labor: 1.15,
        equipment: 0.12,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-028",
        code: "26-05-19.14",
        description: "Wire - THHN, #6 AWG, Copper",
        unit: "lf",
        material: 1.95,
        labor: 1.45,
        equipment: 0.15,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-029",
        code: "26-05-19.15",
        description: "Wire - THHN, #4 AWG, Copper",
        unit: "lf",
        material: 2.85,
        labor: 1.85,
        equipment: 0.18,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-030",
        code: "26-05-19.16",
        description: "Wire - THHN, #2 AWG, Copper",
        unit: "lf",
        material: 4.25,
        labor: 2.25,
        equipment: 0.22,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-031",
        code: "26-05-19.17",
        description: "Wire - THHN, #1/0 AWG, Copper",
        unit: "lf",
        material: 6.85,
        labor: 2.85,
        equipment: 0.28,
        category: "Wire & Cable",
        subcategory: "Building Wire"
      },
      {
        id: "26-032",
        code: "26-05-33.11",
        description: "Conduit - EMT, 1/2\"",
        unit: "lf",
        material: 1.25,
        labor: 2.45,
        equipment: 0.18,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-033",
        code: "26-05-33.12",
        description: "Conduit - EMT, 3/4\"",
        unit: "lf",
        material: 1.65,
        labor: 2.85,
        equipment: 0.22,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-034",
        code: "26-05-33.13",
        description: "Conduit - EMT, 1\"",
        unit: "lf",
        material: 2.25,
        labor: 3.45,
        equipment: 0.28,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-035",
        code: "26-05-33.14",
        description: "Conduit - EMT, 1-1/2\"",
        unit: "lf",
        material: 3.85,
        labor: 4.85,
        equipment: 0.42,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-036",
        code: "26-05-33.15",
        description: "Conduit - EMT, 2\"",
        unit: "lf",
        material: 5.25,
        labor: 5.85,
        equipment: 0.55,
        category: "Conduit",
        subcategory: "EMT"
      },
      {
        id: "26-037",
        code: "26-05-33.21",
        description: "Conduit - Rigid Steel, 1/2\"",
        unit: "lf",
        material: 2.85,
        labor: 3.85,
        equipment: 0.32,
        category: "Conduit",
        subcategory: "Rigid"
      },
      {
        id: "26-038",
        code: "26-05-33.22",
        description: "Conduit - Rigid Steel, 3/4\"",
        unit: "lf",
        material: 3.45,
        labor: 4.45,
        equipment: 0.38,
        category: "Conduit",
        subcategory: "Rigid"
      },
      {
        id: "26-039",
        code: "26-05-33.23",
        description: "Conduit - Rigid Steel, 1\"",
        unit: "lf",
        material: 4.85,
        labor: 5.85,
        equipment: 0.52,
        category: "Conduit",
        subcategory: "Rigid"
      },
      {
        id: "26-040",
        code: "26-05-33.31",
        description: "Conduit - PVC Schedule 40, 1/2\"",
        unit: "lf",
        material: 0.85,
        labor: 1.85,
        equipment: 0.15,
        category: "Conduit",
        subcategory: "PVC"
      },
      {
        id: "26-041",
        code: "26-05-33.32",
        description: "Conduit - PVC Schedule 40, 3/4\"",
        unit: "lf",
        material: 1.15,
        labor: 2.15,
        equipment: 0.18,
        category: "Conduit",
        subcategory: "PVC"
      },
      {
        id: "26-042",
        code: "26-05-33.33",
        description: "Conduit - PVC Schedule 40, 1\"",
        unit: "lf",
        material: 1.65,
        labor: 2.65,
        equipment: 0.22,
        category: "Conduit",
        subcategory: "PVC"
      },
      {
        id: "26-043",
        code: "26-51-13.11",
        description: "LED Fixture - 2x2 Troffer, 3500 Lumens",
        unit: "ea",
        material: 125,
        labor: 185,
        equipment: 15,
        category: "Lighting",
        subcategory: "LED"
      },
      {
        id: "26-044",
        code: "26-51-13.12",
        description: "LED Fixture - 2x4 Troffer, 5000 Lumens",
        unit: "ea",
        material: 165,
        labor: 225,
        equipment: 18,
        category: "Lighting",
        subcategory: "LED"
      },
      {
        id: "26-045",
        code: "26-51-13.13",
        description: "LED Fixture - High Bay, 20,000 Lumens",
        unit: "ea",
        material: 425,
        labor: 325,
        equipment: 35,
        category: "Lighting",
        subcategory: "LED"
      },
      {
        id: "26-046",
        code: "26-51-13.14",
        description: "LED Fixture - Recessed Can, 6\", 800 Lumens",
        unit: "ea",
        material: 45,
        labor: 125,
        equipment: 10,
        category: "Lighting",
        subcategory: "LED"
      },
      {
        id: "26-047",
        code: "26-51-13.21",
        description: "LED Fixture - Wall Pack, 3000 Lumens",
        unit: "ea",
        material: 185,
        labor: 225,
        equipment: 18,
        category: "Lighting",
        subcategory: "LED Exterior"
      },
      {
        id: "26-048",
        code: "26-51-13.22",
        description: "LED Fixture - Parking Lot, 15,000 Lumens",
        unit: "ea",
        material: 625,
        labor: 385,
        equipment: 45,
        category: "Lighting",
        subcategory: "LED Exterior"
      },
      {
        id: "26-049",
        code: "26-27-26.11",
        description: "Receptacle - Duplex, 15A, 125V",
        unit: "ea",
        material: 8,
        labor: 45,
        equipment: 3,
        category: "Devices",
        subcategory: "Receptacles"
      },
      {
        id: "26-050",
        code: "26-27-26.12",
        description: "Receptacle - Duplex, 20A, 125V",
        unit: "ea",
        material: 12,
        labor: 55,
        equipment: 4,
        category: "Devices",
        subcategory: "Receptacles"
      },
      {
        id: "26-051",
        code: "26-27-26.13",
        description: "Receptacle - GFCI, 20A, 125V",
        unit: "ea",
        material: 28,
        labor: 75,
        equipment: 5,
        category: "Devices",
        subcategory: "Receptacles"
      },
      {
        id: "26-052",
        code: "26-27-26.21",
        description: "Switch - Single Pole, 15A, 120V",
        unit: "ea",
        material: 6,
        labor: 42,
        equipment: 3,
        category: "Devices",
        subcategory: "Switches"
      },
      {
        id: "26-053",
        code: "26-27-26.22",
        description: "Switch - 3-Way, 15A, 120V",
        unit: "ea",
        material: 9,
        labor: 55,
        equipment: 4,
        category: "Devices",
        subcategory: "Switches"
      },
      {
        id: "26-054",
        code: "26-27-26.23",
        description: "Switch - Dimmer, 600W",
        unit: "ea",
        material: 35,
        labor: 65,
        equipment: 5,
        category: "Devices",
        subcategory: "Switches"
      },
      {
        id: "26-055",
        code: "26-28-13.11",
        description: "Exit Sign - LED, Battery Backup",
        unit: "ea",
        material: 85,
        labor: 125,
        equipment: 10,
        category: "Emergency Lighting",
        subcategory: "Exit Signs"
      },
      {
        id: "26-056",
        code: "26-28-13.12",
        description: "Emergency Light - LED, Battery Backup",
        unit: "ea",
        material: 125,
        labor: 165,
        equipment: 12,
        category: "Emergency Lighting",
        subcategory: "Emergency Lights"
      }
    ]
  },

  // Division 27 - Communications
  "27": {
    name: "Communications",
    items: [
      {
        id: "27-001",
        code: "27-15-13.10",
        description: "Cat6 Cable - Plenum Rated",
        unit: "lf",
        material: 0.45,
        labor: 0.65,
        equipment: 0.05,
        category: "Data",
        subcategory: "Cable"
      },
      {
        id: "27-002",
        code: "27-15-13.20",
        description: "Data Outlet - RJ45, Cat6",
        unit: "ea",
        material: 12.50,
        labor: 35.00,
        equipment: 2.50,
        category: "Data",
        subcategory: "Outlets"
      },
      {
        id: "27-003",
        code: "27-15-16.10",
        description: "Fiber Optic Cable - 6 Strand, Single Mode",
        unit: "lf",
        material: 1.85,
        labor: 2.25,
        equipment: 0.18,
        category: "Data",
        subcategory: "Fiber"
      },
      {
        id: "27-004",
        code: "27-41-13.10",
        description: "Audio/Visual Outlet - HDMI",
        unit: "ea",
        material: 28.50,
        labor: 45.00,
        equipment: 3.50,
        category: "AV Systems",
        subcategory: "Outlets"
      }
    ]
  },

  // Division 28 - Electronic Safety and Security
  "28": {
    name: "Electronic Safety and Security",
    items: [
      {
        id: "28-001",
        code: "28-13-13.10",
        description: "Fire Alarm Control Panel - Addressable",
        unit: "ea",
        material: 3850,
        labor: 1250,
        equipment: 125,
        category: "Fire Alarm",
        subcategory: "Panels"
      },
      {
        id: "28-002",
        code: "28-13-13.20",
        description: "Smoke Detector - Addressable",
        unit: "ea",
        material: 125,
        labor: 95,
        equipment: 8,
        category: "Fire Alarm",
        subcategory: "Devices"
      },
      {
        id: "28-003",
        code: "28-31-13.10",
        description: "Security Camera - IP, 4MP",
        unit: "ea",
        material: 285,
        labor: 185,
        equipment: 15,
        category: "Security",
        subcategory: "CCTV"
      },
      {
        id: "28-004",
        code: "28-13-13.30",
        description: "Pull Station - Fire Alarm",
        unit: "ea",
        material: 95,
        labor: 85,
        equipment: 7,
        category: "Fire Alarm",
        subcategory: "Devices"
      }
    ]
  },

  // Division 31 - Earthwork
  "31": {
    name: "Earthwork",
    items: [
      {
        id: "31-001",
        code: "31-23-16.13",
        description: "Excavation - Bulk, Unclassified",
        unit: "cy",
        material: 0,
        labor: 3.25,
        equipment: 4.75,
        category: "Excavation",
        subcategory: "Bulk"
      },
      {
        id: "31-002",
        code: "31-23-16.23",
        description: "Excavation - Structural, Hand",
        unit: "cy",
        material: 0,
        labor: 45.00,
        equipment: 0,
        category: "Excavation",
        subcategory: "Structural"
      },
      {
        id: "31-003",
        code: "31-23-16.33",
        description: "Excavation - Trench, 2' Wide",
        unit: "cy",
        material: 0,
        labor: 5.25,
        equipment: 6.75,
        category: "Excavation",
        subcategory: "Trench"
      },
      {
        id: "31-004",
        code: "31-23-23.13",
        description: "Fill - Structural, Compacted",
        unit: "cy",
        material: 18.50,
        labor: 4.25,
        equipment: 5.75,
        category: "Fill",
        subcategory: "Structural"
      },
      {
        id: "31-005",
        code: "31-23-23.23",
        description: "Backfill - Common, Compacted",
        unit: "cy",
        material: 12.00,
        labor: 3.25,
        equipment: 4.25,
        category: "Fill",
        subcategory: "Backfill"
      },
      {
        id: "31-006",
        code: "31-25-13.10",
        description: "Grading - Fine, by Dozer",
        unit: "cy",
        material: 0,
        labor: 1.85,
        equipment: 2.65,
        category: "Grading",
        subcategory: "Finish"
      },
      {
        id: "31-007",
        code: "31-32-13.10",
        description: "Geotextile Fabric - Non-Woven",
        unit: "sqft",
        material: 0.45,
        labor: 0.35,
        equipment: 0.03,
        category: "Soil Treatment",
        subcategory: "Fabric"
      },
      {
        id: "31-008",
        code: "31-23-16.43",
        description: "Excavation - Trench, 4' Wide",
        unit: "cy",
        material: 0,
        labor: 6.85,
        equipment: 8.50,
        category: "Excavation",
        subcategory: "Trench"
      },
      {
        id: "31-009",
        code: "31-25-13.20",
        description: "Grading - Rough, by Grader",
        unit: "cy",
        material: 0,
        labor: 1.25,
        equipment: 1.85,
        category: "Grading",
        subcategory: "Rough"
      },
      {
        id: "31-010",
        code: "31-23-23.33",
        description: "Sand Fill - Compacted",
        unit: "cy",
        material: 25.00,
        labor: 4.85,
        equipment: 6.25,
        category: "Fill",
        subcategory: "Sand"
      },
      {
        id: "31-011",
        code: "31-23-33.10",
        description: "Rock Excavation - Blasting Required",
        unit: "cy",
        material: 8.50,
        labor: 12.25,
        equipment: 18.75,
        category: "Excavation",
        subcategory: "Rock"
      },
      {
        id: "31-012",
        code: "31-37-13.10",
        description: "Riprap - 12\" Stone",
        unit: "cy",
        material: 65.00,
        labor: 18.50,
        equipment: 12.25,
        category: "Erosion Control",
        subcategory: "Riprap"
      }
    ]
  },

  // Division 32 - Exterior Improvements
  "32": {
    name: "Exterior Improvements",
    items: [
      {
        id: "32-001",
        code: "32-11-23.10",
        description: "Aggregate Base - 6\" Thick, Compacted",
        unit: "sqft",
        material: 1.25,
        labor: 0.85,
        equipment: 1.15,
        category: "Paving",
        subcategory: "Base"
      },
      {
        id: "32-002",
        code: "32-12-16.13",
        description: "Asphalt Paving - 2\" Thick, 9.5mm Mix",
        unit: "sqft",
        material: 2.85,
        labor: 1.25,
        equipment: 1.85,
        category: "Paving",
        subcategory: "Asphalt"
      },
      {
        id: "32-003",
        code: "32-12-16.23",
        description: "Asphalt Paving - 3\" Thick, 9.5mm Mix",
        unit: "sqft",
        material: 3.95,
        labor: 1.45,
        equipment: 2.15,
        category: "Paving",
        subcategory: "Asphalt"
      },
      {
        id: "32-004",
        code: "32-13-13.13",
        description: "Concrete Paving - 4\" Thick, 3000 PSI",
        unit: "sqft",
        material: 4.25,
        labor: 3.85,
        equipment: 0.95,
        category: "Paving",
        subcategory: "Concrete"
      },
      {
        id: "32-005",
        code: "32-13-13.23",
        description: "Concrete Paving - 6\" Thick, 4000 PSI",
        unit: "sqft",
        material: 6.50,
        labor: 4.50,
        equipment: 1.25,
        category: "Paving",
        subcategory: "Concrete"
      },
      {
        id: "32-006",
        code: "32-17-13.10",
        description: "Parking Striping - 4\" Wide, Thermoplastic",
        unit: "lf",
        material: 0.85,
        labor: 0.65,
        equipment: 0.25,
        category: "Paving",
        subcategory: "Striping"
      },
      {
        id: "32-007",
        code: "32-31-13.10",
        description: "Chain Link Fence - 6' High, Galvanized",
        unit: "lf",
        material: 18.50,
        labor: 12.75,
        equipment: 1.85,
        category: "Fencing",
        subcategory: "Chain Link"
      },
      {
        id: "32-008",
        code: "32-31-13.20",
        description: "Vinyl Fence - 6' High, Privacy",
        unit: "lf",
        material: 28.50,
        labor: 16.75,
        equipment: 2.25,
        category: "Fencing",
        subcategory: "Vinyl"
      },
      {
        id: "32-009",
        code: "32-92-13.10",
        description: "Topsoil - Furnished & Placed, 6\"",
        unit: "cy",
        material: 35.00,
        labor: 8.50,
        equipment: 6.25,
        category: "Landscaping",
        subcategory: "Soil"
      },
      {
        id: "32-010",
        code: "32-92-19.10",
        description: "Sod - Bluegrass, 1\" Thick",
        unit: "sqft",
        material: 0.85,
        labor: 0.65,
        equipment: 0.12,
        category: "Landscaping",
        subcategory: "Turf"
      },
      {
        id: "32-011",
        code: "32-93-13.10",
        description: "Shrubs - 5 Gallon Container",
        unit: "ea",
        material: 45.00,
        labor: 28.50,
        equipment: 3.50,
        category: "Landscaping",
        subcategory: "Plants"
      },
      {
        id: "32-012",
        code: "32-93-13.20",
        description: "Trees - 2\" Caliper, Deciduous",
        unit: "ea",
        material: 285,
        labor: 125,
        equipment: 45,
        category: "Landscaping",
        subcategory: "Plants"
      },
      {
        id: "32-013",
        code: "32-14-13.10",
        description: "Paver Patio - Concrete Pavers",
        unit: "sqft",
        material: 5.85,
        labor: 8.25,
        equipment: 1.25,
        category: "Paving",
        subcategory: "Pavers"
      },
      {
        id: "32-014",
        code: "32-31-13.30",
        description: "Wood Fence - 6' High, Cedar",
        unit: "lf",
        material: 32.50,
        labor: 18.75,
        equipment: 2.45,
        category: "Fencing",
        subcategory: "Wood"
      },
      {
        id: "32-015",
        code: "32-31-13.40",
        description: "Ornamental Iron Fence - 4' High",
        unit: "lf",
        material: 48.50,
        labor: 28.75,
        equipment: 3.25,
        category: "Fencing",
        subcategory: "Ornamental"
      },
      {
        id: "32-016",
        code: "32-17-23.10",
        description: "Concrete Curb - 6\" x 18\"",
        unit: "lf",
        material: 8.50,
        labor: 12.25,
        equipment: 2.85,
        category: "Paving",
        subcategory: "Curbs"
      },
      {
        id: "32-017",
        code: "32-92-13.20",
        description: "Mulch - Shredded Bark, 3\" Deep",
        unit: "sqft",
        material: 0.85,
        labor: 0.65,
        equipment: 0.15,
        category: "Landscaping",
        subcategory: "Mulch"
      },
      {
        id: "32-018",
        code: "32-84-13.10",
        description: "Irrigation System - Spray Heads",
        unit: "sqft",
        material: 1.85,
        labor: 2.25,
        equipment: 0.35,
        category: "Landscaping",
        subcategory: "Irrigation"
      }
    ]
  },

  // Division 33 - Utilities
  "33": {
    name: "Utilities",
    items: [
      {
        id: "33-001",
        code: "33-31-13.10",
        description: "Sanitary Sewer - PVC, 6\"",
        unit: "lf",
        material: 12.50,
        labor: 18.75,
        equipment: 8.25,
        category: "Sanitary Sewer",
        subcategory: "Pipe"
      },
      {
        id: "33-002",
        code: "33-31-13.20",
        description: "Sanitary Sewer - PVC, 8\"",
        unit: "lf",
        material: 16.50,
        labor: 22.50,
        equipment: 10.25,
        category: "Sanitary Sewer",
        subcategory: "Pipe"
      },
      {
        id: "33-003",
        code: "33-41-13.10",
        description: "Storm Drain - RCP, 12\"",
        unit: "lf",
        material: 18.50,
        labor: 25.00,
        equipment: 12.50,
        category: "Storm Drainage",
        subcategory: "Pipe"
      },
      {
        id: "33-004",
        code: "33-41-13.20",
        description: "Storm Drain - RCP, 18\"",
        unit: "lf",
        material: 28.50,
        labor: 35.00,
        equipment: 18.50,
        category: "Storm Drainage",
        subcategory: "Pipe"
      },
      {
        id: "33-005",
        code: "33-42-13.10",
        description: "Catch Basin - Precast, 4' Diameter",
        unit: "ea",
        material: 850,
        labor: 625,
        equipment: 285,
        category: "Storm Drainage",
        subcategory: "Structures"
      },
      {
        id: "33-006",
        code: "33-11-13.10",
        description: "Water Main - Ductile Iron, 6\"",
        unit: "lf",
        material: 22.50,
        labor: 28.50,
        equipment: 14.25,
        category: "Water Distribution",
        subcategory: "Pipe"
      },
      {
        id: "33-007",
        code: "33-11-13.20",
        description: "Water Main - Ductile Iron, 8\"",
        unit: "lf",
        material: 32.50,
        labor: 38.50,
        equipment: 19.25,
        category: "Water Distribution",
        subcategory: "Pipe"
      },
      {
        id: "33-008",
        code: "33-12-13.10",
        description: "Fire Hydrant - 5-1/4\" Valve",
        unit: "ea",
        material: 2850,
        labor: 1250,
        equipment: 485,
        category: "Water Distribution",
        subcategory: "Hydrants"
      },
      {
        id: "33-009",
        code: "33-31-13.30",
        description: "Sanitary Sewer - PVC, 12\"",
        unit: "lf",
        material: 28.50,
        labor: 35.00,
        equipment: 16.25,
        category: "Sanitary Sewer",
        subcategory: "Pipe"
      },
      {
        id: "33-010",
        code: "33-41-13.30",
        description: "Storm Drain - RCP, 24\"",
        unit: "lf",
        material: 42.50,
        labor: 48.50,
        equipment: 28.75,
        category: "Storm Drainage",
        subcategory: "Pipe"
      },
      {
        id: "33-011",
        code: "33-44-13.10",
        description: "Manhole - Precast, 4' Diameter",
        unit: "ea",
        material: 1850,
        labor: 1250,
        equipment: 625,
        category: "Storm Drainage",
        subcategory: "Structures"
      },
      {
        id: "33-012",
        code: "33-11-13.30",
        description: "Water Main - Ductile Iron, 12\"",
        unit: "lf",
        material: 58.50,
        labor: 65.00,
        equipment: 32.50,
        category: "Water Distribution",
        subcategory: "Pipe"
      },
      {
        id: "33-013",
        code: "33-71-13.10",
        description: "Water Meter - 2\" Turbine",
        unit: "ea",
        material: 1250,
        labor: 425,
        equipment: 85,
        category: "Water Distribution",
        subcategory: "Metering"
      },
      {
        id: "33-014",
        code: "33-46-13.10",
        description: "Septic Tank - Concrete, 1000 Gal",
        unit: "ea",
        material: 1850,
        labor: 1425,
        equipment: 625,
        category: "Sanitary Sewer",
        subcategory: "On-Site"
      },
      {
        id: "33-015",
        code: "33-49-13.10",
        description: "Leach Field - Gravel, 100 LF",
        unit: "sqft",
        material: 3.85,
        labor: 4.25,
        equipment: 1.85,
        category: "Sanitary Sewer",
        subcategory: "On-Site"
      }
    ]
  }
};

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaterialsDatabase;
}
