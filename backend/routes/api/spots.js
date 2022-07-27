const express = require('express')
const { Op } = require("sequelize");
const sequelize = require('sequelize')
const { setTokenCookie, requireAuth, restoreUser, isOwner, isntOwner } = require('../../utils/auth');
const { User,Spot,Image,Review,Booking } = require('../../db/models');
const { check, checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

//get all spots
router.get(
    '/',
    async (req, res) => {
      
    const Spots = await Spot.findAll({});

    return res.json({Spots});
    }
  );

//get details of spot by id
router.get(
  '/:spotId',
  async (req, res, next) => {
  const {spotId} = req.params 
  const Spots = await Spot.findOne({
      where: {
        id: spotId
      }
  });
  if (!Spots){
    const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err);
  }
  const revs=await Review.count(
    {where: 
      {spotId: Spots.id}
    })
  const ave=await Review.sum('stars',
   {where: 
     {spotId: Spots.id}
   })
  const Images =await Image.findAll({
    where: {
      imageableType: 'spot',
      imageableId: Spots.id
    },
    attributes: ['id','imageableId','url']
  })
   const Owner =await User.findOne({
     where: {
      id: Spots.ownerId
     },
     attributes: ['id','firstName','lastName']
   })
  return res.json({
  "id": Spots.id,
  "ownerId": Spots.ownerId,
  "address": Spots.address,
  "city": Spots.city,
  "state": Spots.state,
  "country": Spots.country,
  "lat": Spots.lat,
  "lng": Spots.lng,
  "name": Spots.name,
  "description": Spots.description,
  "price": Spots.price,
  "createdAt": Spots.createdAt,
  "updatedAt": Spots.updatedAt,
  "numReviews": revs,
  "aveStarRating": ave/revs,
   Images,
   Owner
  });
  }
);

//create Spot
// part1 validate spot
const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is not valid'),
  check('lng')
     .isFloat({ min: -180, max: 180 })
     .withMessage('Longitude is not valid'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({max: 50})
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .exists({ checkFalsy: true })
    .withMessage('Price per day is required'),
  handleValidationErrors
];
//create spot 
//part 2 route handler 
router.post(
  '/',
  requireAuth,
  validateSpot,
  async (req, res) => {
  const ownerId = req.user.id
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const newSpot = await Spot.makeSpot({ 
ownerId, address, city, state, country, lat, lng, name, description, price });
 const retObj = await Spot.findOne({
   where: {
     id: newSpot.id
   },
   attributes: {exclude: ['previewImage']}
 })
    res.statusCode=201
    return res.json(retObj);
  }
);

//edit a spot
router.put(
  '/:spotId',
  requireAuth,
  validateSpot,
  isOwner,
  async (req, res, next) => {
  const ownerId = req.user.id
  const {spotId} = req.params
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const newSpot = await Spot.findByPk(spotId);

  newSpot.address=address
  newSpot.city=city
  newSpot.state=state
  newSpot.country=country
  newSpot.lat=lat
  newSpot.lng=lng
  newSpot.name=name
  newSpot.description=description
  newSpot.price=price

  await newSpot.save()
  const retObj = await Spot.findOne({
   where: {
     id: newSpot.id
   },
   attributes: {exclude: ['previewImage']}
 })
 return res.json(retObj);
}
);

//delete a spot
router.delete(
  '/:spotId',
  requireAuth,
  
  isOwner,
  async (req, res, next) => {
  const ownerId = req.user.id
  const {spotId} = req.params
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const newSpot = await Spot.findByPk(spotId);
  await newSpot.destroy()
  return res.json({
    "message": "Successfully deleted",
    "statusCode": 200
  });
}
);

//get all reveiws by spotId

router.get(
  '/:spotId/reviews',
  async (req, res, next) => {
  const {spotId} = req.params 
  const Spots = await Spot.findOne({
      where: {
        id: spotId
      },
      attributes: {},
      include: {
        model: Review
      }
  });
  if (!Spots){
    const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err);
  }
  const Reviews = await Review.findAll({
    where: {
      spotId: Spots.id
    },
    include: [{
      model: User,
      attributes:['id','firstName','lastName']
    },
   {
      model: Image,
      attributes:['id','imageableId','url']
    }]

  })

    return res.json({
      Reviews
      //Images
    });
    }
  );



  //create reveiw by spotId
//part 1 validateReview

const validateReview = [
  
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
];

//part 2 create new review route handler

router.post(
  '/:spotId/reviews',
  requireAuth,
  validateReview,
  async (req, res, next) => {
  const {spotId} = req.params 
  const userId = req.user.id
  console.log('userId: ',userId)
  const {review,stars}=req.body
  const Spots = await Spot.findOne({
      where: {
        id: spotId
      },
      attributes: {},
      include: {
        model: Review
      }
  });
  if (!Spots){
    const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err);
  }
  const userReviews = await Review.findOne({
    where: {
      userId: req.user.id,
      spotId: req.params.spotId
    }
  })
  if (userReviews){
    const err = new Error("User already has a review for this spot");
        err.status = 403;
        return next(err);
  }
  const newReview = await Review.create({
              spotId,
              userId,
              review,
              stars
            });
  const newRev = await Review.findByPk(newReview.id);
  res.statusCode=201
  return res.json(
    newRev
  );
})



 //get all bookings by spotId

 router.get(
  '/:spotId/bookings',
  requireAuth,
  async (req, res, next) => {
  const {spotId} = req.params 
  const Spots = await Spot.findOne({
      where: {
        id: spotId
      }
  });
  let Bookings={}
  if (!Spots){
    const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err);
  }
  if (req.user.id!==Spots.ownerId){
  Bookings = await Booking.findAll({
    where: {
      spotId: Spots.id
    },
    attributes: ['spotId','startDate','endDate']
  })
  }
  if (req.user.id==Spots.ownerId){
    Bookings = await Booking.findAll({
      where: {
        spotId: Spots.id
      },
      include: {
        model: User,
        attributes: ['id','firstName','lastName']
      }
    })
    }
    return res.json({
      Bookings
      //Images
    });
    }
  );




//create booking by spotId

router.post(
  '/:spotId/bookings',
  requireAuth,
  isntOwner,
  //validateBooking,
  async (req, res, next) => {

  const {spotId} = req.params 
  const userId = req.user.id
  //console.log('userId: ',userId)
  const {startDate,endDate}=req.body
  const Spots = await Spot.findOne({
      where: {
        id: spotId
      },
      attributes: {},
      include: {
        model: Review
      }
  });
  if (!Spots){
    const err = new Error("Spot couldn't be found");
        err.status = 404;
        return next(err);
  }

    const newEnd = new Date(endDate)
    const newStart = new Date(startDate)
    if (newStart.valueOf()>=newEnd.valueOf()){
        const err = new Error("Validation Error");
        err.status = 400;
        err.errors = {}
        err.errors.endDate="endDate cannot be on or before startDate"
        return next(err);
    }
 
  const startBookings = await Booking.findAll({
    where: {
      spotId: req.params.spotId,
      [Op.or]: {
        [Op.or]: [
          {
            startDate: {
              [Op.eq]: req.body.startDate
          }
          },
          {
            endDate: {
              [Op.eq]: req.body.startDate
            }
          }
        ],
        [Op.and]: [
          {
            startDate: {
              [Op.lt]: req.body.startDate
          }
          },
          {
            endDate: {
              [Op.gt]: req.body.startDate
            }
          }
        ]
      }
    }
  

  })
  const endBookings = await Booking.findAll({
    where: {
      spotId: req.params.spotId,
      [Op.or]: {
        [Op.or]: [
          {
            startDate: {
              [Op.eq]: req.body.endDate
          }
          },
          {
            endDate: {
              [Op.eq]: req.body.endDate
            }
          }
        ],
        [Op.and]: [
          {
            startDate: {
              [Op.lt]: req.body.endDate
          }
          },
          {
            endDate: {
              [Op.gt]: req.body.endDate
            }
          }
        ]
      }
    }
  

  })
  const allBookings = await Booking.findAll({
    where: {
      spotId: req.params.spotId,
     
        [Op.and]: [
          {
            startDate: {
              [Op.gt]: req.body.startDate
          }
          },
          {
            endDate: {
              [Op.lt]: req.body.endDate
            }
          }
        ]
      
    }
  

  })

  if (startBookings.length>0||endBookings.length>0||allBookings.length>0){
    const err = new Error("Sorry, this spot is already booked for the specified dates");
        err.status = 403;
        err.errors = {}
        if (startBookings.length>0){err.errors.startDate="Start date conflicts with an existing booking"}
        if (endBookings.length>0){err.errors.endDate="End date conflicts with an existing booking"}
        if (allBookings.length>0){
          err.errors.startDate="Start date conflicts with an existing booking",
          err.errors.endDate="End date conflicts with an existing booking"
        }
        return next(err);
  }

  const newBooking = await Booking.create({
              userId,
              spotId,
              startDate,
              endDate
            });

  const newBook = await Booking.findByPk(newBooking.id);
  res.statusCode=200
  return res.json(
    newBook
  );
})


module.exports = router;