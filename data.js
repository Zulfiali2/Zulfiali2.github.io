/* ==========================================================
   PORTFOLIO CONTENT — edit this file to update the website.
   Add a project: copy one { ... } block in `projects`, change it, save.
   status: "live" | "staging" | "building"
   ========================================================== */
window.PORTFOLIO = {
  profile: {
    name: "Zulfiqar Ali Nasir",
    role: "WordPress & Elementor Developer",
    location: "Islamabad, Pakistan",
    timezone: "Asia/Karachi",
    available: "Open to new roles and freelance work",
    email: "zulfiali394@gmail.com",
    phone: "+92 303 5978667",
    whatsapp: "923035978667",
    linkedin: "https://www.linkedin.com/in/zulfiqar-ali-nasir-71b367255",
    github: "https://github.com/Zulfiali2",
    cv: "Zulfiqar-Ali-Nasir-CV.pdf",
    summary:
      "I build fast, responsive business websites with WordPress, Elementor and WooCommerce. Most of my work is for UK companies: accountants, salons, fashion brands, builders and restaurants. I care about clear service pages, clean layouts on every screen size, and sites the client can update themselves.",
  },

  categories: [
    { id: "finance", label: "Accounting & finance" },
    { id: "retail", label: "Fashion & e-commerce" },
    { id: "beauty", label: "Beauty & wellness" },
    { id: "food", label: "Food & hospitality" },
    { id: "build", label: "Home & construction" },
    { id: "services", label: "Business services" },
  ],

  projects: [
    { name: "Ross McKinley", url: "https://rossmckinley.com/", cat: "finance", status: "live", featured: true,
      desc: "Corporate website for a UK accounting business, with structured service pages and a clear navigation flow.",
      did: ["Developed structured service pages and corporate layout", "Implemented responsive UI for desktop and mobile", "Optimised content presentation and navigation flow", "Managed plugin integration and content updates"],
      tech: ["WordPress", "Elementor", "Custom layout"] },
    { name: "F&A Accountants", url: "https://faaccountants.com/", cat: "finance", status: "live", featured: true,
      desc: "Accounting firm website with specialist sector pages, including a hospitality accounting service page built as a reusable Elementor template.",
      tech: ["WordPress", "Elementor", "Custom CSS"] },
    { name: "Fiscal Focus Accountants", url: "https://fiscalfocusaccountantsltd.uk/", cat: "finance", status: "live",
      desc: "Website for a UK accountancy practice.", tech: ["WordPress", "Elementor"] },
    { name: "White Weaver Accountants", url: "https://whiteweaveraccountants.com/", cat: "finance", status: "live",
      desc: "Website for an accountancy firm.", tech: ["WordPress", "Elementor"] },
    { name: "White Weaver (staging)", url: "http://whiteweaver.aqftrading.co.uk/", cat: "finance", status: "staging",
      desc: "Staging build used to design and test the White Weaver site before launch.", tech: ["WordPress", "Elementor"] },
    { name: "MedTax Advisors", url: "https://medtaxadvisors.co.uk/", cat: "finance", status: "live",
      desc: "Website for a tax advisory firm.", tech: ["WordPress", "Elementor"] },
    { name: "Pacific Horizon", url: "https://pacifichorizon.ae/", cat: "finance", status: "live",
      desc: "UAE business consultancy offering company formation, PRO, tax, licensing and accounting services.", tech: ["WordPress", "Elementor"] },
    { name: "AQF Trading", url: "https://www.aqftrading.co.uk/", cat: "finance", status: "live", featured: true,
      desc: "Corporate consulting website for financial and business advisory services.",
      did: ["Developed corporate consulting website for financial and business advisory services", "Structured service pages for finance, operations and consultancy offerings", "Implemented responsive design and optimised content layout"],
      tech: ["WordPress", "Elementor"] },

    { name: "Cubeline London", url: "https://cubelinelondonltd.co.uk/", cat: "retail", status: "live", featured: true,
      desc: "WooCommerce online store with a full product catalogue, cart and checkout.",
      did: ["Implemented product catalogue and category structure", "Configured cart and checkout", "Managed product uploads and store layout", "Assisted with payment gateway setup"],
      tech: ["WordPress", "WooCommerce", "Elementor"] },
    { name: "Glory Fashion", url: "https://gloryfashion.co.uk/", cat: "retail", status: "live",
      desc: "Website for a fashion brand.", tech: ["WordPress", "Elementor"] },
    { name: "Naseer Garments", url: "https://naseergarments.com/", cat: "retail", status: "live",
      desc: "Website for a garment business.", tech: ["WordPress", "Elementor"] },
    { name: "Silver Victory Fashion", url: "http://silvervictoryfashion.com/", cat: "retail", status: "live",
      desc: "Website for a fashion label.", tech: ["WordPress", "Elementor"] },

    { name: "Ayura Holistic Wellness", url: "https://ayuraholisticwellness.co.uk/", cat: "beauty", status: "live",
      desc: "Website for a holistic wellness practice.", tech: ["WordPress", "Elementor"] },
    { name: "Ridley Beauty Zone", url: "https://www.ridleybeautyzone.co.uk/", cat: "beauty", status: "live",
      desc: "Website for a beauty salon.", tech: ["WordPress", "Elementor"] },
    { name: "Lola's Beauty Salon", url: "https://lolassaloon.tasneemkausar.com/", cat: "beauty", status: "staging",
      desc: "Beauty salon website, built and reviewed on a staging domain.", tech: ["WordPress", "Elementor"] },
    { name: "Hair Port", url: "https://hairport.aqftrading.co.uk/", cat: "beauty", status: "staging",
      desc: "Hair salon website, built on a staging domain.", tech: ["WordPress", "Elementor"] },

    { name: "Biters", url: "https://biters.aqftrading.co.uk/", cat: "food", status: "staging",
      desc: "Fast-casual restaurant in Croydon serving flame-grilled burgers, wraps, shawarma and grilled chicken.", tech: ["WordPress", "Elementor"] },
    { name: "Smokey Yard", url: "https://smokeyyard.co.uk/", cat: "food", status: "live",
      desc: "UK butcher and meat supplier selling smoked meats, fresh cuts and traditional Slovak products online and in store.", tech: ["WordPress", "Elementor"] },

    { name: "JD Consortium", url: "https://jdconsortiumltd.uk/", cat: "build", status: "live",
      desc: "Construction company delivering residential, commercial and industrial building, renovations and extensions.", tech: ["WordPress", "Elementor"] },
    { name: "ABL Design & Build", url: "https://abldesignandbuild.co.uk/", cat: "build", status: "live",
      desc: "Website for a design and build company.", tech: ["WordPress", "Elementor"] },
    { name: "Union Windows", url: "https://unionwindows.co.uk/", cat: "build", status: "live",
      desc: "Website for a windows company.", tech: ["WordPress", "Elementor"] },
    { name: "Elit Curtains", url: "https://elitcurtains.aqftrading.co.uk/", cat: "build", status: "staging",
      desc: "Website for a curtains and soft furnishings business, built on a staging domain.", tech: ["WordPress", "Elementor"] },

    { name: "Global Link Consultants", url: "https://globallinkconsultants.uk/", cat: "services", status: "live", featured: true,
      desc: "Study-abroad consultancy for UK education services: university admissions, visa guidance and career support.",
      did: ["Developed a professional consultancy website for UK education services", "Built service sections for admissions, visa guidance and career support", "Built responsive layouts and contact forms for lead generation"],
      tech: ["WordPress", "Elementor"] },
    { name: "Nexus Mansfield", url: "http://nexusmansfield.com/", cat: "services", status: "live",
      desc: "Energy procurement company helping UK businesses cut costs through contract analysis.", tech: ["WordPress", "Elementor"] },
    { name: "The Tyres Egham", url: "https://thetyresegham.co.uk/", cat: "services", status: "live",
      desc: "Independent tyre fitter in Egham. Customers search by registration or size, compare brands and book a fitting slot.", tech: ["WordPress", "Elementor"] },
    { name: "Sm@rt Tech Hub", url: "https://smartechhub.tasneemkausar.com/", cat: "services", status: "building",
      desc: "Phone parts, repairs and accessories shop in East Ham, built on a Hello Elementor child theme with Elementor page templates.", tech: ["WordPress", "Elementor", "Child theme"] },
  ],

  lab: [
    { name: "F&A Hospitality Calculators", url: "https://github.com/Zulfiali2/fa-calculators",
      desc: "VAT, GP% and prime cost, and payroll cost calculators for UK restaurants, using 2026/27 tax rates. Ships as a stand-alone page, an Elementor HTML widget and an importable Elementor template.",
      tech: ["JavaScript", "HTML", "CSS", "Elementor", "Python"] },
    { name: "This portfolio", url: "https://github.com/Zulfiali2/Zulfiali2.github.io",
      desc: "A small web app with no framework: live site previews, filters, a command palette and a project planner. All content comes from one data file.",
      tech: ["JavaScript", "HTML", "CSS", "GitHub Pages"] },
  ],

  experience: [
    { role: "WordPress Developer", org: "Ross McKinley Ltd", when: "2025 – Present",
      points: ["Develop and maintain professional business websites", "Build fully responsive layouts with Elementor", "Set up WooCommerce products, cart and checkout", "Manage plugins, content updates and site optimisation", "Deliver projects to client requirements and deadlines"] },
    { role: "WordPress Intern", org: "Nuexus, Islamabad", when: "Jul 2024 – Sep 2024",
      points: ["Customised themes and configured plugins", "Improved website performance and SEO structure", "Checked cross-browser and mobile compatibility", "Worked with designers and developers on new features"] },
    { role: "BSc Software Engineering", org: "Iqra University, Islamabad", when: "2017 – 2023", edu: true,
      points: ["Web development", "Database systems", "Software engineering", "Object-oriented programming"] },
  ],

  skills: [
    { group: "CMS", items: ["WordPress", "Elementor", "WooCommerce"] },
    { group: "Frontend", items: ["HTML5", "CSS3", "JavaScript", "jQuery"] },
    { group: "Backend & data", items: ["PHP", "MySQL"] },
    { group: "Site care", items: ["Responsive design", "SEO", "Performance", "Plugin management"] },
  ],

  languages: ["English (professional)", "Urdu (native)"],
};
