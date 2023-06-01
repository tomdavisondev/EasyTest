const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const methodOverride = require('method-override');
const ProjectCache = require('../config/projectcache');
const projectCache = new ProjectCache();

// Project model
const Project = require('../models/Project')
const Requirement = require('../models/Requirements')
const User = require('../models/User');

router.post('/:projectname/:testcasename/updatetest', (req, res) => {
  const projectname = req.params.projectname;
  const testcasename = req.params.testcasename;

  // find the project by name
  Project.findOne({ projectname: projectname }, (err, project) => {
    if (err) {
      console.error(err);
      req.flash('error_msg', "Project not found");
    } else {
      // find the test case by name
      const testcase = project.testcases.find((tc) => tc.name === testcasename);
      if (!testcase) {
        req.flash('error_msg', "Test case not found");
      } else {
        // update the test case with the provided data
        testcase.name = req.body.title;
        testcase.description = req.body.description;
        testcase.teststeps = req.body.updatedsteps;

        // save the updated project
        project.save(async (err, updatedProject) => {
          if (err) {
            console.error(err);
            req.flash('error_msg', "Error updating test case");
            res.redirect('/project/' + projectname + '/' + testcasename);
          } else {
            console.log(`Test case ${testcasename} updated successfully`);
            await projectCache.refreshCache();
            req.flash('success_msg', "Project updated successfully");
            res.redirect('/project/' + projectname + '/' + testcasename);
          }
        });
      }
    }
  });
});



router.post('/:projectname/:testcasename/updatetestcasetitle', (req, res) => {
    let projectname = req.params.projectname;
    let testcasename = req.params.testcasename;
    console.log(req.body.title);
    let newTestCaseName = req.body.title;

    //Check if the newTestCaseName is empty
    if (!newTestCaseName) {
        req.flash('error_msg', "New name cannot be empty");
        res.redirect('/project/' + projectname + '/' + testcasename);
        return;
    }
    
    console.log(`Updating name of test case "${testcasename}" in project "${projectname}" to "${newTestCaseName}"`);
    
    Project.findOne({projectname: projectname})
    .then(project => {
      if (project) {
        var testcase = project.testcases.find(obj => {
          return obj.name === testcasename
        });
    
        if (testcase) {
          Project.update(
            {_id: project._id, "testcases._id": testcase._id},
            {$set: {"testcases.$.name": newTestCaseName}}
          )
            .then(async project => {
              await projectCache.refreshCache();
              req.flash('success_msg', "Test name updated");
              res.redirect('/project/' + projectname + '/' + newTestCaseName);
            })
            .catch(error => {
              req.flash('error_msg', "Error updating test name");
              res.redirect('/project/' + projectname + '/' + testcasename);
            });
        } else {
          req.flash('error_msg', "Test case not found");
          res.redirect('/projects');
        }
      } else {
        req.flash('error_msg', "Project not found");
        res.redirect('/projects');
      }
    })
    .catch(error => {
      req.flash('error_msg', "Error finding project");
      res.redirect('/projects');
    });
});

router.post('/:projectname/:testcasename/updatedescription', (req, res) => {
    let projectname = req.params.projectname;
    let testcasename = req.params.testcasename;
    let description = req.body.description;
    
    //Check if the description is empty
    if (!description) {
        req.flash('error_msg', "Description cannot be empty");
        res.redirect('/project/' + projectname + '/' + testcasename);
        return;
    }
    // Your logic to update the description of a test case in the database
  
    console.log(`Updating description of test case "${testcasename}" in project "${projectname}" to "${description}"`);

    Project.findOne({projectname: projectname})
    .then(project => {
      if (project) {
        var testcase = project.testcases.find(obj => {
          return obj.name === testcasename
        });
  
        if (testcase) {
          Project.update(
            {_id: project._id, "testcases._id": testcase._id},
            {$set: {"testcases.$.description": req.body.description}}
          )
            .then(async project => {
              await projectCache.refreshCache();
              req.flash('success_msg', "Test description updated");
              res.redirect('/project/' + projectname + '/' + testcasename);
            })
            .catch(error => {
              req.flash('error_msg', "Error updating test description");
              res.redirect('/project/' + projectname + '/' + testcasename);
            });
        } else {
          req.flash('error_msg', "Test case not found");
          res.redirect('/projects');
        }
      } else {
        req.flash('error_msg', "Project not found");
        res.redirect('/projects');
      }
    })
    .catch(error => {
      req.flash('error_msg', "Error finding project");
      res.redirect('/projects');
    });
});

//New Test Case Handle
router.post('/:projectname/addtestcase', (req, res) => {
    let testcasename = req.body.testcasename;
    let testcasedescription = req.body.testcasedescription;
    let generatedIcon = req.body.testcaseIconContainer_generatedIcon;
    let errors = [];

    let user = req.user;
    let projectname = req.params.projectname;
    
    if (!testcasename || !testcasedescription) {
        errors.push({msg: 'Please fill in all fields'});
    }
    
    Project.find({}).exec(function(err, projects) {
    
    if (errors.length > 0) {
        req.flash('error_msg', "Please fill in all fields");
        res.redirect('/project/' + encodeURIComponent(projectname));
    } else {
        Project.find({}).exec(function(err, projects) {
        Project.findOne({projectname: projectname})
            .then(project => {
                if (project) {
                    let duplicate = false;
                    project.testcases.forEach(testcase => {
                        if (testcase.name === testcasename) {
                            duplicate = true;
                        }
                    });
                    if (duplicate) {
                        req.flash('error_msg', "Test case with the same name already exists");
                        res.redirect('/project/' + projectname);
                    } else {
                        Project.update(
                            { _id: project._id },
                            { $push: 
                                { testcases: 
                                    {
                                        name: testcasename,
                                        description: testcasedescription,
                                        testcaseImage: {
                                          data: generatedIcon,
                                          contentType: 'image/png'
                                        }
                                    } 
                                }
                            })
                        .then(async project => {
                            console.log("b4 " + projectCache.getProjectByName(project.projectname));
                            await projectCache.refreshCache();
                            console.log("after " + projectCache.getProjectByName(project.projectname));
                            console.log("UserLog: Created new test case" + "\n" + "name: " + testcasename + "\n" + "description: " + testcasedescription + "image" + generatedIcon);
                            req.flash('success_msg', "Test case added successfully");
                            res.redirect('/project/' + projectname);
                        })
                    }
                } else {
                    req.flash('error_msg', "Something went wrong, test case was not added");
                    console.log("ERROR: -- Test case was not added" + "\n" + errors);
                    res.render('/project/' + projectname, {
                        errors,
                        projects,
                        name: user.name
                    });
                }
            })
        });
    }
});
});

router.post('/:projectname/:testcasename/clone-to', async (req, res) => {
  const { projectname, testcasename } = req.params;
  const selectedProjects = Object.keys(req.body);

  try {
    // Find the original test case
    const project = await Project.findOne({ projectname });
    const testcase = project.testcases.find(tc => tc.name === testcasename);

    // Clone the test case to selected projects
    for (let projectName of selectedProjects) {
      if (projectName !== projectname) {
        const targetProject = await Project.findOne({ projectname: projectName });

        let clonedName = `${testcase.name} (1)`;
        let i = 2;
        while (targetProject.testcases.some(tc => tc.name === clonedName)) {
          clonedName = `${testcase.name} (${i++})`;
        }
        const clonedTestcase = { ...testcase.toObject(), name: clonedName };

        targetProject.testcases.push(clonedTestcase);
        await targetProject.save();
      }
    }

    await projectCache.refreshCache();
    req.flash('success_msg', "Test case cloned successfully");
    console.log("Cloned test case (" + testcasename + ") to: " + selectedProjects);
    res.redirect('/project/' + projectname);
  } catch (err) {
      console.log("ERROR: -- test case could not be cloned!");
      console.log(err);
      req.flash('error_msg', "Something went wrong, step could not be cloned");
      res.redirect('/project/' + projectname);
  }
});

router.get('/:projectname/:testcasename/clone-here', async (req, res) => {
    const { projectname, testcasename } = req.params;
  
    try {
      // Find the original test case
      const project = await Project.findOne({ projectname });
      const testcase = project.testcases.find(tc => tc.name === testcasename);
  
      // Make a copy of the test case
      let clonedName = `${testcase.name} (1)`;
      let i = 2;
      while (project.testcases.some(tc => tc.name === clonedName)) {
        clonedName = `${testcase.name} (${i++})`;
      }
      const clonedTestcase = { ...testcase.toObject(), name: clonedName };
  
      // Add the cloned test case to the project and save it
      project.testcases.push(clonedTestcase);
      await project.save();
  
      await projectCache.refreshCache();
      req.flash('success_msg', "Test case cloned successfully");
      console.log("Cloned test case: " + testcase);
      res.redirect('/project/' + projectname);
    } catch (err) {
        console.log("ERROR: -- test case could not be cloned-here!");
        console.log(err);
        req.flash('error_msg', "Something went wrong, step could not be cloned");
        res.redirect('/project/' + projectname);
    }
  });

router.post('/:projectname/:testcasename/delete', (req, res) => {
    const { projectname, testcasename } = req.params;
  
    console.log("got here");
  
    Project.findOneAndUpdate(
      { projectname },
      { $pull: { testcases: { name: testcasename } } }
    )
      .then(async () => {
        await projectCache.refreshCache();
        req.flash('success_msg', "Test case deleted successfully");
        console.log("Deleted test case " + testcasename);
        res.redirect('/project/' + projectname);
      })
      .catch((err) => {
        console.log("ERROR: -- Test case could not be deleted!");
        console.log(err);
        req.flash('error_msg', "Something went wrong, step could not be deleted");
        res.redirect('/project/' + projectname);
      });
  });

  router.post('/:projectname/delete', (req, res) => {
    const { projectname } = req.params;
  
    Project.deleteOne({ projectname })
      .then(async() => {
        await projectCache.refreshCache();
        console.log("Deleted project " + projectname);
        req.flash('success_msg', 'Project deleted successfully');
        res.redirect('/dashboard');
      })
      .catch((err) => {
        console.log("ERROR: -- Project could not be deleted!");
        console.log(err);
        req.flash('error_msg', 'Something went wrong, project could not be deleted');
        res.redirect('/dashboard');
      });
  });
  
  router.post('/:projectname/:testcasename/deleteteststep', (req, res) => {
    const { projectname, testcasename } = req.params;
    const { stepId, stepIndex } = req.body;

    console.log("Test case steps" + Project.find({projectname, 'testcases.name': testcasename}) + "\n StepId" +stepId)
  
    Project.findOneAndUpdate(
      { projectname, 'testcases.name': testcasename },
      { $pull: { [`testcases.$.teststeps`]: { _id: stepId } } }
    )
      .then(async() => {
        await projectCache.refreshCache();
        console.log("Test step(" + stepId + ") from testcase " + testcasename);
        req.flash('success_msg', 'Test step deleted successfully');
        res.redirect(`/project/${projectname}/${testcasename}`);
      })
      .catch((err) => {
        console.log("ERROR: -- Test step could not be deleted!");
        console.log(err);
        req.flash('error_msg', 'Something went wrong, test step could not be deleted');
        res.redirect(`/project/${projectname}/${testcasename}`);
      });
  });
  
  

router.post('/:projectname/:testcasename/updateteststep', (req, res) => {
    let projectId = req.body.projectId;
    let testcaseId = req.body.testcaseId;
    let stepId = req.body.stepId;
    
    let errors = [];

    if (!stepId) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (errors.length > 0) {
        Project.find({}).exec((err, projects) => {
            res.render('dashboard', {
                req: req,
                errors,
                projects,
                name: req.user.name
            });
        });
    } else {
        Project.findOneAndUpdate({
            "_id": ObjectId(projectId),
            "testcases._id": ObjectId(testcaseId),
            "testcases.teststeps._id": ObjectId(stepId)
        },
        {
            $set: {
                "testcases.$[testcase].teststeps.$[teststep].stepmethod": req.body.updatedStepMethodField,
                "testcases.$[testcase].teststeps.$[teststep].stepexpected": req.body.updatedStepExpectedResultsField,
                "testcases.$[testcase].teststeps.$[teststep].stepactual": req.body.updatedStepActualResultsField
            }
        },
        {
            "multi": false,
            "upsert": false,
            "useFindAndModify": true,
            arrayFilters: [
                {
                    "testcase._id": {
                        "$eq": ObjectId(testcaseId)
                    }
                },
                {
                    "teststep._id": {
                        "$eq": ObjectId(stepId)
                    }
                }
            ]
        })
        .then(async () => {
            await projectCache.refreshCache();
            console.log("Test step updated");
            req.flash('success_msg', "Step updated");
            res.redirect('/project/' + req.params.projectname + '/' + req.params.testcasename);
        })
        .catch(err => {
            req.flash('error_msg', "Something went wrong, step was not updated");
            console.log("ERROR: -- Test step could not be updated!");
            console.log(err);
            Project.find({}).exec((err, projects) => {
                res.render('dashboard', {
                    errors: [{ msg: "Something went wrong, step was not updated" }],
                    projects,
                    name: req.user.name,
                    req:req,
                });
            });
        });
    }
});

router.get('/:projectname/:testcasename/clone-step-here', async (req, res) => {
  const { projectname, testcasename } = req.params;
  const { stepIndex, stepId } = req.query;

  console.log(`stepIndex: ${stepIndex}, stepId: ${stepId}`);

  try {
    // Find the original test case
    const project = await Project.findOne({ projectname });
    const testcase = project.testcases.find(tc => tc.name === testcasename);
    const teststep = testcase.teststeps.find(ts => ts.stepnumber === parseInt(stepIndex) + 1);    

    console.log(teststep);

    // Create cloned step with new stepnumber
    const clonedStep = {
      stepnumber: teststep.stepnumber + 1,
      stepmethod: teststep.stepmethod,
      stepexpected: teststep.stepexpected,
      stepactual: teststep.stepactual
    };

    // Insert the cloned step after the original
    testcase.teststeps.splice(testcase.teststeps.indexOf(teststep) + 1, 0, clonedStep);

    // Save to database
    await project.save();

    await projectCache.refreshCache();
    req.flash('success_msg', "Test case cloned successfully");
    console.log
    res.redirect('/project/' + projectname + '/' + testcasename);
  } catch (err) {
      console.log("ERROR: -- Test step could not be cloned here!");
      console.log(err);
      req.flash('error_msg', "Something went wrong, step could not be cloned");
      res.redirect('/project/' + projectname + '/' + testcasename);
  }
});

router.get('/:projectname/:testcasename/addteststep', async (req, res) => {
  try {
    const projectname = req.query.projectname;
    const testcasename = req.query.testcasename;

    // Find the project that contains the test case
    const project = await Project.findOne({ projectname }).exec();
    if (!project) {
      req.flash('error', 'Project not found');
      res.redirect('back');
    }

    // Find the test case within the project
    const testcase = project.testcases.find(tc => tc.name === testcasename);
    if (!testcase) {
      req.flash('error', 'Test case not found');
      res.redirect('back');
    }

    // Append the new test step to the test case
    const newStep = {
      stepnumber: testcase.teststeps.length + 1,
      stepmethod: "",
      stepexpected: "",
      stepactual: ""
    };
    testcase.teststeps.push(newStep);

    // Save the updated project
    await project.save();

    // Redirect back to the test case page with success message
    console.log("Added test step in " + projectname + testcasename);
    await projectCache.refreshCache();
    req.flash('success_msg', 'Test step added successfully!');
    res.redirect(`/project/${projectname}/${testcasename}/edit`);
  } catch (error) {
    console.log("ERROR: -- A test step could not be added")
    console.log(error);
    req.flash('error_msg', 'An error occurred');
    res.redirect('back');
  }
});


  

//New Project Handle
router.post('/addproject', (req, res) => {
    let generatedIcon = req.body.projectIconContainer_generatedIcon;
    let projectname = req.body.projectname;
    let requirements = req.body.requirements;
    let projectshorthand = req.body.projectshorthand;
    let projects = req.body.projects;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (requirements == undefined) {
        Requirement.find({}).exec(function(err, requirementlist) {
            requirements = requirementlist;
        });
    }

    if (!projectname || !projectshorthand) {
        errors.push({msg: 'Please fill in all fields'});
    }

    if (!projects) {
        Project.find({}).exec(function(err, projectlist) {
            let projects = projectlist;
        });
    }

    Project.find({}).exec(function(err, projectlist) {
        projects = projectlist;
        if (errors.length > 0) {
            console.log(errors);
            res.render('dashboard', {
                errors,
                name,
                user,
                projectname,
                projectshorthand,
                projects,
                requirements: requirements,
                selectedTarget: "projects",
                req:req
            });
        } else {
          Project.findOne({
            $or: [
                { projectname: { $regex: new RegExp("^" + projectname + "$", "i") } },
                { projectshorthand: { $regex: new RegExp("^" + projectshorthand + "$", "i") } }
            ]
          })
          .then(project => {
            if (project) {
                if (project.projectname.toLowerCase() === projectname.toLowerCase()) {
                    //Project exists with the same projectname
                    req.flash('error_msg', "Project already exists under that name");
                } else {
                    //Project exists with the same projectshorthand
                    req.flash('error_msg', "Project already exists with that shorthand");
                }
                res.redirect('../dashboard');
            } else {
                const newProject = new Project({
                    projectname,
                    projectshorthand,
                    projectImage: {
                      data: generatedIcon,
                      contentType: 'image/png'
                    }
                });
                newProject.save()
                    .then( async project => {
                        console.log("UserLog: Created new project" + "\n" + project);
                        await projectCache.refreshCache();
                        req.flash('success_msg', "New project created");
                        res.redirect('../dashboard');
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));        
        }
    });
});

router.get('/:projectname/clone-project', async (req, res) => {
  const { projectname } = req.params;

  try {
    // Find the original project
    const originalProject = await Project.findOne({ projectname });

    // Make a copy of the project
    const clonedProject = originalProject.toObject();
    delete clonedProject._id; // remove _id property to avoid duplicate key error
    let clonedName = `${originalProject.projectname} (copy)`;
    let i = 2;
    while (await Project.findOne({ projectname: clonedName })) {
      clonedName = `${originalProject.projectname} (copy ${i++})`;
    }
    clonedProject.projectname = clonedName;

    // Add the cloned project to the database and save it
    const savedProject = await new Project(clonedProject).save();

    console.log("Cloning project " + projectname);
    await projectCache.refreshCache();
    req.flash('success_msg', "Project cloned successfully");
    res.redirect('/dashboard');
  } catch (err) {
    console.log("ERROR: -- Cannot clone project");
    console.log(err);
    req.flash('error_msg', "Something went wrong, project could not be cloned");
    res.redirect('/dashboard');
  }
});

router.post('/clone-to', async (req, res) => {
  const { selectedProjects, selectedTestCase, containingProject } = req.body;
  console.log('Selected projects:', selectedProjects);
  console.log('Selected test case:', selectedTestCase);
  console.log('Containing project case:', containingProject);
  try {
    // Find the selected test case
    const originalProject = await Project.findOne({ projectname: containingProject });
    const testCase = await originalProject.testcases.find(testCase => testCase.name === selectedTestCase);

    // Loop through each selected project and clone the test case to that project
    for (const projectId of selectedProjects) {
      const project = await Project.findById(projectId);
      // Make a copy of the test case
      let clonedName = `${testCase.name} (1)`;
      let i = 2;
      while (project.testcases.some(tc => tc.name === clonedName)) {
        clonedName = `${testCase.name} (${i++})`;
      }
      const clonedTestCase = { ...testCase.toObject(), name: clonedName };
      
      // Add the cloned test case to the project and save it
      project.testcases.push(clonedTestCase);
      await project.save();

    }
    await projectCache.refreshCache();
    req.flash('success_msg', "Project cloned successfully");
    res.redirect('/dashboard');
  } catch (err) {
    console.log("ERROR: -- Cannot clone to");
    console.log(err);
    req.flash('error_msg', "Something went wrong, project could not be cloned");
    res.redirect('/dashboard');
  }
});

router.post('/:projectname/:testcasename/addrequirements', async (req, res) => {
  const { projectname, testcasename } = req.params;
  let linkedRequirements = req.body['selected-requirements[]'];
  if (!linkedRequirements) {
    linkedRequirements = [];
  }
  if (!Array.isArray(linkedRequirements)) {
    linkedRequirements = [linkedRequirements];
  }
  let requirementIds = [];
  
  try {
    const promises = linkedRequirements.map(async (requirementName) => {
      const requirement = await Requirement.findOne({ requirementid: requirementName });
      if (requirement) {
        console.log("Found requirement:", requirement);
        requirementIds.push(requirement._id);
      } else {
        console.log("No requirement found");
      }
    });
    await Promise.all(promises);

    console.log(requirementIds);
    
    const updatedTestCase = await Project.findOneAndUpdate(
      { projectname, 'testcases.name': testcasename },
      { $set: { 'testcases.$.linkedrequirements': requirementIds } },
      { new: true }
    );
    
    // Save the updated test case
    await updatedTestCase.save();
    
    // Send back a success response
    const redirectUrl = '/project/' + projectname + '/' + testcasename;
    console.log("Linking requirements " + requirementIds)
    await projectCache.refreshCache();
    req.flash('success_msg', 'Requirement Linked');
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Could not link requirement:", err);
    req.flash('error_msg', 'Could not link requirement');
    const redirectUrl = '/project/' + projectname + '/' + testcasename;
    res.redirect(redirectUrl);
  }
});

  
module.exports = router;