const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
var cors = require("cors");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { default: axios } = require("axios");
const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.b5jufhp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const database = client.db("SSLuserDB").collection("users");

    app.post("/create-payment", async (req, res) => {
      const data = req.body;

      const trnId = new ObjectId().toString();

      const initialData = {
        store_id: "testbox",
        store_passwd: "qwerty",
        total_amount: data.amount,
        currency: "EUR",
        tran_id: trnId,
        product_name: data.productName,
        product_category: "good",
        product_profile: "Nice",
        success_url: "http://localhost:3000/success-payment",
        fail_url: "http://localhost:3000/fail",
        cancel_url: "http://localhost:3000/cancel",
        cus_name: data.name,
        cus_email: data.email,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: data.city,
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        shipping_method: "Yes",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: "1000",
        ship_country: "Bangladesh",
        multi_card_name: "mastercard,visacard,amexcard",
        value_a: "ref001_A",
        value_b: "ref002_B",
        value_c: "ref003_C",
        value_d: "ref004_D",
      };

      const response = await axios({
        method: "POST",
        url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        data: initialData,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      });

      const save = {
        trnId: trnId,
        amount: data.amount,
        name: data.name,
        email: data.email,
        city: data.city,
        productName: data.productName,
        status: "panding",
      };

      const dataSave = await database.insertOne(save);

      if (dataSave) {
        res.send({
          paymentUrl: response.data.GatewayPageURL,
        });
      }

      // console.log(data);
    });

    app.post("/success-payment", async (req, res) => {
      const successData = req.body;
      console.log("success data", successData);

      if (successData.status !== "VALID") {
        throw new Error({ status: 404, message: "Invalid payment" });
      }
      const query = { trnId: successData.tran_id };
      const update = {
        $set: {
          status: "success",
        },
      };

      const dataUpdate = await database.updateOne(query, update);

      console.log("success data", successData);
      console.log(" dataUpdate", dataUpdate);

      res.redirect("http://localhost:5173/success");
    });
    app.post("/success-payment", async (req, res) => {
      const successData = req.body;
      console.log("success data", successData);

      if (successData.status !== "VALID") {
        throw new Error({ status: 404, message: "Invalid payment" });
      }
      const query = { trnId: successData.tran_id };
      const update = {
        $set: {
          status: "success",
        },
      };

      const dataUpdate = await database.updateOne(query, update);

      console.log("success data", successData);
      console.log(" dataUpdate", dataUpdate);

      res.redirect("http://localhost:5173/success");
    });
    app.post("/fail", async (req, res) => {
      res.redirect("http://localhost:5173/fail");
    });
    app.post("/cancle", async (req, res) => {
      res.redirect("http://localhost:5173/cancle");
    });




















    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
