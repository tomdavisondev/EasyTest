const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;

const Project = require('../models/Project');
const User = require('../models/User');
const Requirement = require('../models/Requirements');

router.post('/addrequirement', async (req, res) => {
    let requirementname = req.body.requirementname;
    let requirementid = req.body.requirementid;
    let projects = req.body.projects;
    let requirements = req.body.requirements;
    let user = req.user;
    let name = user.name;

    let errors = [];

    if (!requirementname || !requirementid) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    if (requirements === undefined) {
        try {
            requirements = await Requirement.find({}).exec();
        } catch (err) {
            console.log(err);
        }
    }
    if (projects === undefined) {
        try {
            projects = await Project.find({}).exec();
        } catch (err) {
            console.log(err);
        }
    }

    Project.find({}).exec(function (err, projectlist) {
        Requirement.find({}).exec(function (err, requirementlist) {
            if (errors.length > 0) {
                res.render('dashboard', {
                    req,
                    name,
                    errors,
                    user,
                    projects: projectlist,
                    requirements: requirementlist,
                    requirements,
                    requirementname,
                    requirementid
                });
            } else {
              Requirement.findOne({
                $or: [
                    { requirementname: { $regex: new RegExp("^" + requirementname + "$", "i") } },
                    { requirementid: { $regex: new RegExp("^" + requirementid + "$", "i") } }
                ]
            })
            .then(requirement => {
                if (requirement) {
                    if (requirement.requirementname.toLowerCase() === requirementname.toLowerCase()) {
                        //Requirement exists with the same requirementname
                        req.flash('error_msg', "Requirement already exists under that name");
                    } else {
                        //Requirement exists with the same requirementid
                        req.flash('error_msg', "Requirement already exists with that ID");
                    }
                    res.redirect('/dashboard');
                } else {
                    const newRequirement = new Requirement({
                        requirementname,
                        requirementid,
                    });
                    newRequirement.save()
                        .then(requirement => {
                            req.flash('success_msg', "New requirement created");
                            res.redirect('/dashboard');
                        })
                        .catch(err => console.log(err));
                }
            })
            .catch(err => console.log(err));            
            }
        });
    });
});

router.get('/:requirementname/clone-requirement', async (req, res) => {
    const { requirementname } = req.params;
  
    try {
      // Find the original requirement
      const originalRequirement = await Requirement.findOne({ requirementname });
  
      // Make a copy of the requirement
      const clonedRequirement = originalRequirement.toObject();
      delete clonedRequirement._id; // remove _id property to avoid duplicate key error
      let clonedName = `${originalRequirement.requirementname} (copy)`;
      let i = 2;
      while (await Requirement.findOne({ requirementname: clonedName })) {
        clonedName = `${originalRequirement.requirementname} (copy ${i++})`;
      }
      clonedRequirement.requirementname = clonedName;
  
      // Add the cloned requirement to the database and save it
      const savedRequirement = await new Requirement(clonedRequirement).save();
  
      req.flash('success_msg', "Requirement cloned successfully");
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
      req.flash('error_msg', "Something went wrong, requirement could not be cloned");
      res.redirect('/dashboard');
    }
  });
  

router.post('/edit', async (req, res) => {
    const { reqId, requirementname, description, documentlink } = req.body;
    let linkedprojectNames = req.body['linkedprojects[]'] || [];
    if (!Array.isArray(linkedprojectNames)) {
        linkedprojectNames = [linkedprojectNames];
    }

    // Find the corresponding Project objects using their names
    const linkedprojects = await Project.find({ projectname: { $in: linkedprojectNames } }, '_id');

    Requirement.findOne({ _id: reqId })
    .then((requirement) => {
      if (!requirement) {
        // Requirement not found
        req.flash('error_msg', 'Requirement not found');
        res.redirect('/dashboard');
      } else {
        // Update the requirement fields
        requirement.requirementname = requirementname;
        requirement.linkedprojects = linkedprojects;
        requirement.description = description;
        requirement.documentLink = documentlink;

        // Save the updated requirement
        requirement.save()
          .then((updatedRequirement) => {
            req.flash('success_msg', 'Requirement updated successfully');
            res.redirect(`/requirements/${requirementname}`);
          })
          .catch((err) => {
            console.log(err);
            req.flash('error_msg', 'An error occurred while updating the requirement');
            res.redirect(`/requirements/${requirementname}`);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      req.flash('error_msg', 'An error occurred while finding the requirement');
      res.redirect('/dashboard');
    });
});

      
  

router.post('/:requirementname/delete', (req, res) => {
    const { requirementname } = req.params;
  
    Requirement.deleteOne({ requirementname })
      .then(() => {
        req.flash('success_msg', 'Requirement deleted successfully');
        res.redirect('/dashboard');
      })
      .catch((err) => {
        req.flash('error_msg', 'Something went wrong, requirement could not be deleted');
        res.redirect('/dashboard');
      });
  });
  


module.exports = router;
