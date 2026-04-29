// ═══════════════════════════════════════════════════════════════════════════
// Thesis Topic Finder - Curated Agriculture Research Database
// Contains under-researched topics across 10+ agriculture fields
// ═══════════════════════════════════════════════════════════════════════════

export const THESIS_FIELDS = {
  fruitHorticulture: {
    id: 'fruitHorticulture',
    name: 'Fruit Horticulture',
    icon: '🍎',
    color: '#e74c3c',
    description: 'Study of fruit crop cultivation, propagation, and orchard management techniques.',
    cropCount: 8,
  },
  vegetableScience: {
    id: 'vegetableScience',
    name: 'Vegetable Science (Olericulture)',
    icon: '🥬',
    color: '#27ae60',
    description: 'Research on vegetable crops, protected cultivation, and off-season production.',
    cropCount: 7,
  },
  floriculture: {
    id: 'floriculture',
    name: 'Floriculture',
    icon: '🌸',
    color: '#e84393',
    description: 'Flower cultivation, post-harvest handling, and value-added products.',
    cropCount: 6,
  },
  entomology: {
    id: 'entomology',
    name: 'Entomology',
    icon: '🦋',
    color: '#9b59b6',
    description: 'Insect pest management, beneficial insects, and IPM strategies.',
    cropCount: 8,
  },
  plantPathology: {
    id: 'plantPathology',
    name: 'Plant Pathology',
    icon: '🍄',
    color: '#795548',
    description: 'Disease management, pathogen studies, and crop protection strategies.',
    cropCount: 7,
  },
  agronomy: {
    id: 'agronomy',
    name: 'Agronomy',
    icon: '🌾',
    color: '#f39c12',
    description: 'Field crop production, resource management, and farming systems.',
    cropCount: 9,
  },
  plantBreeding: {
    id: 'plantBreeding',
    name: 'Plant Breeding & Genetics',
    icon: '🧬',
    color: '#3498db',
    description: 'Crop improvement, varietal development, and molecular breeding.',
    cropCount: 7,
  },
  soilScience: {
    id: 'soilScience',
    name: 'Soil Science',
    icon: '🌍',
    color: '#8d6e63',
    description: 'Soil health, nutrient management, and sustainable soil practices.',
    cropCount: 6,
  },
  agEconomics: {
    id: 'agEconomics',
    name: 'Agricultural Economics',
    icon: '📊',
    color: '#2c3e50',
    description: 'Farm economics, market analysis, and policy research.',
    cropCount: 6,
  },
  postHarvest: {
    id: 'postHarvest',
    name: 'Post-Harvest Technology',
    icon: '📦',
    color: '#16a085',
    description: 'Storage, processing, value addition, and supply chain management.',
    cropCount: 7,
  },
  organicFarming: {
    id: 'organicFarming',
    name: 'Organic & Sustainable Agriculture',
    icon: '🌿',
    color: '#00b894',
    description: 'Organic production, natural farming, and sustainability practices.',
    cropCount: 6,
  },
  agExtension: {
    id: 'agExtension',
    name: 'Agricultural Extension',
    icon: '🎓',
    color: '#6c5ce7',
    description: 'Technology transfer, farmer training, and adoption studies.',
    cropCount: 5,
  },
};

export const RESEARCH_TOPICS = {
  fruitHorticulture: {
    mango: {
      name: 'Mango (Mangifera indica)',
      topics: [
        {
          id: 'mango-01',
          title: 'High-Density Planting Systems',
          description: 'Optimization of planting density, canopy management, and yield optimization in ultra-high-density mango orchards.',
          researchGap: 'High',
          paperCount: '15-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Performance of Mango cv. Dashehari under Ultra-High-Density Planting System in Semi-Arid Region',
            'Canopy Management and Light Interception Studies in High-Density Mango Orchards',
            'Economic Viability of High-Density Mango Planting Systems in North India',
          ],
          whyValuable: 'Limited long-term studies on Indian commercial varieties under HDPS. Gap in economic analysis for small farmers.',
        },
        {
          id: 'mango-02',
          title: 'Precision Irrigation and Fertigation',
          description: 'Drip irrigation scheduling, fertigation protocols, and water-use efficiency in mango orchards.',
          researchGap: 'Medium',
          paperCount: '28-35',
          yearRange: '2012-2024',
          suggestedTitles: [
            'Drip Fertigation Scheduling for Improving Fruit Quality in Mango cv. Langra',
            'Water-Use Efficiency and Root Distribution Patterns under Partial Root Zone Drying in Mango',
            'Response of Mango cv. Banganpalli to Deficit Irrigation Strategies',
          ],
          whyValuable: 'Most studies focus on yield; limited research on quality parameters and water stress effects on specific varieties.',
        },
        {
          id: 'mango-03',
          title: 'Off-Season Flowering and Fruit Production',
          description: 'Chemical induction, pruning strategies, and climate manipulation for off-season mango production.',
          researchGap: 'High',
          paperCount: '12-18',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Effect of Paclobutrazol and Ethephon on Off-Season Flowering in Mango cv. Amrapali',
            'Pruning Intensity and Its Impact on Vegetative Growth and Off-Season Fruiting',
            'Economic Feasibility of Off-Season Mango Production under Protected Conditions',
          ],
          whyValuable: 'Emerging area with high market potential. Limited studies on chemical combinations and long-term tree health effects.',
        },
        {
          id: 'mango-04',
          title: 'Value-Added Product Development',
          description: 'Processing techniques, product diversification, and market linkages for mango products.',
          researchGap: 'Medium',
          paperCount: '25-32',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Development of Functional Mango Products with Probiotic Incorporation',
            'Effect of Drying Methods on Nutraceutical Properties of Mango Leather',
            'Shelf-Life Extension of Ready-to-Serve Mango Beverages using Natural Preservatives',
          ],
          whyValuable: 'Traditional products well-studied; gap in functional foods, probiotic integration, and clean-label processing.',
        },
      ],
    },
    banana: {
      name: 'Banana (Musa spp.)',
      topics: [
        {
          id: 'banana-01',
          title: 'Tissue Culture Hardening Protocols',
          description: 'Optimization of hardening conditions, acclimatization, and field establishment of tissue-cultured banana plantlets.',
          researchGap: 'High',
          paperCount: '18-25',
          yearRange: '2013-2023',
          suggestedTitles: [
            'In-Vitro Hardening of Banana cv. Grand Naine using Bio-Hardening Agents',
            'Effects of Arbuscular Mycorrhizal Fungi on Survival Rate of Micropropagated Banana',
            'Cost-Effective Hardening Chamber Design for Small-Scale Banana Tissue Culture Units',
          ],
          whyValuable: 'High mortality rate during hardening is major issue. Limited studies on indigenous bio-hardening agents.',
        },
        {
          id: 'banana-02',
          title: 'Organic and Natural Farming in Banana',
          description: 'Jeevamrut, beejamrut application, organic nutrient management, and natural farming protocols.',
          researchGap: 'High',
          paperCount: '8-15',
          yearRange: '2018-2024',
          suggestedTitles: [
            'Efficacy of Jeevamrut and Panchagavya on Growth and Yield of Banana',
            'Comparative Performance of Natural Farming vs. Conventional Farming in Banana Cultivation',
            'Microbial Dynamics in Banana Rhizosphere under Natural Farming Conditions',
          ],
          whyValuable: 'Natural farming is policy priority in India but severely under-researched for banana specifically.',
        },
        {
          id: 'banana-03',
          title: 'Banana Fiber Extraction and Utilization',
          description: 'Mechanized fiber extraction, value-added products from pseudostem, and economic utilization.',
          researchGap: 'Medium',
          paperCount: '20-28',
          yearRange: '2015-2024',
          suggestedTitles: [
            'Development of Cost-Effective Banana Fiber Extraction Machine for Small Farmers',
            'Physical and Mechanical Properties of Banana Pseudostem Fiber for Textile Applications',
            'Biocomposite Development using Banana Fiber and Biodegradable Matrices',
          ],
          whyValuable: 'Waste utilization with economic potential. Gap in farmer-level technology and product diversification.',
        },
      ],
    },
    citrus: {
      name: 'Citrus (Citrus spp.)',
      topics: [
        {
          id: 'citrus-01',
          title: 'Rootstock-Scion Compatibility Studies',
          description: 'Evaluation of indigenous and exotic rootstocks for Kinnow, Mosambi, and other citrus varieties.',
          researchGap: 'High',
          paperCount: '14-20',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Performance of Kinnow Mandarin on Various Rootstocks under North Indian Conditions',
            'Drought Tolerance and Salt Tolerance Evaluation of Citrus Rootstocks',
            'Rootstock Effect on Fruit Quality and Juice Characteristics in Sweet Orange',
          ],
          whyValuable: 'Limited rootstock trials in India compared to USA/Spain. Need for region-specific recommendations.',
        },
        {
          id: 'citrus-02',
          title: 'Integrated Nutrient Management',
          description: 'Organic manures, biofertilizers, and micronutrient formulations for citrus orchards.',
          researchGap: 'Medium',
          paperCount: '30-38',
          yearRange: '2012-2024',
          suggestedTitles: [
            'Effect of Integrated Nutrient Management on Yield and Juice Quality of Kinnow Mandarin',
            'Biofertilizer Consortium for Improving Nutrient Use Efficiency in Citrus',
            'Foliar Feeding of Micronutrients for Correcting Nutrient Disorders in Citrus',
          ],
          whyValuable: 'Existing research scattered; need for integrated protocols and site-specific nutrient management.',
        },
        {
          id: 'citrus-03',
          title: 'Citrus Decline Management',
          description: 'Multifactorial decline, replant problems, and integrated management strategies.',
          researchGap: 'High',
          paperCount: '16-24',
          yearRange: '2013-2023',
          suggestedTitles: [
            'Soil Health Restoration Strategies for Reclaimed Citrus Decline-Affected Orchards',
            'Biofumigation and Soil Solarization for Managing Citrus Replant Disease',
            'Molecular Characterization of Decline-Causing Pathogens in Citrus Orchards',
          ],
          whyValuable: 'Major economic issue in citrus belt. Limited holistic approaches combining soil, rootstock, and nutrition.',
        },
      ],
    },
    guava: {
      name: 'Guava (Psidium guajava)',
      topics: [
        {
          id: 'guava-01',
          title: 'Coloured Varieties and Pigment Studies',
          description: 'Red-fleshed varieties, anthocyanin content, and antioxidant potential.',
          researchGap: 'Medium',
          paperCount: '22-30',
          yearRange: '2015-2024',
          suggestedTitles: [
            'Characterization of Anthocyanin Profiles in Coloured Guava Varieties',
            'Effect of Growing Conditions on Pigment Accumulation in Red-Fleshed Guava',
            'Antioxidant Activity and Phenolic Content in Different Guava Genotypes',
          ],
          whyValuable: 'Market demand for coloured varieties rising. Limited research on cultivation practices affecting pigment content.',
        },
        {
          id: 'guava-02',
          title: 'Guava Wilt Management',
          description: 'Fusarium wilt, biocontrol agents, resistant rootstocks, and integrated disease management.',
          researchGap: 'High',
          paperCount: '18-25',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Evaluation of Trichoderma spp. and Pseudomonas spp. for Guava Wilt Suppression',
            'Screening of Guava Germplasm for Resistance against Fusarium wilt',
            'Soil Amendments and Biofumigation for Managing Guava Wilt Complex',
          ],
          whyValuable: 'Most destructive disease of guava. Effective biocontrol protocols and resistant varieties need more research.',
        },
      ],
    },
    pomegranate: {
      name: 'Pomegranate (Punica granatum)',
      topics: [
        {
          id: 'pom-01',
          title: 'Aril Color Development and Quality',
          description: 'Environmental and nutritional factors affecting fruit color, aril quality, and storage.',
          researchGap: 'Medium',
          paperCount: '24-32',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Effect of Nutrient Management on Aril Color and Quality in Pomegranate',
            'Light Interception and Its Impact on Skin Color Development in Pomegranate',
            'Pre-Harvest Treatments for Improving Storage Life and Quality Attributes',
          ],
          whyValuable: 'Export-quality fruit requires specific color standards. Limited research on pre-harvest factors affecting color.',
        },
        {
          id: 'pom-02',
          title: 'Pomegranate Bacterial Blight Management',
          description: 'Xanthomonas axonopodis, resistant varieties, and integrated bacterial blight management.',
          researchGap: 'High',
          paperCount: '15-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Screening of Pomegranate Germplasm for Bacterial Blight Resistance',
            'Antibacterial Potential of Botanical Extracts against Xanthomonas axonopodis',
            'Cultural Practices for Reducing Bacterial Blight Incidence in Pomegranate',
          ],
          whyValuable: 'Devastating disease causing major losses. Limited resistant sources and management protocols documented.',
        },
      ],
    },
    apple: {
      name: 'Apple (Malus domestica)',
      topics: [
        {
          id: 'apple-01',
          title: 'Low-Chill Apple Cultivation',
          description: 'Cultivar performance, flowering physiology, and management in low-chill regions.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Performance of Low-Chill Apple Varieties in Sub-Tropical Plains',
            'Chemical Breaking of Dormancy in Low-Chill Apple under North Indian Conditions',
            'Comparative Economics of Low-Chill vs. Traditional Apple Cultivation',
          ],
          whyValuable: 'Expanding apple cultivation to new areas. Limited research on cultivar adaptation outside traditional belts.',
        },
        {
          id: 'apple-02',
          title: 'Rootstock Trials for High-Density Planting',
          description: 'Dwarfing rootstocks, productivity, and suitability for Indian conditions.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Performance of Apple Scions on M9, M26, and MM106 Rootstocks in Kashmir Valley',
            'Vigour Control and Precocity in Apple under High-Density Systems',
            'Rootstock-Induced Drought Tolerance Mechanisms in Apple',
          ],
          whyValuable: 'High-density revolution happening but limited indigenous rootstock research.',
        },
      ],
    },
    grapes: {
      name: 'Grapes (Vitis vinifera)',
      topics: [
        {
          id: 'grape-01',
          title: 'Table Grape Production for Export',
          description: 'Export-quality standards, bunch management, and post-harvest protocols.',
          researchGap: 'Medium',
          paperCount: '25-35',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Bunch Architecture Manipulation for Export-Quality Table Grapes',
            'Pre-Harvest Bagging Effects on Fruit Quality and Pesticide Residue Reduction',
            'GA3 and CPPU Application Protocols for Thompson Seedless Quality Enhancement',
          ],
          whyValuable: 'Export market expanding rapidly. Gap in residue-free production and quality standards research.',
        },
        {
          id: 'grape-02',
          title: 'Sub-Soil Salinity Management',
          description: 'Salt tolerance, rootstock evaluation, and reclamation in saline areas.',
          researchGap: 'High',
          paperCount: '14-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Screening of Grape Rootstocks for Salt Tolerance in Maharashtra Region',
            'Soil Amendments for Managing Sub-Surface Salinity in Grape Orchards',
            'Physiological and Biochemical Responses of Grapes under Salt Stress',
          ],
          whyValuable: 'Major problem in Nashik region. Limited long-term studies on salinity management strategies.',
        },
      ],
    },
    sapota: {
      name: 'Sapota (Manilkara zapota)',
      topics: [
        {
          id: 'sapota-01',
          title: 'Canopy Management and Light Relations',
          description: 'Pruning strategies, training systems, and their effect on productivity.',
          researchGap: 'High',
          paperCount: '8-15',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Effect of Severity and Time of Pruning on Sapota Flowering and Fruiting',
            'Training Systems for Optimizing Light Interception in Sapota Canopy',
            'Rejuvenation of Old and Unproductive Sapota Orchards through Heading Back',
          ],
          whyValuable: 'Sapota canopy management severely under-researched. Old orchards need rejuvenation protocols.',
        },
        {
          id: 'sapota-02',
          title: 'Harvesting Indices and Storage',
          description: 'Maturity standards, ripening physiology, and post-harvest handling.',
          researchGap: 'Medium',
          paperCount: '18-25',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Non-Destructive Maturity Indices for Harvesting Sapota Fruits',
            'Effect of 1-MCP and Modified Atmosphere on Sapota Shelf-Life Extension',
            'Ripening Physiology and Ethylene Production Patterns in Different Sapota Varieties',
          ],
          whyValuable: 'Perishable nature limits market expansion. Gap in ripening management and storage technologies.',
        },
      ],
    },
  },

  vegetableScience: {
    tomato: {
      name: 'Tomato (Solanum lycopersicum)',
      topics: [
        {
          id: 'tomato-01',
          title: 'Protected Cultivation under Nethouse',
          description: 'Nethouse design, climate management, and year-round production protocols.',
          researchGap: 'Medium',
          paperCount: '28-38',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Low-Cost Nethouse Design for Semi-Arid Regions: Tomato Production Case Study',
            'Microclimate Modification and Its Effect on Tomato Yield and Quality',
            'Economic Analysis of Protected vs. Open-Field Tomato Cultivation',
          ],
          whyValuable: 'Protected cultivation expanding but limited research on low-cost structures suitable for small farmers.',
        },
        {
          id: 'tomato-02',
          title: 'Soilless Culture and Hydroponics',
          description: 'NFT, DWC systems, nutrient solutions, and hydroponic tomato production.',
          researchGap: 'High',
          paperCount: '15-24',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Development of Low-Cost Hydroponic System for Tomato Production',
            'Nutrient Solution Formulation for Indian Tomato Varieties under NFT',
            'Comparative Performance of Soilless vs. Soil-Based Tomato Cultivation',
          ],
          whyValuable: 'Emerging technology with limited Indian research. Need for indigenous nutrient formulations.',
        },
        {
          id: 'tomato-03',
          title: 'Organic Cherry Tomato Production',
          description: 'Cherry varieties, organic protocols, and value chain development.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Performance of Exotic Cherry Tomato Varieties under Organic Management',
            'Organic Nutrient Management Package for High-Value Cherry Tomato',
            'Value Chain Analysis of Organic Cherry Tomato in Metro Markets',
          ],
          whyValuable: 'High-value crop for urban markets. Limited research on organic production in Indian conditions.',
        },
      ],
    },
    capsicum: {
      name: 'Capsicum/Bell Pepper (Capsicum annuum)',
      topics: [
        {
          id: 'caps-01',
          title: 'Coloured Capsicum Production',
          description: 'Yellow, red, orange varieties, year-round production, and quality parameters.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Performance of Coloured Capsicum Varieties under Protected Cultivation',
            'Effect of Light Intensity on Pigment Development in Coloured Capsicum',
            'Nutrient Management for Optimizing Yield and Quality in Coloured Capsicum',
          ],
          whyValuable: 'High-value crop but limited variety-specific research. Gap in pigment development factors.',
        },
        {
          id: 'caps-02',
          title: 'Pollination Management',
          description: 'Bumblebees, bee attractants, and pollination optimization.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Efficiency of Bumblebee Pollination vs. Mechanical Pollination in Capsicum',
            'Bee Attractants and Floral Biology Studies in Coloured Capsicum',
            'Impact of Pollination Quality on Fruit Deformation in Capsicum',
          ],
          whyValuable: 'Poor fruit set major issue. Limited research on pollinator management in protected structures.',
        },
      ],
    },
    cucumber: {
      name: 'Cucumber (Cucumis sativus)',
      topics: [
        {
          id: 'cuc-01',
          title: 'Gynoecious Line Development',
          description: 'Parthenocarpic varieties, female lines, and F1 hybrid development.',
          researchGap: 'High',
          paperCount: '14-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Development and Characterization of Gynoecious Lines in Indian Cucumber',
            'Parthenocarpy Expression and Its Stability under Different Temperature Regimes',
            'Heterosis Studies for Yield and Quality Traits in Cucumber Hybrids',
          ],
          whyValuable: 'F1 hybrid seed production needs gynoecious lines. Limited indigenous breeding material.',
        },
        {
          id: 'cuc-02',
          title: 'Root-Knot Nematode Management',
          description: 'Meloidogyne spp., resistant varieties, and biocontrol strategies.',
          researchGap: 'Medium',
          paperCount: '20-28',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Screening of Cucumber Germplasm for Resistance to Meloidogyne incognita',
            'Integration of Biological and Cultural Methods for Nematode Management',
            'Effect of Organic Amendments on Nematode Population Dynamics in Cucumber',
          ],
          whyValuable: 'Major constraint in protected cultivation. Limited resistant varieties identified.',
        },
      ],
    },
    onion: {
      name: 'Onion (Allium cepa)',
      topics: [
        {
          id: 'onion-01',
          title: 'Short-Day Variety Adaptation',
          description: 'Photoperiod sensitivity, bulb development, and storage quality.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Performance of Short-Day Onion Varieties under North Indian Conditions',
            'Photoperiod and Temperature Interaction Effects on Bulbing in Onion',
            'Storage Behavior of Short-Day vs. Long-Day Onion Varieties',
          ],
          whyValuable: 'Need year-round production. Limited research on short-day varieties outside traditional areas.',
        },
        {
          id: 'onion-02',
          title: 'Direct Seeding Technology',
          description: 'Seed priming, weed management, and mechanized cultivation.',
          researchGap: 'Medium',
          paperCount: '24-34',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Seed Priming Techniques for Improving Germination in Direct-Seeded Onion',
            'Integrated Weed Management in Direct-Seeded vs. Transplanted Onion',
            'Development of Sowing Equipment for Precise Onion Seed Placement',
          ],
          whyValuable: 'Labor shortage driving direct seeding. Gap in seed priming and mechanization research.',
        },
      ],
    },
    brinjal: {
      name: 'Brinjal/Eggplant (Solanum melongena)',
      topics: [
        {
          id: 'brinjal-01',
          title: 'Rootstock Evaluation for Grafting',
          description: 'Compatible rootstocks, bacterial wilt resistance, and graft compatibility.',
          researchGap: 'High',
          paperCount: '14-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Evaluation of Wild Solanum Species as Rootstocks for Brinjal Grafting',
            'Graft Compatibility and Vascular Connection Studies in Brinjal',
            'Effect of Grafting on Bacterial Wilt Resistance and Yield in Brinjal',
          ],
          whyValuable: 'Bacterial wilt devastating disease. Grafting technology emerging but rootstock research limited.',
        },
        {
          id: 'brinjal-02',
          title: 'Parthenocarpy and Seedlessness',
          description: 'Male sterility, fruit set without pollination, and environmental manipulation.',
          researchGap: 'Medium',
          paperCount: '18-26',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Identification of Parthenocarpic Genes in Brinjal Germplasm',
            'Effect of Plant Growth Regulators on Seedless Fruit Development in Brinjal',
            'Consumer Preference and Market Acceptance of Seedless Brinjal Varieties',
          ],
          whyValuable: 'Seedless brinjal has market appeal. Limited genetic and hormonal manipulation studies.',
        },
      ],
    },
    okra: {
      name: 'Okra/Ladyfinger (Abelmoschus esculentus)',
      topics: [
        {
          id: 'okra-01',
          title: 'Yellow Vein Mosaic Virus Management',
          description: 'Resistant varieties, vector management, and integrated control.',
          researchGap: 'Medium',
          paperCount: '26-36',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Screening of Okra Germplasm for Resistance to Yellow Vein Mosaic Virus',
            'Vector Population Dynamics and Whitefly Management in Okra',
            'Molecular Characterization of YVMV Isolates from Different Agro-Climatic Zones',
          ],
          whyValuable: 'Most destructive disease. Resistant varieties available but breakdown observed.',
        },
        {
          id: 'okra-02',
          title: 'Abelmoschus manihot Germplasm Evaluation',
          description: 'Wild relatives, genetic diversity, and useful traits for breeding.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Morphological and Molecular Characterization of Abelmoschus manihot Subsp. tetraphyllus',
            'Identification of Novel Sources of Resistance in Wild Abelmoschus Species',
            'Interspecific Hybridization between A. esculentus and A. manihot',
          ],
          whyValuable: 'Underutilized germplasm with potential breeding value. Severely under-studied.',
        },
      ],
    },
  },

  entomology: {
    general: {
      name: 'General Entomology Research',
      topics: [
        {
          id: 'ento-01',
          title: 'Entomopathogenic Nematodes for Soil Pest Management',
          description: 'Steinernema and Heterorhabditis species, mass production, and field application.',
          researchGap: 'High',
          paperCount: '18-28',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Efficacy of Indigenous Entomopathogenic Nematodes against White Grubs in Sugarcane',
            'Mass Production Technology for Steinernema spp. using In-Vivo and In-Vitro Methods',
            'Compatibility of EPNs with Chemical and Biological Insecticides',
          ],
          whyValuable: 'Biocontrol potential high but limited mass production research in India.',
        },
        {
          id: 'ento-02',
          title: 'Semiochemicals and Insect Behavior Manipulation',
          description: 'Pheromones, kairomones, and push-pull strategies.',
          researchGap: 'Medium',
          paperCount: '24-35',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Field Evaluation of Synthetic Pheromones for Major Lepidopteran Pests',
            'Volatile Organic Compounds for Repelling Insect Pests: Push-Pull Strategy',
            'Mating Disruption Techniques for Diamondback Moth Management',
          ],
          whyValuable: 'Pheromone research growing but limited Indian crop-pest combinations studied.',
        },
        {
          id: 'ento-03',
          title: 'Nanotechnology in Insect Pest Management',
          description: 'Nano-insecticides, nano-encapsulation, and safety evaluation.',
          researchGap: 'High',
          paperCount: '15-25',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Development and Characterization of Nano-Encapsulated Botanical Insecticides',
            'Bioefficacy of Nano-Formulated Neem against Major Vegetable Pests',
            'Toxicological Assessment of Nano-Insecticides on Non-Target Organisms',
          ],
          whyValuable: 'Emerging field with limited systematic studies on Indian agricultural pests.',
        },
        {
          id: 'ento-04',
          title: 'Climate Change and Insect Pest Dynamics',
          description: 'Temperature effects, range expansion, and pest forecasting models.',
          researchGap: 'High',
          paperCount: '12-22',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Effect of Elevated Temperature on Life Table Parameters of Major Pests',
            'Predictive Modeling of Pest Outbreaks under Climate Change Scenarios',
            'Invasion Biology of Emerging Pests in Changing Climate',
          ],
          whyValuable: 'Climate change impact on Indian agriculture under-studied. Need region-specific models.',
        },
      ],
    },
    fruitFlies: {
      name: 'Fruit Flies (Bactrocera spp.)',
      topics: [
        {
          id: 'ffly-01',
          title: 'Sterile Insect Technique (SIT) Adaptation',
          description: 'Mass rearing, irradiation, and field release programs.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Gamma Irradiation Effects on Sterility and Competitiveness of Bactrocera cucurbitae',
            'Mass Rearing Protocol Optimization for Fruit Flies in SIT Programs',
            'Economic Feasibility of Area-Wide SIT for Fruit Fly Management',
          ],
          whyValuable: 'SIT successful globally but limited Indian research on local species.',
        },
        {
          id: 'ffly-02',
          title: 'Male Annihilation Technique (MAT) Formulations',
          description: 'Cuelure, methyl eugenol, and attractant combinations.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Long-Lasting Matrix Formulations for Methyl Eugenol and Cuelure',
            'Effectiveness of MAT in Area-Wide Fruit Fly Suppression Programs',
            'Spinosad-Based Bait Stations for Male Annihilation in Bactrocera spp.',
          ],
          whyValuable: 'MAT widely used but limited research on improved formulations and optimization.',
        },
      ],
    },
    whiteflies: {
      name: 'Whiteflies (Bemisia tabaci)',
      topics: [
        {
          id: 'whitefly-01',
          title: 'Biotype Characterization and Management',
          description: 'Genetic diversity, host range, and differential management.',
          researchGap: 'High',
          paperCount: '16-26',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Molecular Characterization of Bemisia tabaci Biotypes in North India',
            'Differential Insecticide Resistance Patterns in Distinct B. tabaci Biotypes',
            'Host Plant Preferences and Performance of Different Whitefly Biotypes',
          ],
          whyValuable: 'Multiple biotypes present but limited characterization in Indian context.',
        },
        {
          id: 'whitefly-02',
          title: 'Reflective Mulches for Whitefly Management',
          description: 'Silver mulch, aluminum foil, and optical manipulation.',
          researchGap: 'Medium',
          paperCount: '20-30',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Efficacy of Different Reflective Mulches for Whitefly Repulsion in Tomato',
            'Silver-Reflective Plastic Mulch: Cost-Benefit Analysis in Vegetable Crops',
            'Integration of Reflective Mulch with Biological Control for Whitefly Management',
          ],
          whyValuable: 'Non-chemical method effective but limited optimization studies for Indian conditions.',
        },
      ],
    },
  },

  plantPathology: {
    general: {
      name: 'General Plant Pathology',
      topics: [
        {
          id: 'patho-01',
          title: 'Trichoderma-Based Biocontrol Formulations',
          description: 'Mass production, shelf-life, and field efficacy of Trichoderma products.',
          researchGap: 'Medium',
          paperCount: '35-48',
          yearRange: '2012-2024',
          suggestedTitles: [
            'Development of Cost-Effective Carrier Formulations for Trichoderma harzianum',
            'Shelf-Life Enhancement of Trichoderma Formulations through Encapsulation',
            'Field Efficacy of Indigenous vs. Exotic Trichoderma Isolates against Soil-Borne Diseases',
          ],
          whyValuable: 'Trichodera extensively studied but gap in shelf-life and carrier formulation research.',
        },
        {
          id: 'patho-02',
          title: 'CRISPR-Mediated Disease Resistance',
          description: 'Gene editing, host resistance, and novel breeding approaches.',
          researchGap: 'High',
          paperCount: '8-16',
          yearRange: '2018-2024',
          suggestedTitles: [
            'CRISPR-Cas9 Mediated Editing of Susceptibility Genes in Tomato for Bacterial Wilt Resistance',
            'Gene Editing for Fungal Resistance: Targeting Cell Wall Receptor Kinases',
            'Regulatory and Biosafety Aspects of CRISPR Crops in India',
          ],
          whyValuable: 'Cutting-edge technology with very limited research in Indian crops.',
        },
        {
          id: 'patho-03',
          title: 'Biostimulants for Induced Systemic Resistance',
          description: 'Seaweed extracts, protein hydrolysates, and priming agents.',
          researchGap: 'High',
          paperCount: '14-24',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Seaweed Extract Formulations for Inducing Resistance against Foliar Diseases',
            'Protein Hydrolysates as Biostimulants: Mode of Action and Field Efficacy',
            'Integration of Biostimulants with Reduced Fungicide Programs',
          ],
          whyValuable: 'Emerging area in sustainable agriculture with limited systematic research.',
        },
      ],
    },
    fungal: {
      name: 'Fungal Disease Management',
      topics: [
        {
          id: 'fungal-01',
          title: 'Biological Control of Powdery Mildew',
          description: 'Ampelomyces, Bacillus, and fungal antagonist formulations.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Mycoparasitism by Ampelomyces quisqualis against Powdery Mildews',
            'Bacillus-Based Formulations for Powdery Mildew Suppression in Vegetables',
            'Integration of Biological and Botanicals for Powdery Mildew IPM',
          ],
          whyValuable: 'Powdery mildew ubiquitous but biological control options under-researched.',
        },
        {
          id: 'fungal-02',
          title: 'Anthracnose Resistance in Tropical Fruits',
          description: 'Colletotrichum species, resistance breeding, and management.',
          researchGap: 'High',
          paperCount: '16-26',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Pathogenic Variability of Colletotrichum spp. on Mango and Banana',
            'Screening of Mango Germplasm for Anthracnose Resistance',
            'Pre-Harvest Fungicide Application Protocols for Anthracnose Management',
          ],
          whyValuable: 'Major post-harvest problem. Limited pre-harvest management research.',
        },
      ],
    },
  },

  agronomy: {
    cereals: {
      name: 'Cereal Crops Research',
      topics: [
        {
          id: 'cereal-01',
          title: 'Conservation Agriculture in Rice-Wheat System',
          description: 'Zero-tillage, residue management, and sustainability indicators.',
          researchGap: 'Medium',
          paperCount: '40-55',
          yearRange: '2010-2024',
          suggestedTitles: [
            'Long-Term Effects of Conservation Agriculture on Soil Carbon in Rice-Wheat Belt',
            'Happy Seeder Technology: Adoption Constraints and Economic Analysis',
            'Crop Residue Management: Alternatives to Stubble Burning in North India',
          ],
          whyValuable: 'Well-studied area but gap in long-term sustainability and farmer adoption research.',
        },
        {
          id: 'cereal-02',
          title: 'Biofortification of Staple Cereals',
          description: 'Iron, zinc enrichment, and agronomic biofortification strategies.',
          researchGap: 'Medium',
          paperCount: '28-40',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Agronomic Biofortification of Wheat with Zinc and Iron Fertilization',
            'Genotype × Environment Interaction for Micronutrient Accumulation in Rice',
            'Biofortified Cereals: Consumer Acceptance and Nutritional Impact Studies',
          ],
          whyValuable: 'Growing area but limited field-scale agronomic protocols for Indian varieties.',
        },
        {
          id: 'cereal-03',
          title: 'System of Wheat Intensification (SWI)',
          description: 'SRI principles adapted for wheat, wider spacing, and organic management.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Performance of Wheat under System of Wheat Intensification in Different Agro-Ecologies',
            'Comparative Analysis of SWI vs. Conventional Wheat Cultivation',
            'Water Productivity and Economic Returns under SWI Method',
          ],
          whyValuable: 'SRI well-established for rice; SWI emerging but severely under-researched.',
        },
      ],
    },
    pulses: {
      name: 'Pulse Crops Research',
      topics: [
        {
          id: 'pulse-01',
          title: 'Rhizobial Inoculation and Biofertilizers',
          description: 'Native rhizobia, co-inoculation, and nitrogen fixation enhancement.',
          researchGap: 'Medium',
          paperCount: '32-45',
          yearRange: '2012-2024',
          suggestedTitles: [
            'Isolation and Characterization of Native Rhizobia from Different Agro-Climatic Zones',
            'Co-Inoculation of Rhizobium and PGPR for Enhanced Nodulation in Chickpea',
            'Carrier Formulation Development for Improved Shelf-Life of Rhizobial Inoculants',
          ],
          whyValuable: 'Extensive research exists but gap in indigenous strain evaluation and formulation.',
        },
        {
          id: 'pulse-02',
          title: 'Precision Farming in Pulses',
          description: 'Site-specific management, VRT, and sensor-based applications.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Site-Specific Nutrient Management in Pigeonpea using NDVI and Soil Sensors',
            'Variable Rate Technology for Fertilizer Application in Chickpea',
            'Unmanned Aerial Vehicle (UAV) Based Crop Monitoring in Pulse Crops',
          ],
          whyValuable: 'Precision agriculture expanding but limited application in pulses specifically.',
        },
      ],
    },
    oilseeds: {
      name: 'Oilseed Crops Research',
      topics: [
        {
          id: 'oil-01',
          title: 'Brassica juncea Genetic Diversity',
          description: 'Germplasm evaluation, diversity analysis, and trait identification.',
          researchGap: 'Medium',
          paperCount: '26-38',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Assessment of Genetic Diversity in Indian Mustard Germplasm using SSR Markers',
            'Identification of Promising Lines for Oil Content and Quality Traits',
            'Association Mapping for Yield and Quality Traits in Brassica juncea',
          ],
          whyValuable: 'Moderate research activity but gap in germplasm utilization for breeding.',
        },
        {
          id: 'oil-02',
          title: 'Safflower Improvement and Production',
          description: 'Drought tolerance, quality improvement, and stress physiology.',
          researchGap: 'High',
          paperCount: '14-22',
          yearRange: '2015-2023',
          suggestedTitles: [
            'Evaluation of Safflower Germplasm for Terminal Drought Tolerance',
            'Safflower Oil Quality Improvement through Breeding and Management',
            'Safflower as a Climate-Resilient Oilseed: Comparative Performance under Stress',
          ],
          whyValuable: 'Underutilized oilseed crop with climate resilience. Research severely limited.',
        },
      ],
    },
    fodder: {
      name: 'Fodder and Forage Crops',
      topics: [
        {
          id: 'fodder-01',
          title: 'Dual-Purpose Sorghum Cultivation',
          description: 'Grain and fodder dual-use varieties, cutting management.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2016-2023',
          suggestedTitles: [
            'Identification of Dual-Purpose Sorghum Varieties for Different Agro-Climatic Zones',
            'Effect of Cutting Management on Grain and Fodder Yield in Sorghum',
            'Economic Analysis of Dual-Purpose vs. Single-Purpose Sorghum Cultivation',
          ],
          whyValuable: 'Important for small farmers but limited systematic research on dual-purpose genotypes.',
        },
        {
          id: 'fodder-02',
          title: 'Multi-Cut Fodder Production Systems',
          description: 'Multi-cut varieties, nutrient management, and year-round fodder availability.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Performance of Multi-Cut Forage Sorghum and Pearl Millet Varieties',
            'Nutrient Management for Sustained Multi-Cut Fodder Production',
            'Integration of Fodder Crops in Intensive Cropping Systems',
          ],
          whyValuable: 'Dairy sector growth driving fodder demand. Limited research on intensive systems.',
        },
      ],
    },
  },

  plantBreeding: {
    general: {
      name: 'General Plant Breeding',
      topics: [
        {
          id: 'pb-01',
          title: 'Speed Breeding Protocols',
          description: 'Rapid generation advancement, controlled environments, and protocols.',
          researchGap: 'High',
          paperCount: '15-25',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Speed Breeding Protocol Development for Major Indian Food Crops',
            'Effect of Light Quality and Duration on Rapid Cycling in Wheat and Chickpea',
            'Cost-Effective Speed Bre Infrastructure for Public Sector Breeding Programs',
          ],
          whyValuable: 'Cutting-edge technology with limited adaptation research for Indian conditions.',
        },
        {
          id: 'pb-02',
          title: 'Doubled Haploid Technology',
          description: 'Haploid induction, chromosome doubling, and homozygous line development.',
          researchGap: 'High',
          paperCount: '12-22',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Development of Haploid Induction Lines in Indian Maize Germplasm',
            'Chromosome Doubling Agents: Efficiency and Toxicity Evaluation',
            'Application of DH Technology in Rice and Wheat Variety Development',
          ],
          whyValuable: 'Accelerates breeding but limited expertise and research in Indian public sector.',
        },
        {
          id: 'pb-03',
          title: 'Genomic Selection Implementation',
          description: 'GS models, training population optimization, and prediction accuracy.',
          researchGap: 'High',
          paperCount: '10-20',
          yearRange: '2018-2024',
          suggestedTitles: [
            'Genomic Selection Models for Yield Prediction in Rice Breeding Populations',
            'Optimization of Training Population Size and Composition for GS',
            'Integration of Genomic Selection with Conventional Phenotypic Selection',
          ],
          whyValuable: 'Advanced breeding approach with minimal implementation research in Indian crops.',
        },
      ],
    },
    mutation: {
      name: 'Mutation Breeding',
      topics: [
        {
          id: 'mut-01',
          title: 'Targeted Mutagenesis for Quality Traits',
          description: 'TILLING, EMS mutagenesis, and novel allele discovery.',
          researchGap: 'Medium',
          paperCount: '20-30',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Development of TILLING Populations in Chickpea for Trait Discovery',
            'EMS-Induced Mutations for Modifying Seed Coat Color in Pulses',
            'Targeted Mutagenesis for Reducing Anti-Nutritional Factors in Legumes',
          ],
          whyValuable: 'Mutation breeding established but limited modern targeted approaches.',
        },
        {
          id: 'mut-02',
          title: 'Induced Mutations for Abiotic Stress',
          description: 'Gamma rays, EMS, and drought/salinity tolerance screening.',
          researchGap: 'Medium',
          paperCount: '24-35',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Gamma Irradiation for Inducing Drought Tolerance in Wheat',
            'Screening of Mutant Populations for Salinity Tolerance in Rice',
            'Mutagen Dose Optimization for Major Indian Crops',
          ],
          whyValuable: 'Conventional approach but gap in systematic screening protocols.',
        },
      ],
    },
  },

  soilScience: {
    general: {
      name: 'Soil Science Research',
      topics: [
        {
          id: 'soil-01',
          title: 'Soil Microbiome Characterization',
          description: 'Metagenomics, microbial diversity, and functional analysis.',
          researchGap: 'High',
          paperCount: '18-28',
          yearRange: '2015-2024',
          suggestedTitles: [
            'Metagenomic Analysis of Rhizosphere Microbiome in Intensive Cropping Systems',
            'Effect of Organic Amendments on Soil Microbial Community Structure',
            'Functional Characterization of Beneficial Microbiome in Agricultural Soils',
          ],
          whyValuable: 'Cutting-edge area with limited research on Indian agricultural soils.',
        },
        {
          id: 'soil-02',
          title: 'Soil Carbon Sequestration',
          description: 'Conservation practices, carbon credits, and climate mitigation.',
          researchGap: 'Medium',
          paperCount: '28-40',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Long-Term Carbon Sequestration Potential of Conservation Agriculture',
            'Soil Organic Carbon Stock Assessment in Different Agro-Ecosystems',
            'Carbon Credits and Economic Incentives for Farmers: Policy Analysis',
          ],
          whyValuable: 'Climate change priority but limited long-term Indian studies.',
        },
        {
          id: 'soil-03',
          title: 'Nanofertilizers and Nutrient Use Efficiency',
          description: 'Nano-formulations, controlled release, and crop response.',
          researchGap: 'High',
          paperCount: '16-26',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Development and Characterization of Zinc and Iron Nanofertilizers',
            'Nano-Fertilizer Application for Improving Nutrient Use Efficiency in Rice',
            'Comparative Performance of Nano vs. Conventional Fertilizers in Field Conditions',
          ],
          whyValuable: 'Emerging technology with limited systematic field research.',
        },
      ],
    },
  },

  agEconomics: {
    general: {
      name: 'Agricultural Economics Research',
      topics: [
        {
          id: 'econ-01',
          title: 'Contract Farming in Horticulture',
          description: 'Models, farmer participation, and value chain integration.',
          researchGap: 'Medium',
          paperCount: '24-35',
          yearRange: '2014-2024',
          suggestedTitles: [
            'Contract Farming Models for Vegetables: Comparative Analysis',
            'Small Farmer Participation in Contract Farming: Constraints and Opportunities',
            'Value Chain Integration through Contract Farming in Horticulture',
          ],
          whyValuable: 'Policy push for contract farming but limited systematic research on implementation.',
        },
        {
          id: 'econ-02',
          title: 'Farmer Producer Organizations (FPOs)',
          description: 'Formation, functioning, and economic impact assessment.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2015-2024',
          suggestedTitles: [
            'Economic Impact of FPO Membership on Smallholder Income',
            'Governance and Sustainability of Farmer Producer Organizations',
            'Comparative Performance of FPOs vs. Traditional Marketing Channels',
          ],
          whyValuable: 'FPOs expanding rapidly but limited empirical research on actual impacts.',
        },
        {
          id: 'econ-03',
          title: 'Climate Risk Management and Insurance',
          description: 'PMFBY, index-based insurance, and farmer adoption.',
          researchGap: 'High',
          paperCount: '15-25',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Effectiveness of PMFBY in Reducing Farmer Vulnerability to Climate Risks',
            'Index-Based Weather Insurance: Design and Adoption Challenges',
            'Comparative Analysis of Traditional vs. Index-Based Crop Insurance',
          ],
          whyValuable: 'Important policy area but limited comprehensive evaluation research.',
        },
        {
          id: 'econ-04',
          title: 'Digital Agriculture Adoption',
          description: 'Agri-apps, e-NAM, and technology acceptance among farmers.',
          researchGap: 'High',
          paperCount: '12-22',
          yearRange: '2018-2024',
          suggestedTitles: [
            'Digital Literacy and Adoption of Agricultural Mobile Applications',
            'Impact of e-NAM on Price Discovery and Farmer Incomes',
            'Technology Acceptance Model for Precision Agriculture Technologies',
          ],
          whyValuable: 'Digital agriculture expanding but limited research on actual adoption barriers.',
        },
      ],
    },
  },

  postHarvest: {
    fruits: {
      name: 'Fruit Post-Harvest Technology',
      topics: [
        {
          id: 'ph-01',
          title: 'Edible Coatings for Shelf-Life Extension',
          description: 'Natural coatings, chitosan, aloe vera, and quality maintenance.',
          researchGap: 'Medium',
          paperCount: '28-40',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Development of Composite Edible Coatings using Chitosan and Plant Extracts',
            'Aloe vera Gel Coating for Extending Shelf Life of Tropical Fruits',
            'Effect of Edible Coatings on Physiological Weight Loss and Quality',
          ],
          whyValuable: 'Active research area but gap in composite coating formulations.',
        },
        {
          id: 'ph-02',
          title: 'Controlled Atmosphere Storage',
          description: 'CA/MA storage, modified packaging, and gas compositions.',
          researchGap: 'Medium',
          paperCount: '26-38',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Optimization of CA Storage Parameters for Indian Apple Varieties',
            'Modified Atmosphere Packaging for Tropical Fruits in Retail Supply Chain',
            'Low-Cost CA Storage Technology for Small-Scale Cold Storage Units',
          ],
          whyValuable: 'Well-studied but limited research on low-cost adaptations for Indian conditions.',
        },
        {
          id: 'ph-03',
          title: 'Minimal Processing of Fruits',
          description: 'Fresh-cut fruits, MAP, and safety protocols.',
          researchGap: 'High',
          paperCount: '14-24',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Quality and Safety of Fresh-Cut Papaya under Modified Atmosphere',
            'Anti-Browning Treatments for Minimally Processed Fruits',
            'Microbial Safety Protocols for Fresh-Cut Fruit Processing Units',
          ],
          whyValuable: 'Emerging market segment with limited research on tropical fruits specifically.',
        },
      ],
    },
    vegetables: {
      name: 'Vegetable Post-Harvest Technology',
      topics: [
        {
          id: 'ph-04',
          title: 'Evaporative Cooling Storage',
          description: 'Zero-energy cool chambers, brick structures, and shelf-life extension.',
          researchGap: 'Medium',
          paperCount: '22-32',
          yearRange: '2014-2023',
          suggestedTitles: [
            'Performance of Zero-Energy Cool Chambers for Vegetable Storage',
            'Design Optimization of Evaporative Cooling Structures for Different Climates',
            'Comparative Storage Life of Vegetables in Cool Chamber vs. Room Temperature',
          ],
          whyValuable: 'Low-cost technology suitable for small farmers. Limited design optimization research.',
        },
        {
          id: 'ph-05',
          title: 'Solar Drying Technologies',
          description: 'Solar dryers, hybrid systems, and quality retention.',
          researchGap: 'Medium',
          paperCount: '24-35',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Development of Low-Cost Solar Dryers for Small-Scale Vegetable Processing',
            'Hybrid Solar-Electric Dryer: Design and Performance Evaluation',
            'Effect of Drying Methods on Nutritional Quality of Dehydrated Vegetables',
          ],
          whyValuable: 'Active research but gap in hybrid systems and nutritional quality retention.',
        },
      ],
    },
  },

  organicFarming: {
    general: {
      name: 'Organic & Natural Farming',
      topics: [
        {
          id: 'org-01',
          title: 'Natural Farming (ZBNF) System Evaluation',
          description: 'Jeevamrut, bijamrut, mulching, and system comparison.',
          researchGap: 'High',
          paperCount: '12-20',
          yearRange: '2017-2024',
          suggestedTitles: [
            'Comparative Performance of Natural Farming vs. Organic Farming Systems',
            'Effect of Jeevamrut Application on Soil Health and Crop Productivity',
            'Economic Viability of Zero Budget Natural Farming in Different Agro-Climatic Zones',
          ],
          whyValuable: 'Policy priority with extremely limited scientific research.',
        },
        {
          id: 'org-02',
          title: 'Organic Input Production and Standardization',
          description: 'Vermicompost, biofertilizers, and quality standards.',
          researchGap: 'Medium',
          paperCount: '30-42',
          yearRange: '2012-2024',
          suggestedTitles: [
            'Standardization of Vermicompost Production using Different Organic Wastes',
            'Quality Standards and Testing Protocols for Organic Inputs in India',
            'On-Farm Production of Biofertilizers: Economic and Quality Analysis',
          ],
          whyValuable: 'Input quality major concern. Limited standardization research.',
        },
        {
          id: 'org-03',
          title: 'Organic Certification and PGS',
          description: 'Third-party vs. PGS, cost analysis, and farmer perception.',
          researchGap: 'High',
          paperCount: '10-18',
          yearRange: '2018-2024',
          suggestedTitles: [
            'Comparative Analysis of Third-Party Certification vs. PGS for Small Farmers',
            'Cost-Benefit Analysis of Organic Certification for Horticultural Crops',
            'Farmer Perception and Satisfaction with Participatory Guarantee System',
          ],
          whyValuable: 'Certification critical for market access. Limited comparative research.',
        },
        {
          id: 'org-04',
          title: 'Biodynamic Agriculture',
          description: 'Biodynamic preparations, cow pat pit, and system comparison.',
          researchGap: 'High',
          paperCount: '8-15',
          yearRange: '2017-2023',
          suggestedTitles: [
            'Effect of Biodynamic Preparations on Soil Biological Activity',
            'Comparative Performance of Biodynamic vs. Organic Farming Systems',
            'Biodynamic Agriculture: Scientific Validation and Adoption Barriers',
          ],
          whyValuable: 'Niche but growing interest. Very limited scientific research in India.',
        },
      ],
    },
  },

  agExtension: {
    general: {
      name: 'Agricultural Extension',
      topics: [
        {
          id: 'ext-01',
          title: 'ICT-Based Extension Delivery',
          description: 'Mobile apps, WhatsApp, YouTube, and digital advisory.',
          researchGap: 'Medium',
          paperCount: '26-38',
          yearRange: '2013-2024',
          suggestedTitles: [
            'Effectiveness of WhatsApp Groups for Agricultural Extension Delivery',
            'YouTube as an Extension Tool: Content Analysis and Farmer Engagement',
            'Comparative Effectiveness of Digital vs. Conventional Extension Methods',
          ],
          whyValuable: 'Digital transformation ongoing but limited effectiveness research.',
        },
        {
          id: 'ext-02',
          title: 'Farmer-to-Farmer Extension',
          description: 'Lead farmers, peer learning, and innovation diffusion.',
          researchGap: 'High',
          paperCount: '12-22',
          yearRange: '2016-2024',
          suggestedTitles: [
            'Effectiveness of Farmer-to-Farmer Extension in Technology Dissemination',
            'Characteristics and Role of Lead Farmers in Extension System',
            'Peer Learning Networks for Sustainable Agriculture Adoption',
          ],
          whyValuable: 'Alternative extension approach with limited systematic research.',
        },
        {
          id: 'ext-03',
          title: 'Climate Change Communication',
          description: 'Adaptive practices, perception studies, and communication strategies.',
          researchGap: 'High',
          paperCount: '10-20',
          yearRange: '2018-2024',
          suggestedTitles: [
            'Farmer Perception of Climate Change and Adaptation Intentions',
            'Communication Strategies for Promoting Climate-Smart Agriculture',
            'Effectiveness of Different Extension Methods for Climate Adaptation Technologies',
          ],
          whyValuable: 'Critical area with extremely limited communication research.',
        },
      ],
    },
  },
};

// Helper functions
export const getFieldById = (fieldId) => THESIS_FIELDS[fieldId] || null;

export const getTopicsByField = (fieldId) => {
  return RESEARCH_TOPICS[fieldId] || {};
};

export const getAllTopics = () => {
  const allTopics = [];
  Object.entries(RESEARCH_TOPICS).forEach(([fieldId, crops]) => {
    const field = THESIS_FIELDS[fieldId];
    Object.entries(crops).forEach(([cropKey, cropData]) => {
      cropData.topics.forEach(topic => {
        allTopics.push({
          ...topic,
          fieldId,
          fieldName: field?.name || fieldId,
          cropKey,
          cropName: cropData.name,
        });
      });
    });
  });
  return allTopics;
};

export const getHighGapTopics = () => {
  return getAllTopics().filter(t => t.researchGap === 'High');
};

export const searchTopics = (query) => {
  const q = query.toLowerCase();
  return getAllTopics().filter(t => 
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.cropName.toLowerCase().includes(q) ||
    t.fieldName.toLowerCase().includes(q) ||
    t.suggestedTitles.some(st => st.toLowerCase().includes(q))
  );
};

export const filterTopics = ({ fieldId, gapLevel, cropName }) => {
  let topics = getAllTopics();
  
  if (fieldId) {
    topics = topics.filter(t => t.fieldId === fieldId);
  }
  
  if (gapLevel) {
    topics = topics.filter(t => t.researchGap === gapLevel);
  }
  
  if (cropName) {
    topics = topics.filter(t => t.cropName.toLowerCase().includes(cropName.toLowerCase()));
  }
  
  return topics;
};
