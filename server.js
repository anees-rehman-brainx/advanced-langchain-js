require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { db } = require("./config");
const PORT = process.env.PORT || 5000;
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const { getSwaggerSchemas } = require("./services/utilsService");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NodeJS Template APIs",
      version: "1.0.0",
      description: "A template for NodeJS Applications",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      schemas: getSwaggerSchemas(require("./models")),
    },
  },
  apis: ["./controllers/*"],
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("Backend Working!!"));
app.use("/api/v1", require("./routes/v1"));

db.then(() => {
  console.log("Database Connected Successfully");
  app.listen(PORT, console.log(`Server Started on PORT: ${PORT}`));
}).catch((err) => console.log("Database Connection Error: ", err));
