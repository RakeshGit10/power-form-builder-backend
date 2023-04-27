import express, {Request,Response, NextFunction, Express} from "express";
import {json, urlencoded} from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import cors from "cors";
import bcrypt from 'bcrypt'
import multer, { Multer } from "multer";
import {GridFsStorage} from 'multer-gridfs-storage';
import { Readable } from 'stream';
const mime = require('mime-types');


const app = express();
app.use(cors());
// const upload = multer({ dest: "uploads/" });

mongoose.connect(
  "mongodb://localhost:27017/finalBuilder",
  {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions,
  (err) => {
    if (!err) {
      console.log("Connected to db");
    } else {
      console.log("Error connecting to db");
    }
  }
);

type MulterRequest = express.Request & { file: Express.Multer.File };

  const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017/finalBuilder',
    file: (req: any, file: any) => {
      return {
        bucketName: 'uploads',
        filename: file.originalname
      }
    }
  })

  const upload = multer({ storage });

const userSchema = new mongoose.Schema({
  userId: {type: Number, required: true, unique: true},
  email: { type: String, required: true, unique:true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);



const menuItemSchema = new mongoose.Schema({
  id: String,
  selectDataLabel: String,
  selectDataValue: String
  });
  
  const radioButtonSchema = new mongoose.Schema({
    id: String,
  radioButtonDataLabel: String,
  radioButtonDataValue: String
  });

  const validateSchema = new mongoose.Schema({
    required: Boolean,
    minLength: { type: Number, required: false },
    maxLength: { type: Number, required: false },
    rows: { type: Number, required: false },
    error: { type: String, required: false },
    minDate: {type: Date, required: false, default: undefined },
    maxDate: {type: Date, required: false, default: undefined },
  })
  
const elementSchema = new mongoose.Schema({
    id: Number,
    element: String,
    label: String,
    placeholder: String,
    
    validate: validateSchema,

    width: Number,
    checked: Boolean,
    default: Boolean,
    multipleValues: Boolean,
    menuItems: [menuItemSchema],
    textFieldWidth: Number,
    theme: String,
    size: String,
    options: String,
    radioItems: [radioButtonSchema],

    format: String,
    disablePast: Boolean,
    disableFuture: Boolean,
    
    show: Boolean
})

  const tabItemsSchema = new mongoose.Schema({
      id: String,
      dropId: String,
      tabsDataLabel: String,
      tabsDataValue: String,
      tabComponents: [elementSchema]
  });

  const columnItemsSchema = new mongoose.Schema({
      id: String,
      label: String,
      columnDataSize: String,
      columnDataWidth: Number,
      columnComponents: [elementSchema]
    })
  
  const componentSchema = new mongoose.Schema({
    id: Number,
    element: String,
    label: String,
    placeholder: String,
    validate: validateSchema,
    width: Number,
    checked: Boolean,
    default: Boolean,
    multipleValues: Boolean,
    menuItems: [menuItemSchema],
    textFieldWidth: Number,
    theme: String,
    size: String,
    options: String,
    radioItems: [radioButtonSchema],
    tabItems: [tabItemsSchema],
    columnItems: [columnItemsSchema],
    show: Boolean

    });


const formSchema = new mongoose.Schema({
    id: Number,
    form_title: String, 
    owner:  String, 
    components: [componentSchema],
    date_created: String,
    date_modified: String,
    status: String
})

const Form =  mongoose.model('Form', formSchema);

const formHistorySchema = new mongoose.Schema({
  id: Number,
  form_id: Number,
  version: Number,
  form_title: String, 
  components: [componentSchema],
  date_modified: String,
})

const FormHistory = mongoose.model('FormHistory', formHistorySchema)

// Route for file upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

//To Download File
app.get('/download/:filename', async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const file = await db.collection('uploads.files').findOne({ filename: req.params.filename });
    if (!file) {
      return res.status(404).send('File not found');
    }

    const chunks = await db.collection('uploads.chunks').find({ files_id: file._id }).toArray();
    const data = chunks.reduce((acc: any, chunk: any) => {
      acc.push(chunk.data.buffer);
      return acc;
    }, []);
    const fileData = Buffer.concat(data);

    const contentType = mime.contentType(file.contentType);
    const filename = file.filename;
    res.set('Content-Type', contentType);
    res.set('Content-Disposition', `attachment; filename="${filename}"`);

    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileData);
    readable.push(null);
    readable.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error');
  } 
});

app.use(urlencoded({
  extended: true
}))
app.use(json())


declare global {
  interface CustomError extends Error {
    status?: number
  }
}

async function encryptPassword(password: string): Promise<string>{
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password,salt);
  return hash
}

const getMaxVersionNumber = async (formId: string): Promise<number> => {
  const result = await FormHistory.findOne({ form_id: formId })
    .sort({ version: -1 })
    .select("version")
    .lean();

  return result ? result.version! + 1 : 1;
};

app.post('/api/form/',async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Form Post")
  const {id,form_title, owner, components, date_created, date_modified,status} = req.body

  if(!id || !form_title || !owner || !components || !date_created || !date_modified || !status){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  const newForm = new Form({
      id,form_title, owner, components, date_created, date_modified,status  
  })

  await newForm.save()

  res.status(201).send(newForm)

})


app.post('/api/formHistory/',async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside FormHistory Post")
  const {id,form_id, form_title, components, date_modified} = req.body
  console.log(req.body)
  if(!id || !form_id || !form_title || !components || !date_modified ){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  const nextVersionNumber = await getMaxVersionNumber(form_id);

  const newFormHistory = new FormHistory({
      id, form_id, form_title, components, date_modified,version: nextVersionNumber  
  })

  await newFormHistory.save()

  res.status(201).send(newFormHistory)

})

app.get('/api/form/show/:id', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get By Id Function");
  const {id} = req.params;
  console.log(id)
  Form.findOne({
    id: id,
    //  "components.menuItems": { $exists: true, $ne: [] },
    // "components.radioItems": { $exists: true, $ne: [] },
    // "components.tabItems": { $exists: true, $ne: [] },
    // "components.columnItems": { $exists: true, $ne: [] },
},

function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
    if (!val) {
      console.log(val)
      res.send("Data does not exist");
    } 
    else{
      res.send(val);
    }
  })
})


app.get('/api/formHistory/getByFormId/:formId', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get By Id Function");
  const {formId} = req.params;
  console.log(formId)
  FormHistory.find({
    form_id: formId,
},

function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
    if (!val) {
      console.log(val)
      res.send("Data does not exist");
    } 
    else{
      res.send(val);
    }
  })
})

app.get('/api/form/getFormName/:formName', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get FormName Function");
  const {formName} = req.params;

  Form.find({
    form_title: formName
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})

app.get('/api/form/getFormByOwner/:formOwner', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get Form by Owner Function");
  const {formOwner} = req.params;

  Form.find({ owner: formOwner},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})

app.get('/api/form/showAll/', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get All Forms Function");
  
  Form.find({
   
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})



app.put('/api/form/update/:id',async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Form Update Function")
  const {id} = req.params
  console.log(req.body)
  const {form_title, owner,components, date_created, date_modified,status} = req.body

  if(!id ){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  let updatedForm;
  
  try{
      const updatedForm = await Form.findOneAndUpdate(
          {
              id: id
          },
          {
              $set: { id,form_title,owner,components, date_created, date_modified,status} 
          },
          {
              new: true
          }
      )
  }catch(err){
      const error = new Error('Form cannot be updated') as CustomError
      error.status = 400 
      next(error)
  }
  res.status(200).send(updatedForm)
})



app.delete('/api/form/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Form Delete Function");
  const {id} = req.params;

  if(!id){
      const error = new Error('post id is required') as CustomError;
      error.status = 400
      next(error)
  }

  try{
      await Form.findOneAndRemove({ id: id})
  }catch(err){
      next(new Error('Form cannot be updated'))
  }

  res.status(200).json({success: true})
})



app.post("/api/signup", async (req, res) => {
  console.log("Inside User Post Function")
  try {
    const { userId,email, password, firstname, lastname } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await encryptPassword(password)
    console.log(hashedPassword)
    const newUser = new User({
      userId,
      email,
      password: hashedPassword,
      firstname,
      lastname,
    });

    await newUser.save();

    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
});



app.post('/api/signin', async (req, res) => {
  console.log("User Login Function")
  const { email, password } = req.body;
  
  try {
    // Find the user with the given email
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try{
        const isValid = await bcrypt.compare(password,user.password);
        console.log(isValid,"isValid")
        if (!isValid) {
          console.log("inside")
          return res.status(400).json({ message: 'Invalid password' });
        }else{
          const {_id, userId, firstname, lastname, email: userEmail } = user;
          return res.status(200).json({_id, userId, firstname,lastname, email: userEmail });
        }
      }
      catch(error){
        console.log(error);
        return false;
      }    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/user/getPassword/:user_id', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get Password Function");
  const {user_id} = req.params;
  console.log(user_id)
  User.findOne({
    userId: user_id
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})

app.put('/api/user/update-profile/:user_Id',async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside User Update Profile")
  const {user_Id} = req.params
  console.log(req.body)
  let {userId,firstname,lastname,email,password} = req.body

  if(!user_Id){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  let updatedForm;
  if(password){
    const hashedPassword = await encryptPassword(password)
    console.log("Changed Password",hashedPassword)
    password = hashedPassword
  }
  
  
  try{
      const updatedForm = await User.findOneAndUpdate(
          {
              userId: user_Id
          },
          {
              $set: { userId,firstname,lastname,email,password} 
          },
          {
              new: true
          }
      )
  }catch(err){
      const error = new Error('User profile cannot be updated') as CustomError
      error.status = 400 
      next(error)
  }
  res.status(200).send(updatedForm)
})


app.listen(4000, () => {
  console.log("On port 4000c");
});
