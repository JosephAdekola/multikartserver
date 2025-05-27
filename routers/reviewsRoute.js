const express = require('express')
const { addReview, getProductReviews } = require('../controlers/reviewsControl')
const { model } = require('mongoose')

const reviewsRouter = express.Router()

reviewsRouter.post('/add-review', addReview)
reviewsRouter.post('/get-review', getProductReviews)

module.exports = reviewsRouter