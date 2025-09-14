import express, { Application } from "express";
import cors from "cors";
import errorHandler from "./middlewares/error.middleware";
import router from "./modules/users/routes";

const corsOptions = {
  origin: `http://localhost:5173`,
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization,Bearer",
  credentials: true,
};

const app: Application = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/v1.0/users", router);
app.use(errorHandler);

app.listen(3000);
