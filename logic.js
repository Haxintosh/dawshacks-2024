// energy
let totalEnergyComsumption;
let totalEnergyProduction;

let energyComsumptionFomula = (x) => 0.035*((x-1900)**2)+40

let storageCapacity;
// Pollution
let ghgProduction;
let totalPollution;

// Anti-Pollution
let naturalPollutionReduction;
let artificalPollutionReduction;
let nTrees;

// Ressources
let totalRessources;
let ressourcesProduction;

let totalFossil;
let totalUranium;

// Economy
let money;
let maintenanceFees;

// Time
let year = 1900;
let month = 1;
let weather;

// Code
let oldDelta = 0;
let msPerCycle = 500;

const notableYears = {
    1904: "First geothermal power plant (Larderello, Italy)",
    1927: "Wind turbines go commercial",
    1935: "Hoover Dam",
    1954: "First solar cell",
    1957: "First commercial nuclear plant",
    1974: "Wave power",
    1980: "US Wind Power Development Act (spurred wind energy growth)",
    1991: "First offshore wind farm (Vindeby, Denmark)",
    2001: "Germany introduces strong renewable energy incentives", 
    2008: "Tesla Roadster released, boosting electric vehicle interest",
    2015: "Paris Agreement on climate change",
    2023: "IRA (Inflation Reduction Act) passes in the US (major clean energy boost)", 
    2030: "Predictions: Solar and wind dominate new electricity generation",
    2040: "Predictions: Energy storage solutions revolutionize grid flexibility",
    2050: "Predictions: Fusion power closer to commercialization" 
};


class EnergyGenerator {
    constructor(ghgEmissions, spaceRequired, energyProduction, maintenanceFees, lifespan, constructionMaterials, recurringMaterial, fuelDuration, type) {
        this.ghgEmissions = ghgEmissions; // Greenhouse Gas Emissions (pollution) in tons per year
        this.spaceRequired = spaceRequired; // Space required in square meters
        this.energyProduction = energyProduction; // Energy production in Megawatt-hours per year
        this.maintenanceFees = maintenanceFees; // Maintenance fees in currency per year
        this.lifespan = lifespan; // Lifespan in years
        this.constructionMaterials = constructionMaterials; // Number of materials for construction
        this.recurringMaterial = recurringMaterial; // Number of materials for recurring fuel
        this.fuelDuration = fuelDuration; // Duration of fuel in years
        this.type = type; // Type of generator
    }
}

class WindGenerator extends EnergyGenerator {
    constructor() {
        super(0, 2000, 5000, 10000, 20, 100, 0, 0, "wind"); 
    }
}

class HydroGenerator extends EnergyGenerator {
    constructor() {
        super(0, 5000, 10000, 15000, 50, 500, 0, 0, "hydro"); 
    }
}

class FossilFuelGenerator extends EnergyGenerator {
    constructor() {
        super(5000, 3000, 8000, 20000, 30, 300, 100, 1, "fossil"); 
    }
}

class SolarGenerator extends EnergyGenerator {
    constructor() {
        super(0, 1000, 3000, 5000, 25, 100, 0, 0, "solar");
    }
}

class NuclearGenerator extends EnergyGenerator {
    constructor() {
        super(0, 4000, 10000, 30000, 40, 2000, 200, 5, "nuclear"); 
    }
}

class EnergyStorage {
    constructor(capacity, lifespan, maintenanceFees, constructionMaterials, efficiency, type) {
        this.capacity = capacity; // Capacity in Megawatt-hours
        this.lifespan = lifespan; // Lifespan in years
        this.maintenanceFees = maintenanceFees; // Maintenance fees in currency per year
        this.constructionMaterials = constructionMaterials; // Number of materials for construction
        this.efficiency = efficiency; // Efficiency in percent
        this.type = type; // Type of storage
    }
}

class Battery extends EnergyStorage {
    constructor() {
        super(1000, 5, 500, 50, 90);
    }
}
class Flywheel extends EnergyStorage {
    constructor() {
        super(2000, 15, 1500, 150, 85);
    }
}
class PumpedHydro extends EnergyStorage {
    constructor() {
        super(10000, 50, 5000, 500, 67);
    }
}
class SMES extends EnergyStorage {
    constructor() {
        super(1000, 25, 2500, 250, 95);
    }
}
class CAES extends EnergyStorage {
    constructor() {
        super(5000, 30, 3000, 300, 70);
    }
}
class thermalStorage extends EnergyStorage {
    constructor() {
        super(5000, 10, 1000, 100, 80);
    }
}

setInterval(calculate, 100);

let energyGenerators = [
    new WindGenerator(),
    new HydroGenerator(),
    new FossilFuelGenerator(),
    new SolarGenerator(),
    new NuclearGenerator()
];
let energyStorages = [
    new Battery(),
    new Flywheel(),
    new PumpedHydro(),
    new SMES(),
    new CAES(),
    new thermalStorage()
];
function calculate() {
    //let delta = performance.now() - oldDelta;
    //if (delta < msPerCycle) return;
    //oldDelta = performance.now();
    month++;
    if (month > 12) {
        month = 1;
        year++;
    }
    // Calculate energy
    let x = year + month / 12;
    totalEnergyComsumption = energyComsumptionFomula(x)*600;
    totalEnergyProduction = 0;

    for (let generator of energyGenerators) {
        if (generator.type === "solar" && weather === "sunny") {
            totalEnergyProduction += generator.energyProduction*1.5;
            continue;
        }
        if (generator.type === "solar" && weather === "cloudy") {
            totalEnergyProduction += generator.energyProduction*0.5;
            continue;
        }
        if (generator.type === "wind" && weather === "windy") {
            totalEnergyProduction += generator.energyProduction*1.5;
            continue;
        }
        if (generator.type === "wind" && weather === "calm") {
            totalEnergyProduction += generator.energyProduction*0.5;
            continue;
        }
        if (generator.type === "hydro" && weather === "rainy") {
            totalEnergyProduction += generator.energyProduction*1.5;
            continue;
        }
        if (generator.type === "hydro" && weather === "dry") {
            totalEnergyProduction += generator.energyProduction*0.5;
            continue;
        }
        
        if (generator.fuelDuration > 0 && generator.type === "fossil") {
            generator.fuelDuration--;
            if (generator.fuelDuration === 0) {
                if (totalFossil - generator.recurringMaterial > 0 ) {
                    generator.fuelDuration = 1;
                    totalFossil -= generator.recurringMaterial;
                    generator.energyProduction = 8000;
                } else {
                    generator.energyProduction = 0;
                }
            } else {
                generator.energyProduction = 8000;
            }
        } else if (generator.fuelDuration > 0 && generator.type === "nuclear") {
            generator.fuelDuration--;
            if (generator.fuelDuration === 0) {
                if (totalUranium - generator.recurringMaterial > 0 ) {
                    generator.fuelDuration = 5;
                    totalUranium -= generator.recurringMaterial;
                    generator.energyProduction = 10000;
                } else {
                    generator.energyProduction = 0;
                }
            } else {
                generator.energyProduction = 10000;
            }
        }
        totalEnergyProduction += generator.energyProduction;
    }
    // Calculate pollution
    ghgProduction = 0;

    for (let generator of energyGenerators) {
        if (generator.energyProduction === 0) continue;
        ghgProduction += generator.ghgEmissions;
    }

    totalPollution =+ ghgProduction;
    
    // Calculate anti-pollution
    naturalPollutionReduction = 0;
    artificalPollutionReduction = 0;
    naturalPollutionReduction = nTrees * 500;

        // calculate artificalPollutionReduction

    totalPollution -= naturalPollutionReduction;
    totalPollution -= artificalPollutionReduction;

    // Calculate money
    for (let generator of energyGenerators) {
        money -= generator.maintenanceFees;
    }

    for (let storage of energyStorages) {
        money -= storage.maintenanceFees;
    }

    // Calculate time
    if (year in notableYears) {
        console.log(notableYears[year]);
    }

    // Update Lifetime
    for (let generator of energyGenerators) {
        generator.lifespan--;
    }
    for (let storage of energyStorages) {
        storage.lifespan--;
    }
    for (let generator of energyGenerators) {
        if (generator.lifespan <= 0) {
            energyGenerators.splice(energyGenerators.indexOf(generator), 1);
        }
    }
    for (let storage of energyStorages) {
        if (storage.lifespan <= 0) {
            energyStorages.splice(energyStorages.indexOf(storage), 1);
        }
    }
    
    // calculate storage
    storageCapacity = 0;
    for (let storage of energyStorages) {
        storageCapacity += storage.capacity * storage.efficiency;
    }

    // end
    if (totalEnergyProduction < totalEnergyComsumption) {
        if (totalEnergyProduction < totalEnergyComsumption+storageCapacity) {
            console.log("You are running out of energy!");
        } else {
            console.log("You are running out of energy, but you have enough storage!");
        }
    }
}
