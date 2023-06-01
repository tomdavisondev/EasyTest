const NodeCache = require("node-cache");
const Requirement = require('../models/Requirements');
const cache = new NodeCache();

class RequirementCache {
    constructor() {
        this.cacheKey = "requirementList";
      }
    
      async refreshCache() {
        try {
          const requirements = await Requirement.find({}).exec();
          cache.set(this.cacheKey, JSON.stringify(requirements));
          console.log("Cache refreshed.");
        } catch (error) {
          console.error("Error refreshing cache:", error);
        }
      }

    async getRequirementList() {
        const cacheKey = "requirementList";
        
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
          const requirements = JSON.parse(cachedData);
          return this.fixRequirementImages(requirements); // Fix requirement images before returning
        }
    
        const requirementList = await Requirement.find();
        const requirementsWithFixedImages = this.fixRequirementImages(requirementList); // Fix requirement images
    
        cache.set(cacheKey, JSON.stringify(requirementsWithFixedImages));
    
        return requirementsWithFixedImages;
    }

    async getRequirementByName(requirementName) {
      const cachedData = cache.get(requirementName);
      if (cachedData) {
        const requirement = JSON.parse(cachedData);
        return this.fixRequirementImages(requirement); // Fix requirement images before returning
      }
    
      const requirement = await Requirement.findOne({ requirementname: requirementName });
      const requirementWithFixedImages = this.fixRequirementImages(requirement); // Fix requirement images
    
      cache.set(requirementName, JSON.stringify(requirementWithFixedImages));
    
      return requirementWithFixedImages;
    }

    //Converts requirement images that have been converted to buffer objects by cache
    fixRequirementImages(requirements) {
      if (!Array.isArray(requirements)) {
        // Single requirement case
        const requirement = requirements;
        return requirement;
      } else {
        // Array of requirements case
        requirements.forEach(requirement => {
          if (requirement.requirementImage && requirement.requirementImage.data.type === 'Buffer') {
            requirement.requirementImage.data = {
              _bsontype: 'Binary',
              sub_type: 0,
              position: 0,
              buffer: Buffer.from(requirement.requirementImage.data.data),
            };
          }
        });
        return requirements;
      }
    }
}

module.exports = RequirementCache;
