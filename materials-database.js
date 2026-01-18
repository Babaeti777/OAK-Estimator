// RS Means-Style Material Database
// Comprehensive construction materials, labor, and equipment database
// Organized by CSI MasterFormat divisions

const MaterialsDatabase = {
  version: "1.0.0",
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
      }
    ]
  }
};

// Export for use in application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MaterialsDatabase;
}
