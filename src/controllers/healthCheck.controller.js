import {ApiResponse} from '../utils/apiResponse.js';
import { asyncHandler   } from '../utils/asyncHandler.js';


export const healthCheckController = {
  healthCheck: asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, "Service is healthy" ));
    // .json({
    //     status: 200,
    //     message: "Service is healthy",
    //     data: { timestamp: new Date() },
    // });
  })
};