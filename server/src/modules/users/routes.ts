import { Router } from "express";
import controller from "./controller";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import { body, param } from "express-validator";
import upload from "../../utils/multer";

const router = Router();

router.route("/all").get(controller.getAll);
router
  .route("/file/:id")
  .patch(
    [param("id").isInt({ min: 0 }).withMessage("Id must be positive").toInt()],
    validateMiddleware,
    upload.single("file"),
    controller.uploadFile
  );
router
  .route("/desc/:id")
  .patch(
    [param("id").isInt({ min: 0 }).withMessage("Id must be positive").toInt()],
    validateMiddleware,
    controller.changeDesc
  );
router
  .route("/adm/:id")
  .patch(
    [
      param("id").isInt({ min: 0 }).withMessage("Id must be positive").toInt(),
      body("status").isBoolean().withMessage("isAdmin must be boolean"),
    ],
    validateMiddleware,
    controller.changeAdm
  );
router
  .route("/filterName")
  .post(
    [body("name").isString().withMessage("Filter name must be string")],
    validateMiddleware,
    controller.filterName
  );
router
  .route("/filterSurname")
  .post(
    [body("surname").isString().withMessage("Filter surname must be string")],
    validateMiddleware,
    controller.filterSurname
  );
router
  .route("/add")
  .post(
    [
      body("name").isString().withMessage("Filter name must be string"),
      body("surname").isString().withMessage("Filter surname must be string"),
      body("isAdmin").isBoolean().withMessage("isAdmin must be boolean"),
    ],
    validateMiddleware,
    controller.addUser
  );
export default router;
