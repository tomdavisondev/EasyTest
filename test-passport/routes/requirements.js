const express = require('express');
const router = express.Router();

const Project = require('../models/Project');
const Requirement = require('../models/Requirements');

const RequirementCache = require('../config/requirementcache');
const logger = require('../logger');
const requirementCache = new RequirementCache();

router.post('/addrequirement', async (req, res) => {
  let requirementname = req.body.requirementname;
  let requirementid = req.body.requirementid;
  let projects = req.body.projects;
  let requirements = req.body.requirements;
  let user = req.user;
  let name = user.name;
  let generatedIcon = req.body.requirementIconContainer_generatedIcon;

  let errors = [];

  if (!requirementname || !requirementid) {
    errors.push({ msg: 'Please fill in all fields' });
  }

  if (requirements === undefined) {
    try {
      requirements = await Requirement.find({}).exec();
    } catch (err) {
      logger.server('error', 'Could not find requirement: ' + err)
    }
  }
  if (projects === undefined) {
    try {
      projects = await Project.find({}).exec();
    } catch (err) {
      logger.server('error', 'Could not find project: ' + err)
    }
  }

  Project.find({}).exec(function (err, projectlist) {
    Requirement.find({}).exec(async function (err, requirementlist) {
      if (errors.length > 0) {
        res.render('dashboard', {
          req,
          name,
          errors,
          user,
          projects: projectlist,
          requirements: requirementlist,
          selectedTarget: 'requirements',
          requirementname,
          requirementid,
        });
      } else {
        try {
          const requirement = await Requirement.findOne({
            $or: [
              { requirementname: { $regex: new RegExp('^' + requirementname + '$', 'i') } },
              { requirementid: { $regex: new RegExp('^' + requirementid + '$', 'i') } },
            ],
          });

          if (requirement) {
            if (requirement.requirementname.toLowerCase() === requirementname.toLowerCase()) {
              //Requirement exists with the same requirementname
              req.flash('error_msg', 'Requirement already exists under that name');
            } else {
              //Requirement exists with the same requirementid
              req.flash('error_msg', 'Requirement already exists with that ID');
            }
            res.redirect('/dashboard?selectedTarget=requirements');
          } else {
            const newRequirement = new Requirement({
              requirementname,
              requirementid,
              requirementImage: {
                data: generatedIcon,
                contentType: 'image/png',
              },
            });

            try {
              await newRequirement.save();
              logger.user('info', 'User: ' + req.user.name + ' has added a new requirement with name ' + newRequirement.requirementname)
              await requirementCache.refreshCache();
              req.flash('success_msg', 'New requirement created');
              res.redirect('/dashboard?selectedTarget=requirements');
            } catch (err) {
              logger.server('error', 'Could not create requirement: ' + err)
            }
          }
        } catch (err) {
          logger.server('error', 'Could not link requirement: ' + err)
        }
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
      await new Requirement(clonedRequirement).save();
  
      logger.user('info', 'User: ' + req.user.name + ' cloned requirement ' + requirementname)
      await requirementCache.refreshCache();
      req.flash('success_msg', 'Requirement cloned successfully');
      res.redirect('/dashboard?selectedTarget=requirements');
    } catch (err) {
      logger.server('error', 'Could not clone requirement: ' + err)
      req.flash('error_msg', 'Something went wrong, requirement could not be cloned');
      res.redirect('/dashboard?selectedTarget=requirements');
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
        res.redirect('/dashboard?selectedTarget=requirements');
      } else {
        // Update the requirement fields
        requirement.requirementname = requirementname;
        requirement.linkedprojects = linkedprojects;
        requirement.description = description;
        requirement.documentLink = documentlink;

        // Save the updated requirement
        requirement.save()
          .then(async (updatedRequirement) => {
            logger.user('info', 'User: ' + req.user.name + ' updated requirement: ' + requirement)
            await requirementCache.refreshCache();
            req.flash('success_msg', 'Requirement updated successfully');
            res.redirect(`/requirements/${requirementname}`);
          })
          .catch((err) => {
            logger.server('error', 'Could not submit edit for requirement: ' + err)
            req.flash('error_msg', 'An error occurred while updating the requirement');
            res.redirect(`/requirements/${requirementname}`);
          });
      }
    })
    .catch((err) => {
      logger.server('error', 'Could not submit edit for requirement: ' + err)
      req.flash('error_msg', 'An error occurred while finding the requirement');
      res.redirect('/dashboard?selectedTarget=requirements');
    });
});

      
  

router.post('/:requirementname/delete', (req, res) => {
    const { requirementname } = req.params;
  
    Requirement.deleteOne({ requirementname })
      .then( async () => {
        await requirementCache.refreshCache();
        req.flash('success_msg', 'Requirement deleted successfully');
        res.redirect('/dashboard?selectedTarget=requirements');
      })
      .catch((err) => {
        logger.err('Could not delete requirement: \n ' + err + '\n');
        req.flash('error_msg', 'Something went wrong, requirement could not be deleted');
        res.redirect('/dashboard?selectedTarget=requirements');
      });
  });
  


module.exports = router;
