const express = require('express');
const methodOverride = require('method-override');
const router = express.Router();
const campController = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage });
router.use(methodOverride('_method'));

router.get('/new', campController.new);


router.get('/register', campController.registerRedirect);

router.get('/', campController.index);

router.post('/', campController.insertCamp);

router.post('/:id/review', campController.insertReview);

router.delete('/:id', campController.deleteCamp);

router.get('/:id', campController.show);

router.put('/:id', campController.edit);

router.get('/:id/edit', campController.editCamp);

module.exports = router;
