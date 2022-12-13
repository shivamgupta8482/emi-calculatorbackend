const connection = require("./Config/db");
const { UserModel } = require("./Model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();
const { RoomModel } = require("./Model/calculatormodel");
const cors = require("cors");
app.use(cors());
require("dotenv").config();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello");
});

//signup of application-----------------------------------------------------------------------------------------------------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  let user_already_present = await UserModel.findOne({ email });
  if (user_already_present) res.send({ message: "user already present" });
  else {
    bcrypt
      .hash(password, 7)
      .then(async function (hash) {
        const new_user = new UserModel({
          email: email,
          name: name,
          password: hash,
        });

        await new_user.save();
        res.send({ message: "sign up successful" });
      })
      .catch((err) => {
        res.send({ error: "some error occured" });
      });
  }
});
//login----------------------------------------------------------------------------------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) res.send({ message: "no such user exists" });
  else {
    const hashed_password = user.password;
    const user_id = user._id;
    //  console.log(user)
    // console.log(user_id)
    bcrypt.compare(password, hashed_password, function (err, result) {
      if (err) {
        res.send({ msg: "Something went wrong, try again later" });
      }
      if (result) {
        const token = jwt.sign({ user_id }, "abcd");
        res.send({ message: "Login successfull", user: user, token, user_id });
      } else {
        res.send({ msg: "Login failed" });
      }
    });
  }
});

//authentication middleware-------------------------------------------------------------------------------------

const authentiation = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);

  if (!token) res.send("please sign in");
  else {
    jwt.verify(token, "abcd", function (err, decoded) {
      console.log(token);
      const user_id = decoded.user_id;
      if (err) {
        res.send("something went wrong");
      }

      if (decoded) {
        req.body.user_id = user_id;
        next();
      } else {
        res.send("please login");
      }
    });
  }
};

//admin access-------------------------------------------------------------------------------------------------
const admin = async (req, res, next) => {
  //const token = req.headers.authorization.split(" ")[1];
  const user_id = req.body.user_id;
  const user = await UserModel.findOne({ user_id });
  if (user.role == "admin") {
    next;
  } else {
    res.send("you are not authenticated to access this route");
  }
};
//createroom----------------------------------------------------------------------------------------------------

app.post("/calculate", authentiation, async (req, res) => {
  let { loan, intrest, tenure } = req.body;
  let amount = loan;
  let intrestRate = intrest;

  const r = +(intrestRate / 12 / 100).toFixed(6);

  const emi = (
    (amount * r * Math.pow(1 + r, tenure)) /
    (Math.pow(1 + r, tenure) - 1)
  ).toFixed(2);

  const interestPayble = emi * tenure - amount;

  res.send({ emi: emi, interestPayble, total: amount + interestPayble });
});

//dashboard-----------------------------------------------------------------------------------------------------------

app.get("/dashboard", authentiation, async (req, res) => {
  //     const {user_id} = req.body;
  // //     const {user_id} = req.user_id;
  //     const user = await signupModel.findOne({user_id});
  //     //console.log(user);
  //     const {email} = user;
  //      //console.log(email);
  // res.send({email});
  const data = await RoomModel.find();
  res.send(data);
});

//bookdata-------------------------------------------------------------------------------------------------------------

//handleCancel--------------------------------------------------------------------------------------------------------

app.listen(8080, async () => {
  try {
    await connection;
    console.log("connected to db sucessfully");
  } catch (err) {
    console.log("not able to connect");
  }
});

// {
//     "name":"shivam",
//     "email":"shivam",
//     "password":"shivam"
//   }

// {
//     "loan":"100000",
//     "intrest":"6",
//     "tenure":"36"
//   }
