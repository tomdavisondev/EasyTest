const NodeCache = require("node-cache");
const Project = require('../models/Project');
const cache = new NodeCache();

class ProjectCache {
  constructor() {
    this.cacheKey = "projectList";
  }

  async refreshCache() {
    try {
      const projectList = await Project.find().populate("testcases");
      const projectsWithFixedImages = this.fixProjectImages(projectList);

      cache.set(this.cacheKey, JSON.stringify(projectsWithFixedImages));
      console.log("Cache refreshed.");
    } catch (error) {
      console.error("Error refreshing cache:", error);
    }
  }

  async getProjectList() {
    const cacheKey = "projectList";
  
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      const projects = JSON.parse(cachedData);
      return this.fixProjectImages(projects); // Fix project images before returning
    }
  
    const projectList = await Project.find().populate("testcases");
    const projectsWithFixedImages = this.fixProjectImages(projectList); // Fix project images
  
    cache.set(cacheKey, JSON.stringify(projectsWithFixedImages));
  
    return projectsWithFixedImages;
  }

  async getProjectByName(projectName) {
    const cachedData = cache.get(projectName);
    if (cachedData) {
      const project = JSON.parse(cachedData);
      return this.fixProjectImages(project); // Fix project images before returning
    }
  
    const project = await Project.findOne({ projectname: projectName }).populate("testcases");
    const projectWithFixedImages = this.fixProjectImages(project); // Fix project images
  
    cache.set(projectName, JSON.stringify(projectWithFixedImages));
  
    return projectWithFixedImages;
  }

  //Converts project images that have been converted to buffer objects by cache
  fixProjectImages(projects) {
    if (!Array.isArray(projects)) {
      // Single project case
      const project = projects;
      project.testcases.forEach(testcase => {
        if (testcase.testcaseImage && testcase.testcaseImage.data.type === 'Buffer') {
          testcase.testcaseImage.data = {
            _bsontype: 'Binary',
            sub_type: 0,
            position: 0,
            buffer: Buffer.from(testcase.testcaseImage.data.data),
          };
        }
      });
      return project;
    } else {
      // Array of projects case
      projects.forEach(project => {
        if (project.projectImage && project.projectImage.data.type === 'Buffer') {
          project.projectImage.data = {
            _bsontype: 'Binary',
            sub_type: 0,
            position: 0,
            buffer: Buffer.from(project.projectImage.data.data),
          };
        }
      });
      return projects;
    }
  }
}

module.exports = ProjectCache;
