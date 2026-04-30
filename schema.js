const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.string().required(),

        image: Joi.object({
            filename: Joi.string().default("listingimage"),

            url: Joi.string()
                .allow("") // allow empty string
                .default("https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b")
        }).default({}),
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().trim().min(1).required(),
        rating: Joi.number().min(1).required(),
    }).required()
});