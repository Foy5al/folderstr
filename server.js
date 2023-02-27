const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");

var ObjectId = require("mongodb").ObjectId;

//middleware
app.use(cors());
app.use(express.json());

//connect mongodb
mongoose
  .connect(
    "mongodb+srv://folderstr:AFl8nwHlj2fXhzsQ@cluster0.nrqlb.mongodb.net/folderstr?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DB is connected");
  });

// Define the folder schema
const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    children: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
  },
  { timestamps: true }
);

// Define the folder model
const Folder = mongoose.model("Folder", folderSchema);

// API endpoint to create a folder
app.get("/", (req, res) => {
  res.send("connected");
});

app.get("/folders", async (req, res) => {
  try {
    // Parse the request body
    const { parentId } = req.body;
    console.log(parentId);

    // Set the parent folder if specified

    const folder = await Folder.findById(parentId);

    // Return the folder object
    res.json(folder);
  } catch (error) {
    // Return an error response
    res.status(400).json({ message: error.message });
  }
});

app.delete("/folders", async (req, res) => {
  try {
    // Parse the request body
    const { parentId } = req.body;
    console.log(parentId);

    // Set the parent folder if specified

    const folder = await Folder.findByIdAndDelete(parentId);

    // Return the folder object
    res.json(folder);
  } catch (error) {
    // Return an error response
    res.status(400).json({ message: error.message });
  }
});

app.patch("/folders", async (req, res) => {
  try {
    // Parse the request body
    const { name, parentId } = req.body;
    console.log(parentId, "form patch", name);
    const filter = { _id: new ObjectId(parentId) };
    const options = { upsert: true };

    // Set the parent folder if specified

    // const folder = await Folder.findByIdAndUpdate(parentId, name);

    const updateDoc = {
      $set: {
        name: name,
      },
    };

    const folder = await Folder.updateOne(filter, updateDoc, options);

    // Return the folder object
    res.json(folder);
  } catch (error) {
    // Return an error response
    res.status(400).json({ message: error.message });
  }
});

app.post("/folders", async (req, res) => {
  try {
    // Parse the request body
    const { name, parentId } = req.body;
    console.log(name);

    // Create the folder object
    const folder = new Folder({ name });

    // Set the parent folder if specified
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (!parentFolder) {
        throw new Error("Parent folder not found");
      }
      folder.parent = parentFolder._id;
      parentFolder.children.push(folder._id);
      await parentFolder.save();
    }

    // Save the folder object to the database
    await folder.save();

    // Return the folder object
    res.json(folder);
  } catch (error) {
    // Return an error response
    res.status(400).json({ message: error.message });
  }
});

const port = 5000;

app.listen(port, () => {
  console.log("Database Is listening at port:", port);
});
