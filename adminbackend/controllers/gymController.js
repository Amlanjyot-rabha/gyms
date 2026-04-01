import Gym from '../models/gymModel.js';

/**
 * @desc Get all gyms
 * @route GET /api/gyms
 * @access Public
 */
export const getAllGyms = async (req, res, next) => {
  try {
    const gyms = await Gym.find();
    res.status(200).json({
      success: true,
      count: gyms.length,
      data: gyms,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create a new gym
 * @route POST /api/gyms
 * @access Public
 */
export const createGym = async (req, res, next) => {
  try {
    const gym = await Gym.create(req.body);
    res.status(201).json({
      success: true,
      data: gym,
    });
  } catch (error) {
    next(error);
  }
};
