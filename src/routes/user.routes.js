import { Router } from 'express';
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import upload from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { registerUser } from '../controllers/user.controller.js';
const router = Router();

router.post(
    '/register',
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    registerUser
);
router.route('/logout').post(verifyJWT, logoutUser);


route.route('/login').post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)


router.route("/change-password").post(verifyJWT,getCurrentUser);

router.route("/").get(verifyJWT, getCurrentUser);
router.route("/channel/:username").get(getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);
router.route("/avatar").put(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route("/cover-image").put(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route("/").put(verifyJWT, updateAccountDetails);
router.route("/").delete(verifyJWT, deleteAccount);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);
router.route("/").delete(verifyJWT, deleteAccount);

export default router;
