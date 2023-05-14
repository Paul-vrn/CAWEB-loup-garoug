import express from "express";
import userController from "../controllers/user";
import checkToken from "../middleware/checkToken";
const router = express.Router({ mergeParams: true });

router.get("/", checkToken, userController.getAll);
router.get("/me", checkToken, userController.getFromToken);
router.post("/", userController.create);
router.post("/login", userController.auth);
router.patch("/", checkToken, userController.update);
router.delete("/", checkToken, userController.deleteUser);

export default router;
